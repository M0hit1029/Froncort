'use client';

import React from 'react';
import { User } from '@/lib/types';
import { Users } from 'lucide-react';

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

interface ActiveUser {
  socketId: string;
  user: User;
  cursorPosition?: CursorPosition;
  selection?: TextSelection;
}

interface ActiveUsersProps {
  users: ActiveUser[];
  isConnected: boolean;
}

export function ActiveUsers({ users, isConnected }: ActiveUsersProps) {
  const totalUsers = users.length + 1; // +1 for current user

  return (
    <div className="flex items-center gap-2 text-sm">
      <Users size={14} />
      <span>
        {isConnected ? (
          <>
            {totalUsers} {totalUsers === 1 ? 'person' : 'people'} editing
          </>
        ) : (
          'Offline mode'
        )}
      </span>
      
      {users.length > 0 && (
        <div className="flex items-center gap-1 ml-2">
          {users.map((activeUser) => (
            <div
              key={activeUser.socketId}
              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${activeUser.user.color}20`,
                color: activeUser.user.color,
                border: `1px solid ${activeUser.user.color}`,
              }}
              title={activeUser.user.name}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeUser.user.color }}
              />
              {activeUser.user.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
