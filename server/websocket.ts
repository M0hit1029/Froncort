import { Server } from 'socket.io';
import { createServer } from 'http';

interface User {
  id: string;
  name: string;
  color: string;
  email: string;
}

interface CursorPosition {
  x: number;
  y: number;
  from: number;
  to: number;
}

interface TextSelection {
  from: number;
  to: number;
}

interface DocumentChanges {
  content: string;
  version?: number;
}

interface UserPresence {
  userId: string;
  user: User;
  documentId: string;
  cursorPosition?: CursorPosition;
  selection?: TextSelection;
  lastSeen: Date;
}

// Store active users and their presence
const presenceStore = new Map<string, Map<string, UserPresence>>();
const documentVersions = new Map<string, number>();

export function createWebSocketServer(port: number = 3001) {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-document', ({ documentId, user }: { documentId: string; user: User }) => {
      console.log(`User ${user.name} joining document ${documentId}`);
      socket.join(`doc:${documentId}`);
      
      if (!presenceStore.has(documentId)) {
        presenceStore.set(documentId, new Map());
      }
      
      const docPresence = presenceStore.get(documentId)!;
      docPresence.set(socket.id, {
        userId: user.id,
        user,
        documentId,
        lastSeen: new Date(),
      });

      const version = documentVersions.get(documentId) || 0;

      socket.to(`doc:${documentId}`).emit('user-joined', {
        socketId: socket.id,
        user,
        timestamp: new Date(),
      });

      const presenceList = Array.from(docPresence.values())
        .filter((p) => p.userId !== user.id)
        .map((p) => ({
          socketId: socket.id,
          user: p.user,
          cursorPosition: p.cursorPosition,
          selection: p.selection,
        }));

      socket.emit('presence-state', { users: presenceList, version });
    });

    socket.on('document-edit', (data: { documentId: string; changes: DocumentChanges; userId: string }) => {
      const { documentId, changes, userId } = data;
      const currentVersion = documentVersions.get(documentId) || 0;
      const newVersion = currentVersion + 1;
      documentVersions.set(documentId, newVersion);

      socket.to(`doc:${documentId}`).emit('document-update', {
        changes,
        userId,
        version: newVersion,
        timestamp: new Date(),
      });
    });

    socket.on('cursor-move', (data: { documentId: string; position: CursorPosition; userId: string }) => {
      const { documentId, position, userId } = data;
      const docPresence = presenceStore.get(documentId);
      if (docPresence) {
        const presence = docPresence.get(socket.id);
        if (presence) {
          presence.cursorPosition = position;
          presence.lastSeen = new Date();
        }
      }
      socket.to(`doc:${documentId}`).emit('cursor-update', {
        socketId: socket.id,
        userId,
        position,
      });
    });

    socket.on('selection-change', (data: { documentId: string; selection: TextSelection; userId: string }) => {
      const { documentId, selection, userId } = data;
      const docPresence = presenceStore.get(documentId);
      if (docPresence) {
        const presence = docPresence.get(socket.id);
        if (presence) {
          presence.selection = selection;
          presence.lastSeen = new Date();
        }
      }
      socket.to(`doc:${documentId}`).emit('selection-update', {
        socketId: socket.id,
        userId,
        selection,
      });
    });

    socket.on('leave-document', ({ documentId }: { documentId: string }) => {
      socket.leave(`doc:${documentId}`);
      const docPresence = presenceStore.get(documentId);
      if (docPresence) {
        const presence = docPresence.get(socket.id);
        if (presence) {
          socket.to(`doc:${documentId}`).emit('user-left', {
            socketId: socket.id,
            userId: presence.userId,
            timestamp: new Date(),
          });
          docPresence.delete(socket.id);
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      presenceStore.forEach((docPresence, documentId) => {
        const presence = docPresence.get(socket.id);
        if (presence) {
          socket.to(`doc:${documentId}`).emit('user-left', {
            socketId: socket.id,
            userId: presence.userId,
            timestamp: new Date(),
          });
          docPresence.delete(socket.id);
        }
      });
    });

    socket.on('heartbeat', ({ documentId }) => {
      const docPresence = presenceStore.get(documentId);
      if (docPresence) {
        const presence = docPresence.get(socket.id);
        if (presence) {
          presence.lastSeen = new Date();
        }
      }
    });
  });

  setInterval(() => {
    const now = Date.now();
    presenceStore.forEach((docPresence, documentId) => {
      docPresence.forEach((presence, socketId) => {
        if (now - presence.lastSeen.getTime() > 60000) {
          docPresence.delete(socketId);
          io.to(`doc:${documentId}`).emit('user-left', {
            socketId,
            userId: presence.userId,
            timestamp: new Date(),
          });
        }
      });
    });
  }, 30000);

  httpServer.listen(port, () => {
    console.log(`WebSocket server running on port ${port}`);
  });

  return { io, httpServer };
}

if (require.main === module) {
  createWebSocketServer();
}
