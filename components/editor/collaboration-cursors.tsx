'use client';

import React from 'react';
import { User } from '@/lib/types';

interface CollaborativeCursor {
  socketId: string;
  user: User;
  cursorPosition?: { x: number; y: number; from: number; to: number };
  selection?: { from: number; to: number };
}

interface CollaborationCursorsProps {
  cursors: CollaborativeCursor[];
}

export function CollaborationCursors({ cursors }: CollaborationCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => {
        if (!cursor.cursorPosition) return null;

        return (
          <div
            key={cursor.socketId}
            className="absolute pointer-events-none z-50"
            style={{
              left: cursor.cursorPosition.x,
              top: cursor.cursorPosition.y,
            }}
          >
            {/* Cursor caret */}
            <div
              className="w-0.5 h-5 animate-pulse"
              style={{
                backgroundColor: cursor.user.color,
              }}
            />
            
            {/* User label */}
            <div
              className="text-xs px-2 py-1 rounded mt-1 whitespace-nowrap font-medium"
              style={{
                backgroundColor: cursor.user.color,
                color: '#ffffff',
              }}
            >
              {cursor.user.name}
            </div>

            {/* Selection highlight */}
            {cursor.selection && cursor.selection.from !== cursor.selection.to && (
              <div
                className="absolute opacity-30"
                style={{
                  backgroundColor: cursor.user.color,
                  top: 0,
                  left: 0,
                  // This would need proper calculation based on editor content
                  // For now, it's a placeholder
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}
