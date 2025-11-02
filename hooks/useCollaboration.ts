import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { User } from '@/lib/types';

interface CollaborativeUser {
  socketId: string;
  user: User;
  cursorPosition?: CursorPosition;
  selection?: TextSelection;
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

interface UseCollaborationOptions {
  documentId: string;
  user: User;
  enabled?: boolean;
  onUserJoined?: (data: { socketId: string; user: User; timestamp: Date }) => void;
  onUserLeft?: (data: { socketId: string; userId: string; timestamp: Date }) => void;
  onDocumentUpdate?: (data: { changes: DocumentChanges; userId: string; version: number; timestamp: Date }) => void;
  onCursorUpdate?: (data: { socketId: string; userId: string; position: CursorPosition }) => void;
  onSelectionUpdate?: (data: { socketId: string; userId: string; selection: TextSelection }) => void;
}

export function useCollaboration({
  documentId,
  user,
  enabled = true,
  onUserJoined,
  onUserLeft,
  onDocumentUpdate,
  onCursorUpdate,
  onSelectionUpdate,
}: UseCollaborationOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !documentId || !user) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!wsUrl) {
      console.warn('NEXT_PUBLIC_WS_URL not configured. Collaboration features will not work.');
      // Error state will be set by connect_error event
      return;
    }

    try {
      const socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        setError(null);
        
        // Join document room
        socket.emit('join-document', { documentId, user });
      });

      socket.on('connect_error', (err) => {
        console.error('Connection error:', err);
        setError('Failed to connect to collaboration server');
        setIsConnected(false);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      socket.on('presence-state', ({ users }) => {
        setActiveUsers(users);
      });

      socket.on('user-joined', (data) => {
        console.log('User joined:', data);
        setActiveUsers((prev) => [
          ...prev.filter((u) => u.user.id !== data.user.id),
          { socketId: data.socketId, user: data.user },
        ]);
        onUserJoined?.(data);
      });

      socket.on('user-left', (data) => {
        console.log('User left:', data);
        setActiveUsers((prev) => prev.filter((u) => u.user.id !== data.userId));
        onUserLeft?.(data);
      });

      socket.on('document-update', (data) => {
        onDocumentUpdate?.(data);
      });

      socket.on('cursor-update', (data) => {
        setActiveUsers((prev) =>
          prev.map((u) =>
            u.socketId === data.socketId
              ? { ...u, cursorPosition: data.position }
              : u
          )
        );
        onCursorUpdate?.(data);
      });

      socket.on('selection-update', (data) => {
        setActiveUsers((prev) =>
          prev.map((u) =>
            u.socketId === data.socketId
              ? { ...u, selection: data.selection }
              : u
          )
        );
        onSelectionUpdate?.(data);
      });

      // Send heartbeat every 30 seconds
      const heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('heartbeat', { documentId, userId: user.id });
        }
      }, 30000);

      return () => {
        clearInterval(heartbeatInterval);
        socket.emit('leave-document', { documentId });
        socket.disconnect();
      };
    } catch (err) {
      console.error('Error setting up collaboration:', err);
      // Error will be handled by connect_error event
    }
  }, [documentId, user, enabled, onUserJoined, onUserLeft, onDocumentUpdate, onCursorUpdate, onSelectionUpdate]);

  const sendEdit = useCallback((changes: DocumentChanges) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('document-edit', {
        documentId,
        changes,
        userId: user.id,
      });
    }
  }, [documentId, user]);

  const sendCursorPosition = useCallback((position: CursorPosition) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursor-move', {
        documentId,
        position,
        userId: user.id,
      });
    }
  }, [documentId, user]);

  const sendSelection = useCallback((selection: TextSelection) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('selection-change', {
        documentId,
        selection,
        userId: user.id,
      });
    }
  }, [documentId, user]);

  return {
    isConnected,
    activeUsers,
    error,
    sendEdit,
    sendCursorPosition,
    sendSelection,
  };
}
