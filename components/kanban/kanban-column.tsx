'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { KanbanColumn as KanbanColumnType } from '@/lib/types';
import { KanbanCardItem } from './kanban-card';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  boardId: string;
}

export function KanbanColumn({ column, boardId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <Card
        className={cn(
          'p-4 bg-gray-50 h-full',
          isOver && 'ring-2 ring-blue-500'
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">{column.title}</h3>
          <span className="text-sm text-black">
            {column.cards.length}
          </span>
        </div>

        <div ref={setNodeRef} className="space-y-3 min-h-[200px]">
          {column.cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <KanbanCardItem key={card.id} card={card} boardId={boardId} />
            ))}
        </div>
      </Card>
    </div>
  );
}
