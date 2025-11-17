# Giải thích cực kỳ chi tiết `server.js`

Tài liệu này giải thích **từng dòng, từng cú pháp** trong file `server.js`. Đọc song song với file code để thấy rõ mỗi ký tự hoạt động ra sao.

---

### Dòng 1
`import { WebSocketServer } from 'ws';`
- `import` là cú pháp ES Module để lấy code từ gói khác.
- `{ WebSocketServer }` nghĩa là chỉ lấy đúng symbol mang tên `WebSocketServer` trong module `ws`.
- `'ws'` là tên package WebSocket đã cài bằng npm.
- Dòng này giúp chúng ta có class `WebSocketServer` để tạo server WS.

### Dòng 2
`import { v4 as uuidv4 } from 'uuid';`
- Lấy hàm `v4` từ package `uuid`.
- `as uuidv4` đổi tên thành `uuidv4` để khi gọi dễ hiểu.

### Dòng 3
`import http from 'http';`
- Import default export của module lõi Node.js `http` (không cần cài thêm).
- Dùng để tạo HTTP server phục vụ file HTML và nâng cấp lên WebSocket.

### Dòng 4
`import fs from 'fs';`
- Module chuẩn `fs` (file system) dùng để đọc file `client.html`.

### Dòng 5
`import path from 'path';`
- Module chuẩn để thao tác đường dẫn (nối folder, chuẩn hóa dấu gạch chéo,...).

### Dòng 6
`import { fileURLToPath } from 'url';`
- Lấy hàm `fileURLToPath` từ module `url` để chuyển URL thành đường dẫn thực.

### Dòng 8
`const __filename = fileURLToPath(import.meta.url);`
- ES Module không có sẵn biến `__filename` như CommonJS nên phải tự tạo.
- `import.meta.url` trả về URL tuyệt đối của file hiện tại (vd: `file:///path/to/server.js`).
- `fileURLToPath` chuyển URL đó thành đường dẫn hệ điều hành (`/path/to/server.js`).

### Dòng 9
`const __dirname = path.dirname(__filename);`
- Lấy thư mục chứa file hiện tại bằng `path.dirname`.
- Từ đây ta có biến `__dirname` giống môi trường CommonJS.

### Dòng 11
`// Tạo HTTP server`
- Comment giải thích đoạn code phía dưới.

### Dòng 12
`const server = http.createServer((req, res) => {`
- Tạo HTTP server bằng `http.createServer`.
- Callback `(req, res)` chạy mỗi khi có HTTP request.
- `{` mở thân hàm xử lý request.

### Dòng 13
`  // Serve client.html`
- Comment: server sẽ trả file client.

### Dòng 14
`  if (req.url === '/' || req.url === '/index.html') {`
- Kiểm tra URL người dùng yêu cầu.
- `===` là so sánh tuyệt đối (cùng kiểu + giá trị).
- `||` là toán tử OR: chỉ cần một điều kiện đúng.

### Dòng 15
`    const filePath = path.join(__dirname, 'client.html');`
- Dùng `path.join` ghép thư mục hiện tại với tên file để tạo đường dẫn đầy đủ.

### Dòng 16
`    fs.readFile(filePath, (err, data) => {`
- Đọc file bất đồng bộ.
- Callback nhận `err` (nếu lỗi) và `data` (buffer nội dung file).

### Dòng 17
`      if (err) {`
- Nếu có lỗi đọc file.

### Dòng 18
`        res.writeHead(500);`
- Gửi HTTP status 500 (Internal Server Error).

### Dòng 19
`        res.end('Error loading client.html');`
- Kết thúc response kèm thông báo lỗi.

### Dòng 20
`      } else {`
- Nếu không lỗi thì chạy nhánh này.

### Dòng 21
`        res.writeHead(200, { 'Content-Type': 'text/html' });`
- Gửi HTTP status 200 và header xác nhận nội dung HTML.

### Dòng 22
`        res.end(data);`
- Trả toàn bộ nội dung file cho trình duyệt.

### Dòng 23
`      }`
- Đóng khối `if/else` bên trong `readFile`.

