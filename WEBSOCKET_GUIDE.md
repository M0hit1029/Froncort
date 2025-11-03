# WebSocket Real-Time Collaboration Guide

This guide explains how the WebSocket server enables real-time collaboration features in Froncort.

## Overview

Froncort uses a WebSocket server (Socket.IO) to enable real-time collaboration features:
- Multiple users can edit documents simultaneously
- Live cursor positions and selections
- User presence tracking
- Real-time document updates

## Architecture

### WebSocket Server (`server/websocket.ts`)

The WebSocket server runs on port 3001 (by default) and handles:
- User connections and disconnections
- Document room management
- Presence tracking
- Real-time event broadcasting

### Client Hook (`hooks/useCollaboration.ts`)

The React hook manages WebSocket connections on the client side:
- Automatic connection management
- Reconnection handling
- Event emission and listening
- State management for active users

## How It Works

### 1. Connection Flow

```
User opens document → useCollaboration hook initializes → 
Socket connects to ws://localhost:3001 → 
User joins document room → 
Server broadcasts user presence to other users
```

### 2. Document Editing

```
User types → onChange handler fires → 
sendEdit() emits 'document-edit' event → 
Server broadcasts to all users in document room → 
Other users receive 'document-update' event → 
Document updates in real-time
```

### 3. Cursor Tracking

```
User moves cursor → onCursorMove handler fires → 
sendCursorPosition() emits 'cursor-move' event → 
Server broadcasts to other users → 
Cursor positions update in real-time
```

## Events

### Client → Server

- `join-document`: Join a document room
  ```typescript
  { documentId: string, user: User }
  ```

- `document-edit`: Send document changes
  ```typescript
  { documentId: string, changes: { content: string }, userId: string }
  ```

- `cursor-move`: Send cursor position
  ```typescript
  { documentId: string, position: CursorPosition, userId: string }
  ```

- `selection-change`: Send text selection
  ```typescript
  { documentId: string, selection: TextSelection, userId: string }
  ```

- `leave-document`: Leave a document room
  ```typescript
  { documentId: string }
  ```

- `heartbeat`: Keep connection alive
  ```typescript
  { documentId: string, userId: string }
  ```

### Server → Client

- `presence-state`: Initial user list when joining
  ```typescript
  { users: CollaborativeUser[], version: number }
  ```

- `user-joined`: A new user joined the document
  ```typescript
  { socketId: string, user: User, timestamp: Date }
  ```

- `user-left`: A user left the document
  ```typescript
  { socketId: string, userId: string, timestamp: Date }
  ```

- `document-update`: Document content changed
  ```typescript
  { changes: DocumentChanges, userId: string, version: number, timestamp: Date }
  ```

- `cursor-update`: User cursor position changed
  ```typescript
  { socketId: string, userId: string, position: CursorPosition }
  ```

- `selection-update`: User text selection changed
  ```typescript
  { socketId: string, userId: string, selection: TextSelection }
  ```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Server Configuration

The WebSocket server can be configured in `server/websocket.ts`:

```typescript
const STALE_CONNECTION_TIMEOUT = 60000; // 60 seconds
const CLEANUP_INTERVAL = 30000; // 30 seconds
const DEFAULT_PORT = 3001;
```

## Running the WebSocket Server

### Development

Start both servers together:
```bash
npm run dev:all
```

Or start separately:

Terminal 1 - Next.js:
```bash
npm run dev
```

Terminal 2 - WebSocket server:
```bash
npm run ws:dev
```

### Production

For production, you'll need to:

1. Deploy the WebSocket server separately (e.g., on a dedicated server or service)
2. Update `NEXT_PUBLIC_WS_URL` to point to your production WebSocket server
3. Configure CORS settings in `server/websocket.ts` to allow your production domain

## Testing Collaboration

To test real-time collaboration:

1. Start both servers (`npm run dev:all`)
2. Open the app in two browser windows or different browsers
3. Sign up with different email addresses in each browser
4. Create a project in one browser
5. Open the same document in both browsers
6. Start typing in one browser and watch it appear in the other

## Troubleshooting

### WebSocket not connecting

**Symptom**: Gray Wi-Fi icon, no real-time updates

**Solutions**:
- Ensure WebSocket server is running (`npm run ws:dev`)
- Check `NEXT_PUBLIC_WS_URL` in `.env.local`
- Verify port 3001 is not blocked by firewall
- Check browser console for connection errors

### Changes not appearing in other browsers

**Symptom**: Typing in one browser doesn't show in another

**Solutions**:
- Ensure both users are viewing the same document
- Check that both browsers show green Wi-Fi icon (connected)
- Verify WebSocket server console shows both connections
- Try refreshing both browsers

### Connection drops frequently

**Symptom**: Wi-Fi icon keeps switching between green and gray

**Solutions**:
- Check network stability
- Increase `STALE_CONNECTION_TIMEOUT` in `server/websocket.ts`
- Verify heartbeat mechanism is working
- Check for browser console errors

### CORS errors

**Symptom**: Browser console shows CORS errors

**Solutions**:
- Update CORS configuration in `server/websocket.ts`
- Ensure `NEXT_PUBLIC_APP_URL` matches your app's URL
- For development, ensure both servers are on localhost

## Security Considerations

### Current Implementation

The current implementation:
- ✅ Uses WebSocket secure connections (configurable)
- ✅ Validates user data on join
- ✅ Cleans up stale connections
- ✅ Implements heartbeat mechanism

### Recommendations for Production

1. **Authentication**: Add JWT token validation for WebSocket connections
2. **Authorization**: Verify user has permission to access document
3. **Rate Limiting**: Implement rate limiting for edit events
4. **Data Validation**: Validate all incoming data
5. **Encryption**: Use WSS (WebSocket Secure) in production
6. **Monitoring**: Add logging and monitoring for suspicious activity

## Advanced Features

### Conflict Resolution

The current implementation uses a simple last-write-wins strategy. For production, consider:
- Operational Transformation (OT)
- Conflict-free Replicated Data Types (CRDTs)
- Version vector for change tracking

### Scalability

For scaling beyond a single server:
- Use Redis for pub/sub between WebSocket servers
- Implement sticky sessions or shared presence store
- Consider dedicated collaboration service (e.g., Yjs, Automerge)

## Further Reading

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Real-time Collaboration Patterns](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
