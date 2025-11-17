# 🚀 WebSocket Real-time Server với Node.js

Dự án WebSocket server với đầy đủ tính năng real-time, hỗ trợ chat, rooms, presence tracking và nhiều tính năng khác.

## ✨ Tính năng Real-time

- ✅ **Real-time Messaging**: Gửi và nhận tin nhắn tức thời
- ✅ **Room/Channel Support**: Tạo và tham gia các room riêng biệt
- ✅ **User Presence**: Theo dõi người dùng online/offline
- ✅ **Typing Indicators**: Hiển thị khi ai đó đang gõ
- ✅ **Connection Status**: Hiển thị trạng thái kết nối real-time
- ✅ **Auto Reconnect**: Tự động kết nối lại khi mất kết nối
- ✅ **Heartbeat**: Giữ kết nối sống với ping/pong
- ✅ **Broadcasting**: Gửi message đến nhiều clients cùng lúc

## 📋 Yêu cầu

- Node.js >= 18.0.0
- npm hoặc yarn

## 🛠️ Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Khởi động server:**
```bash
npm start
```

Hoặc chạy với auto-reload (cần Node.js 18+):
```bash
npm run dev
```

3. **Mở trình duyệt:**
```
http://localhost:3000
```

## 🎯 Cách sử dụng

### 1. Kết nối WebSocket

Server sẽ tự động tạo WebSocket server tại `ws://localhost:3000`

### 2. Join Room

- Nhập **username** của bạn
- Nhập **tên room** (ví dụ: "general", "tech", "random")
- Click **Join Room**

### 3. Chat Real-time

- Gõ tin nhắn và nhấn Enter hoặc click **Gửi**
- Tin nhắn sẽ được broadcast đến tất cả users trong cùng room
- Xem danh sách users online ở panel phía trên

### 4. Tính năng Real-time

- **Typing Indicator**: Khi bạn gõ, các users khác sẽ thấy "đang gõ..."
- **User Join/Leave**: Thông báo khi có user mới join hoặc rời room
- **Connection Status**: Indicator màu xanh khi đã kết nối, đỏ khi mất kết nối

## 📡 WebSocket Message Types

### Client → Server

#### Join Room
```json
{
  "type": "join",
  "username": "john",
  "room": "general"
}
```

#### Send Message
```json
{
  "type": "message",
  "message": "Hello everyone!"
}
```

#### Typing Indicator
```json
{
  "type": "typing",
  "isTyping": true
}
```

#### Heartbeat
```json
{
  "type": "ping"
}
```

### Server → Client

#### Welcome
```json
{
  "type": "welcome",
  "clientId": "uuid",
  "message": "Kết nối thành công!"
}
```

#### Joined
```json
{
  "type": "joined",
  "room": "general",
  "users": [
    {"id": "uuid1", "username": "john"},
    {"id": "uuid2", "username": "jane"}
  ]
}
```

#### Message
```json
{
  "type": "message",
  "username": "john",
  "message": "Hello!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### User Joined
```json
{
  "type": "user-joined",
  "username": "jane",
  "clientId": "uuid",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "users": [...]
}
```

#### User Left
```json
{
  "type": "user-left",
  "username": "john",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "users": [...]
}
```

#### Typing
```json
{
  "type": "typing",
  "username": "john",
  "isTyping": true
}
```

#### Heartbeat
```json
{
  "type": "heartbeat",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🏗️ Kiến trúc

### Server (`server.js`)

- **WebSocket Server**: Sử dụng thư viện `ws`
- **Client Management**: Quản lý clients với Map
- **Room Management**: Quản lý rooms và users trong mỗi room
- **Broadcasting**: Gửi message đến nhiều clients
- **Heartbeat**: Giữ kết nối sống mỗi 30 giây

### Client (`client.html`)

- **WebSocket Client**: Kết nối đến server
- **UI Real-time**: Cập nhật giao diện tức thời
- **Auto Reconnect**: Tự động kết nối lại khi mất kết nối
- **Typing Detection**: Phát hiện khi user đang gõ

## 🔧 Tùy chỉnh

### Thay đổi Port

Sửa trong `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Thay đổi port ở đây
```

Hoặc dùng environment variable:
```bash
PORT=8080 npm start
```

### Thay đổi Heartbeat Interval

Sửa trong `server.js`:
```javascript
setInterval(() => {
  // Heartbeat code
}, 30000); // Thay đổi 30000 (30 giây) thành giá trị khác
```

## 📦 Dependencies

- **ws**: WebSocket library cho Node.js
- **uuid**: Tạo unique ID cho clients

## 🚀 Mở rộng

Bạn có thể mở rộng thêm các tính năng:

1. **Private Messages**: Gửi tin nhắn riêng giữa 2 users
2. **File Sharing**: Upload và share files
3. **Voice/Video**: Tích hợp WebRTC
4. **Database**: Lưu lịch sử chat vào database
5. **Authentication**: Thêm JWT authentication
6. **Rate Limiting**: Giới hạn số lượng messages
7. **Moderation**: Quản lý và kiểm duyệt nội dung

## 🐛 Troubleshooting

### Lỗi kết nối

- Kiểm tra port có bị chiếm không: `lsof -i :3000`
- Kiểm tra firewall settings
- Đảm bảo Node.js version >= 18

### Tin nhắn không hiển thị

- Kiểm tra console browser để xem lỗi
- Đảm bảo đã join room trước khi gửi message
- Kiểm tra WebSocket connection status

## 📝 License

MIT

## 👨‍💻 Tác giả

Tạo bởi với ❤️ cho real-time applications

---

**Happy Coding! 🎉**

