import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo HTTP server
const server = http.createServer((req, res) => {
  // Serve client.html
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'client.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading client.html');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Tạo WebSocket server
const wss = new WebSocketServer({ server });

// Lưu trữ thông tin clients
const clients = new Map(); // Map<ws, {id, username, room}>
const rooms = new Map(); // Map<roomName, Set<ws>>

// Broadcast message đến tất cả clients trong một room
function broadcastToRoom(room, message, excludeWs = null) {
  const roomClients = rooms.get(room);
  if (!roomClients) return;

  const messageStr = JSON.stringify(message);
  roomClients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) { // 1 = OPEN
      ws.send(messageStr);
    }
  });
}

// Broadcast message đến tất cả clients
function broadcastToAll(message, excludeWs = null) {
  const messageStr = JSON.stringify(message);
  clients.forEach((clientInfo, ws) => {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(messageStr);
    }
  });
}

// Lấy danh sách users trong room
function getUsersInRoom(room) {
  const roomClients = rooms.get(room);
  if (!roomClients) return [];

  const users = [];
  roomClients.forEach((ws) => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      users.push({
        id: clientInfo.id,
        username: clientInfo.username
      });
    }
  });
  return users;
}

// Xử lý khi có client kết nối
wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  console.log(`[${new Date().toLocaleTimeString()}] Client mới kết nối: ${clientId}`);

  // Gửi welcome message với client ID
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId: clientId,
    message: 'Kết nối thành công! Vui lòng chọn username và room.'
  }));

  // Xử lý messages từ client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'join':
          // Client join room
          const { username, room } = message;
          
          // Xóa client khỏi room cũ nếu có
          const oldClientInfo = clients.get(ws);
          if (oldClientInfo && oldClientInfo.room) {
            const oldRoom = rooms.get(oldClientInfo.room);
            if (oldRoom) {
              oldRoom.delete(ws);
              if (oldRoom.size === 0) {
                rooms.delete(oldClientInfo.room);
              }
            }
            // Thông báo user rời room
            broadcastToRoom(oldClientInfo.room, {
              type: 'user-left',
              username: oldClientInfo.username,
              timestamp: new Date().toISOString()
            });
          }

          // Thêm client vào room mới
          if (!rooms.has(room)) {
            rooms.set(room, new Set());
          }
          rooms.get(room).add(ws);

          // Lưu thông tin client
          clients.set(ws, {
            id: clientId,
            username: username,
            room: room
          });

          // Thông báo cho client
          ws.send(JSON.stringify({
            type: 'joined',
            room: room,
            users: getUsersInRoom(room)
          }));

          // Thông báo cho các client khác trong room
          broadcastToRoom(room, {
            type: 'user-joined',
            username: username,
            clientId: clientId,
            timestamp: new Date().toISOString(),
            users: getUsersInRoom(room)
          }, ws);

          console.log(`[${new Date().toLocaleTimeString()}] ${username} đã join room: ${room}`);
          break;

        case 'message':
          // Broadcast message trong room (bao gồm cả người gửi)
          const clientInfo = clients.get(ws);
          if (clientInfo && clientInfo.room) {
            const messageToSend = {
              type: 'message',
              username: clientInfo.username,
              message: message.message,
              timestamp: new Date().toISOString()
            };
            
            // Gửi đến TẤT CẢ clients trong room, bao gồm cả người gửi
            const roomClients = rooms.get(clientInfo.room);
            if (roomClients) {
              const messageStr = JSON.stringify(messageToSend);
              roomClients.forEach((clientWs) => {
                if (clientWs.readyState === 1) { // 1 = OPEN
                  clientWs.send(messageStr);
                }
              });
            }

            console.log(`[${new Date().toLocaleTimeString()}] ${clientInfo.username} trong ${clientInfo.room}: ${message.message}`);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Bạn chưa join room nào!'
            }));
          }
          break;

        case 'typing':
          // Thông báo đang gõ
          const typingClientInfo = clients.get(ws);
          if (typingClientInfo && typingClientInfo.room) {
            broadcastToRoom(typingClientInfo.room, {
              type: 'typing',
              username: typingClientInfo.username,
              isTyping: message.isTyping
            }, ws);
          }
          break;

        case 'ping':
          // Heartbeat để giữ kết nối
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Loại message không hợp lệ!'
          }));
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Lỗi xử lý message!'
      }));
    }
  });

  // Xử lý khi client ngắt kết nối
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    
    if (clientInfo) {
      const { username, room } = clientInfo;
      
      // Xóa client khỏi room
      const roomClients = rooms.get(room);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(room);
        } else {
          // Thông báo user đã rời
          broadcastToRoom(room, {
            type: 'user-left',
            username: username,
            timestamp: new Date().toISOString(),
            users: getUsersInRoom(room)
          });
        }
      }

      // Xóa client khỏi danh sách
      clients.delete(ws);
      
      console.log(`[${new Date().toLocaleTimeString()}] ${username || clientId} đã ngắt kết nối`);
    }
  });

  // Xử lý lỗi
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Heartbeat để kiểm tra kết nối
setInterval(() => {
  clients.forEach((clientInfo, ws) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      }));
    }
  });
}, 30000); // Mỗi 30 giây

// Khởi động server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 WebSocket Server đang chạy tại:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   ws://localhost:${PORT}\n`);
  console.log(`📊 Thống kê real-time:`);
  console.log(`   - Clients: ${clients.size}`);
  console.log(`   - Rooms: ${rooms.size}\n`);
});

// Cập nhật thống kê định kỳ
setInterval(() => {
  if (clients.size > 0 || rooms.size > 0) {
    console.log(`📊 [${new Date().toLocaleTimeString()}] Clients: ${clients.size}, Rooms: ${rooms.size}`);
  }
}, 60000); // Mỗi phút

