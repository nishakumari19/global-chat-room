# Real-Time Global Chat Application

A full-stack, real-time single-room chat application built with **React**, **Node.js + Express**, **Socket.io**, and **MongoDB (Mongoose)**. Designed with a sleek Stitch-inspired dark interface, instant live message broadcasting, online presence tracking, typing indicators, and message history persistence.

---

## Live Demo

- **App:** https://global-chat-room-ten.vercel.app
- **API:** [Live API](https://global-chat-room.onrender.com)

---

---

## Project Structure

The project is structured into two independently deployable services:

```text
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # Mongoose connection & fallback logic
│   │   ├── controllers/
│   │   │   └── messageController.ts    # REST controllers for GET & POST /api/messages
│   │   ├── models/
│   │   │   └── Message.ts              # Mongoose Message schema & TypeScript interface
│   │   ├── routes/
│   │   │   └── messageRoutes.ts        # Express router for /api/messages
│   │   ├── sockets/
│   │   │   └── chatSocket.ts           # Socket.io events: messages, typing, presence
│   │   └── server.ts                   # Standalone Express + Socket.io server
│   ├── .env.example                    # Backend environment variable template
│   └── package.json                    # Backend dependencies & deployment scripts
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── JoinScreen.tsx          # Handle selection screen
│   │   │   ├── ChatScreen.tsx          # Main global chat room layout & header
│   │   │   ├── MessageList.tsx         # Scrollable message history with auto-scroll
│   │   │   ├── MessageBubble.tsx       # Sender styling, alignment, and timestamps
│   │   │   ├── MessageInput.tsx        # Plain input bar & single typing indicator
│   │   │   └── OnlineUsersPanel.tsx    # Live presence panel with active dots
│   │   ├── hooks/
│   │   │   └── useChat.ts              # Unified React hook for chat, sockets & state
│   │   ├── services/
│   │   │   ├── apiService.ts           # REST API client for message history
│   │   │   └── socketService.ts        # Real-time Socket.io client service
│   │   ├── types.ts                    # TypeScript models and interfaces
│   │   ├── App.tsx                     # Frontend entry component
│   │   └── main.tsx                    # React DOM bootstrap
│   ├── .env.example                    # Frontend environment variable template
│   └── package.json                    # Frontend dependencies & build script
│
├── index.html                          # Frontend HTML entry point
├── vite.config.ts                      # Vite build configuration
├── tsconfig.json                       # TypeScript configuration
└── README.md                           # Documentation & setup guide
```

---

## Required Environment Variables

All secrets and connection strings are strictly managed via environment variables. **No hardcoded secrets exist anywhere in the code.**

### Backend (`/backend/.env`)

| Variable | Description | Example / Placeholder |
| :--- | :--- | :--- |
| `MONGO_URI` | MongoDB Atlas connection string | `your_mongodb_connection_string_here` |
| `PORT` | Port for the Express server to listen on | `5000` |
| `CLIENT_URL` | Allowed origin for CORS (e.g. Vercel deployment URL) | `your_frontend_url_here` |

### Frontend (`/frontend/.env`)

| Variable | Description | Example / Placeholder |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | Base URL of deployed Render backend | `your_backend_url_here` |

---

## Local Setup & Development

### Prerequisites
- Node.js (v18 or later)
- npm or pnpm
- MongoDB Atlas account (or local MongoDB instance)

---

### Running Backend Locally

1. Navigate to the backend directory:
```bash
   cd backend
```
2. Install dependencies:
```bash
   npm install
```
3. Create your `.env` file from the template:
```bash
   cp .env.example .env
```
   Set `MONGO_URI` to your MongoDB connection string and `PORT=5000`.
4. Start the backend development server:
```bash
   npm run dev
```
   The backend will start on `http://localhost:5000` with REST endpoints on `/api/messages` and Socket.io listening on the same port.

---

### Running Frontend Locally

1. Navigate to the frontend directory:
```bash
   cd frontend
```
2. Install dependencies:
```bash
   npm install
```
3. Create your `.env` file:
```bash
   cp .env.example .env
```
   Set `VITE_BACKEND_URL=http://localhost:5000`.
4. Start Vite:
```bash
   npm run dev
```
5. Open your browser at `http://localhost:5173`.

---

## Design Decisions & Architectural Choices

1. **Build Order Priority**:
   - The core message pipeline (REST history fetch on load, instant socket emission & broadcast, timestamp sorting) was implemented and validated as the foundation.
   - The typing indicator and live presence tracking were layered cleanly on top of this stable message flow.

2. **Single Global Room**:
   - Built specifically as a single shared global chat room without multi-room or multi-channel overhead.

3. **Dummy Authentication**:
   - Authentication is lightweight and client-centric as specified: handles are picked on the Join screen, persisted to `localStorage` / React state, and associated with socket connections without complex passwords or session tokens.

4. **Online Status Reflects Live Connections Only**:
   - Online status reflects live socket connections only; there's no persistent user list, so a disconnected user is removed from the panel rather than shown as offline, which fits the dummy-auth, no-accounts design.

5. **Zero AI Slop / Frontend Design Constitution**:
   - Avoided pill-shaped boxes for static metadata (timestamps, usernames, status).
   - Crisp, high-contrast dark theme using `zinc-950`/`zinc-900` with vibrant emerald accents (`#10b981`).
   - Clean typographic separators (`·`).
   - Message bubbles clearly differentiated: current user is right-aligned in emerald; other users are left-aligned in neutral dark slate with author handle above.

6. **Single Typing Indicator Location**:
   - The typing state is rendered strictly in one dedicated location: a single line directly above the message input bar (`@username is typing...`). It is not duplicated in the sidebar or across multiple UI elements.

7. **Reliable Graceful Fallback**:
   - If `MONGO_URI` is not yet configured or is in placeholder state during initial setup/testing, the database configuration seamlessly logs a descriptive notice and utilizes an in-memory repository with the identical interface, preventing startup crashes while awaiting Atlas credentials.

## Assumptions Made
- Single global chat room only; no multi-room or channel support, as this wasn't part of the required scope.
- Username-based dummy authentication is sufficient, per the assignment's own bonus wording — no password or session-token based login was implemented.
- Message read/delivered status was not implemented, as this is ambiguous for a broadcast-style group room without 1:1 threads.

## Known Limitations
- Single instance only: presence tracking and Socket.io rooms live in-process memory, so this won't work correctly across multiple server instances without adding Redis.
- Render's free tier spins down after inactivity; the first request after idle time may take 20–50 seconds to respond while the instance wakes up.