### Dòng 24
`    });`
- Kết thúc lời gọi `fs.readFile`.

### Dòng 25
`  } else {`
- Nếu người dùng truy cập URL khác `/` hoặc `/index.html`.

### Dòng 26
`    res.writeHead(404);`
- Trả HTTP status 404 (Not Found).

### Dòng 27
`    res.end('Not found');`
- Kết thúc response với thông báo "Not found".

### Dòng 28
`  }`
- Đóng khối `if` ở dòng 14.

### Dòng 29
`});`
- Đóng `createServer`.

### Dòng 31
`// Tạo WebSocket server`
- Comment giới thiệu khối tiếp theo.

### Dòng 32
`const wss = new WebSocketServer({ server });`
- Tạo WebSocket server bằng class vừa import.
- Truyền `{ server }` để tái sử dụng HTTP server và chia sẻ chung cổng 3000.

### Dòng 34
`// Lưu trữ thông tin clients`

### Dòng 35
`const clients = new Map(); // Map<ws, {id, username, room}>`
- Dùng `Map` để ánh xạ socket (`ws`) → thông tin user.
- Comment mô tả cấu trúc value.

### Dòng 36
`const rooms = new Map(); // Map<roomName, Set<ws>>`
- Mỗi room được biểu diễn bằng `Set` gồm các socket đang ở room đó.

### Dòng 38
`// Broadcast message đến tất cả clients trong một room`

### Dòng 39
`function broadcastToRoom(room, message, excludeWs = null) {`
- Định nghĩa hàm gửi tin vào room.
- `excludeWs` mặc định `null` để có thể bỏ qua chính người gửi khi cần.

### Dòng 40
`  const roomClients = rooms.get(room);`
- Lấy `Set` socket tương ứng tên room.

### Dòng 41
`  if (!roomClients) return;`
- Nếu room chưa tồn tại thì thoát (không làm gì).

### Dòng 43
`  const messageStr = JSON.stringify(message);`
- WebSocket gửi string, nên chuyển object → chuỗi JSON.

### Dòng 44-48
```
  roomClients.forEach((ws) => {
    if (ws !== excludeWs && ws.readyState === 1) { // 1 = OPEN
      ws.send(messageStr);
    }
  });
```
- Lặp qua từng socket.
- `ws.readyState === 1` nghĩa là kết nối đang mở (OPEN).
- Nếu socket không bị loại trừ và vẫn mở thì gửi message.

### Dòng 49
`}`
- Kết thúc hàm `broadcastToRoom`.

### Dòng 51-59
- `broadcastToAll` giống như trên nhưng lặp toàn bộ `clients` thay vì theo room.

### Dòng 61-77
- `getUsersInRoom(room)` tạo mảng `{ id, username }` bằng cách lặp Set room và đọc thông tin từ `clients` map.
- Trả về mảng để client cập nhật danh sách người online.

### Dòng 79
`// Xử lý khi có client kết nối`

### Dòng 80
`wss.on('connection', (ws, req) => {`
- Lắng nghe sự kiện WebSocket có kết nối mới.
- `ws` là WebSocket đại diện cho client; `req` là HTTP upgrade request (ít dùng).

### Dòng 81
`  const clientId = uuidv4();`
- Tạo ID ngẫu nhiên cho client.

### Dòng 82
``  console.log(`[${new Date().toLocaleTimeString()}] Client mới kết nối: ${clientId}`);``
- In log với thời gian hiện tại và ID giúp debug.

### Dòng 84-89 (gửi welcome)
```
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId: clientId,
    message: 'Kết nối thành công! Vui lòng chọn username và room.'
  }));
```
- Gửi JSON thông báo client đã kết nối thành công.
- `clientId: clientId` có thể viết ngắn thành `clientId` nhưng giữ nguyên cho dễ đọc.

### Dòng 91
`  // Xử lý messages từ client`

