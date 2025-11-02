'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanBoard as KanbanBoardType, KanbanCard } from '@/lib/types';
import { KanbanColumn } from './kanban-column';
import { KanbanCardItem } from './kanban-card';
import { useKanbanStore } from '@/store/kanban-store';

interface KanbanBoardProps {
  board: KanbanBoardType;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const moveCard = useKanbanStore((state) => state.moveCard);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const cardId = active.id as string;

    // Find the card being dragged
    for (const column of board.columns) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    const targetColumnId = over.id as string;

    // Check if we're dropping over a column
    const targetColumn = board.columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) return;

    // Calculate new order (add to end of column)
    const newOrder = targetColumn.cards.length;

    moveCard(board.id, cardId, targetColumnId, newOrder);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              boardId={board.id}
            />
          ))}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="opacity-50">
            <KanbanCardItem card={activeCard} boardId={board.id} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
