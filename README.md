## WebSocket Demo (Node.js)

This repository is a small sandbox to try the `ws` module with Node.js.  
It spins up a minimal HTTP server, upgrades connections to WebSocket, and serves a plain HTML client so you can click around and see messages flowing in real time. Nothing here is production ready; it is only a demo that you can extend or copy into other experiments.

---

## Requirements

- Node.js 18 or newer (uses native `fetch`, `watch`, and ESM)
- npm (ships with Node.js)

---

## Getting Started

```bash
# install dependencies
npm install

# start the demo server on http://localhost:3000
npm start

# optional: auto reload on file change (Node 18+)
npm run dev
```

Open a browser (or multiple tabs) at `http://localhost:3000` and start sending messages. The WebSocket endpoint lives at `ws://localhost:3000`.

---

## How to Use the Demo

1. Pick a display name and a room name. Rooms are created on the fly; type any string (e.g. `general`, `test`, `random`).
2. After joining, type into the input box and press Enter to broadcast to everyone in that room (including yourself).
3. The left panel lists online users in the current room, typing indicators appear when someone is writing, and the status dot shows connection health.

Because this is a basic demo, there is **no** persistence, authentication, rate limiting, or input validation beyond the essentials.

---

## Message Shapes

### Client → Server

```json
{ "type": "join", "username": "alice", "room": "general" }
{ "type": "message", "message": "hello world" }
{ "type": "typing", "isTyping": true }
{ "type": "ping" }
```

### Server → Client

```json
{ "type": "welcome", "clientId": "uuid", "message": "ready" }
{ "type": "joined", "room": "general", "users": [{ "id": "uuid", "username": "alice" }] }
{ "type": "message", "username": "alice", "message": "hello", "timestamp": "2024-01-01T12:00:00.000Z" }
{ "type": "user-joined", "username": "bob", "users": [...] }
{ "type": "user-left", "username": "alice", "users": [...] }
{ "type": "typing", "username": "bob", "isTyping": true }
{ "type": "heartbeat", "timestamp": "2024-01-01T12:00:00.000Z" }
```

These payloads are intentionally simple so you can modify them without digging through a framework.

---

## File Overview

| File | Purpose |
| ---- | ------- |
| `server.js` | HTTP + WebSocket server built with `ws`, plain Maps/Sets for sessions and rooms. |
| `client.html` | Static HTML + vanilla JS UI to test the socket events. |
| `SERVER_EXPLAIN.md` | Line-by-line walkthrough of `server.js` for quick reference. |

---

## Customizing Quickly

- **Change the port**: update `const PORT = process.env.PORT || 3000;` (or set `PORT=8080 npm start`).
- **Adjust heartbeat interval**: edit the `setInterval` near the bottom of `server.js`.
- **Add features**: duplicate the existing message types, add new cases in the `switch` statement, and update the client to emit/handle them.

---

## Disclaimer

This project exists purely for testing the WebSocket API surface in Node.js.  
Security, error handling, logging, build tooling, and code structure have been kept intentionally light so it is easier to read and modify during experiments. Use it as a starting point and adapt to your own needs.