### Dòng 92-210 (listener message)
```
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      switch (message.type) {
        case 'join':
          // ...
          break;
        case 'message':
          // ...
          break;
        case 'typing':
          // ...
          break;
        case 'ping':
          // ...
          break;
        default:
          // ...
      }
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Lỗi xử lý message!'
      }));
    }
  });
```
- `ws.on('message', ...)` bắt mọi dữ liệu client gửi.
- `data.toString()` chuyển buffer → chuỗi; `JSON.parse` biến chuỗi → object.
- `switch` phân loại theo `message.type`:
  - `join`: destructuring `{ username, room }`, rời room cũ nếu có, thêm vào room mới, lưu thông tin vào `clients`, gửi `joined` cho chính họ, phát `user-joined` cho những người khác.
  - `message`: tạo object `messageToSend`, lặp `rooms.get(room)` và gửi cho TẤT CẢ socket (kể cả người gửi) để người gửi cũng thấy tin mình. Nếu chưa join room -> gửi lỗi.
  - `typing`: đọc `message.isTyping`, phát `type: 'typing'` cho các client khác trong cùng room (loại trừ người gửi).
  - `ping`: trả `{ type: 'pong' }` làm heartbeat.
  - `default`: bất kỳ `type` nào khác sẽ nhận lỗi `Loại message không hợp lệ!`.
- `catch`: nếu JSON parse lỗi hoặc bất kỳ lỗi nào khác, log ra console và báo `Lỗi xử lý message!`.

### Dòng 214-243 (listener close)
```
  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      const { username, room } = clientInfo;
      const roomClients = rooms.get(room);
      if (roomClients) {
        roomClients.delete(ws);
        if (roomClients.size === 0) {
          rooms.delete(room);
        } else {
          broadcastToRoom(room, {
            type: 'user-left',
            username: username,
            timestamp: new Date().toISOString(),
            users: getUsersInRoom(room)
          });
        }
      }
      clients.delete(ws);
      console.log(`[${new Date().toLocaleTimeString()}] ${username || clientId} đã ngắt kết nối`);
    }
  });
```
- Khi socket đóng, tìm lại thông tin client.
- Gỡ socket khỏi room, xóa room nếu không còn ai.
- Nếu room còn người, phát `user-left` kèm danh sách user mới.
- Xóa socket khỏi map `clients` và ghi log.

### Dòng 245-248 (listener error)
```
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
```
- Nếu socket phát sinh lỗi, log ra console.

### Dòng 249
`});`
- Đóng handler `wss.on('connection')`.

### Dòng 251-261 (heartbeat server → client)
```
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
```
- Mỗi 30 giây gửi `type: 'heartbeat'` tới tất cả socket đang mở.
- Giúp giữ kết nối luôn hoạt động và phát hiện client chết (client có thể trả `ping`).

### Dòng 263-271 (khởi động server)
```
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 WebSocket Server đang chạy tại:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   ws://localhost:${PORT}\n`);
  console.log(`📊 Thống kê real-time:`);
  console.log(`   - Clients: ${clients.size}`);
  console.log(`   - Rooms: ${rooms.size}\n`);
});
```
- `PORT` lấy từ biến môi trường, fallback 3000.
- `server.listen` mở cổng HTTP/WS.
- Callback log ra URL và thống kê ban đầu (đều 0).
- `\n` là ký tự xuống dòng.

### Dòng 274-279 (log thống kê mỗi phút)
```
setInterval(() => {
  if (clients.size > 0 || rooms.size > 0) {
    console.log(`📊 [${new Date().toLocaleTimeString()}] Clients: ${clients.size}, Rooms: ${rooms.size}`);
  }
}, 60000); // Mỗi phút
```
- Nếu có ít nhất một client hoặc room, sau mỗi 60 giây ghi log thống kê.
- Giúp quan sát số người dùng theo thời gian.

### Dòng 281
- File kết thúc; Node.js tiếp tục chạy vì server vẫn lắng nghe và có các `setInterval` hoạt động.

---

**Tóm tắt:** từng dòng trong `server.js` đã được giải thích chi tiết. Đọc tài liệu này song song với file code sẽ giúp bạn nắm trọn luồng hoạt động của server WebSocket real-time ngay cả khi đã lâu không đụng tới JavaScript.
