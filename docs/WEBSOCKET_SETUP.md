# WebSocket Server Setup Guide

This guide explains how to set up and run the WebSocket server for real-time collaborative editing.

## Overview

The WebSocket server enables real-time collaboration features:
- Live cursor positions for each user
- Real-time document updates
- User presence tracking
- Multi-user editing with conflict resolution

## Running the Server

### Development Mode

You have two options:

#### Option 1: Run everything together

```bash
npm run dev:all
```

This runs both the Next.js dev server and the WebSocket server concurrently.

#### Option 2: Run servers separately

Terminal 1 - Next.js:
```bash
npm run dev
```

Terminal 2 - WebSocket Server:
```bash
npm run ws:dev
```

### Production Mode

For production, you'll need to run the WebSocket server as a separate process:

```bash
# Build the server
tsc --project tsconfig.server.json

# Run the compiled server
node dist/websocket.js
```

Consider using a process manager like PM2:

```bash
# Install PM2
npm install -g pm2

# Start the WebSocket server
pm2 start dist/websocket.js --name froncort-ws

# View logs
pm2 logs froncort-ws

# Stop the server
pm2 stop froncort-ws
```

## Configuration

### Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_WS_URL=wss://your-websocket-domain.com
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

### Port Configuration

The default WebSocket port is 3001. To change it, modify `server/websocket.ts`:

```typescript
createWebSocketServer(3002); // Your custom port
```

## WebSocket Events

### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `join-document` | Join a document room | `{ documentId: string, user: User }` |
| `leave-document` | Leave a document room | `{ documentId: string }` |
| `document-edit` | Send document changes | `{ documentId: string, changes: any, userId: string }` |
| `cursor-move` | Update cursor position | `{ documentId: string, position: any, userId: string }` |
| `selection-change` | Update text selection | `{ documentId: string, selection: any, userId: string }` |
| `heartbeat` | Keep connection alive | `{ documentId: string, userId: string }` |

### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `presence-state` | Initial presence state | `{ users: CollaborativeUser[], version: number }` |
| `user-joined` | User joined document | `{ socketId: string, user: User, timestamp: Date }` |
| `user-left` | User left document | `{ socketId: string, userId: string, timestamp: Date }` |
| `document-update` | Document was updated | `{ changes: any, userId: string, version: number, timestamp: Date }` |
| `cursor-update` | User's cursor moved | `{ socketId: string, userId: string, position: any }` |
| `selection-update` | User's selection changed | `{ socketId: string, userId: string, selection: any }` |

## Deployment

### Heroku

1. Add a `Procfile`:

```
web: npm start
ws: node dist/websocket.js
```

2. Deploy:

```bash
heroku create your-app-name
git push heroku main
heroku ps:scale web=1 ws=1
```

### AWS

Use EC2 or ECS to run the WebSocket server. Example with EC2:

1. Launch an EC2 instance
2. Install Node.js
3. Clone your repository
4. Install dependencies: `npm install`
5. Build the server: `npm run build`
6. Run with PM2: `pm2 start dist/websocket.js`
7. Configure security groups to allow WebSocket port

### Vercel + Separate WebSocket Server

Since Vercel doesn't support WebSockets natively:

1. Deploy Next.js app to Vercel as usual
2. Deploy WebSocket server separately (Railway, Render, etc.)
3. Update `NEXT_PUBLIC_WS_URL` to point to your WebSocket server

Example with Railway:

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Railway will automatically detect and run the WebSocket server

## Scaling Considerations

### Multiple WebSocket Servers

For high traffic, you'll need:

1. **Redis Adapter**: Share state across multiple WebSocket servers

```typescript
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

2. **Load Balancer**: Distribute connections with sticky sessions

```nginx
upstream websocket {
    ip_hash;  # Sticky sessions
    server ws1.example.com:3001;
    server ws2.example.com:3001;
}

server {
    listen 80;
    server_name ws.example.com;
    
    location / {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Database Integration

For persistence, integrate with Supabase:

```typescript
import { supabase } from '../lib/supabase';

// Save document changes to database
socket.on('document-edit', async (data) => {
  await supabase
    .from('documents')
    .update({ 
      content: data.changes,
      updated_at: new Date(),
      last_edited_by: data.userId
    })
    .eq('id', data.documentId);
});
```

## Monitoring

### Health Check Endpoint

Add a health check to your WebSocket server:

```typescript
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('OK');
  }
});
```

### Metrics to Track

- Active connections
- Messages per second
- Room sizes
- Latency
- Error rates

### Logging

Use a logging library for better insights:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });
});
```

## Troubleshooting

### Connection Refused

- Check that the WebSocket server is running
- Verify the port is not blocked by firewall
- Ensure the URL in `NEXT_PUBLIC_WS_URL` is correct

### CORS Issues

Update the CORS configuration in `server/websocket.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

### Disconnections

- Implement automatic reconnection on the client
- Increase heartbeat interval if needed
- Check for network issues

### High Memory Usage

- Implement connection limits
- Clean up stale connections
- Use Redis for state management

## Security

### Authentication

Verify user identity before allowing connections:

```typescript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (isValidToken(token)) {
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

### Rate Limiting

Prevent abuse:

```typescript
const rateLimit = new Map();

socket.on('document-edit', (data) => {
  const userId = data.userId;
  const now = Date.now();
  const userRequests = rateLimit.get(userId) || [];
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => now - time < 1000);
  
  if (recentRequests.length >= 10) {
    socket.emit('rate-limit', { message: 'Too many requests' });
    return;
  }
  
  recentRequests.push(now);
  rateLimit.set(userId, recentRequests);
  
  // Process the edit
  // ...
});
```

### SSL/TLS

For production, always use WSS (WebSocket Secure):

```typescript
import https from 'https';
import fs from 'fs';

const server = https.createServer({
  cert: fs.readFileSync('path/to/cert.pem'),
  key: fs.readFileSync('path/to/key.pem'),
});

const io = new Server(server);
```

## Testing

### Manual Testing

Use a WebSocket client tool:

```bash
# wscat
npm install -g wscat
wscat -c ws://localhost:3001
```

### Automated Testing

```typescript
import { io as Client } from 'socket.io-client';

describe('WebSocket Server', () => {
  let clientSocket;

  beforeAll((done) => {
    clientSocket = Client('http://localhost:3001');
    clientSocket.on('connect', done);
  });

  afterAll(() => {
    clientSocket.close();
  });

  test('should join document', (done) => {
    clientSocket.emit('join-document', {
      documentId: 'test-doc',
      user: { id: '1', name: 'Test User' }
    });
    
    clientSocket.on('presence-state', (data) => {
      expect(data).toBeDefined();
      done();
    });
  });
});
```

## Best Practices

1. **Implement Reconnection**: Handle network issues gracefully
2. **Use Heartbeats**: Keep connections alive
3. **Clean Up**: Remove stale connections and data
4. **Validate Data**: Always validate client input
5. **Log Events**: Track important events for debugging
6. **Monitor Performance**: Keep an eye on resource usage
7. **Scale Horizontally**: Use Redis adapter for multiple servers
8. **Secure Connections**: Use WSS in production
9. **Rate Limit**: Prevent abuse
10. **Test Thoroughly**: Test with multiple users

## Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
- [Real-time Collaboration Patterns](https://socket.io/docs/v4/adapter/)
