'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { KanbanCard } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKanbanStore } from '@/store/kanban-store';
import { Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KanbanCardItemProps {
  card: KanbanCard;
  boardId: string;
}

export function KanbanCardItem({ card, boardId }: KanbanCardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const updateCard = useKanbanStore((state) => state.updateCard);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: card.id,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const handleSave = () => {
    updateCard(boardId, card.id, { title, description });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(card.title);
    setDescription(card.description);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-opacity',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-4">
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Card title"
                className="font-medium"
              />
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description..."
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1 bg-gray-200 text-black rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => setIsEditing(true)}>
              <h4 className="font-medium mb-2">{card.title}</h4>
              {card.description && (
                <p className="text-sm text-black mb-3">
                  {card.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {card.labels.map((label) => (
                  <span
                    key={label.id}
                    className="px-2 py-1 text-xs rounded"
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-black">
                {card.assigneeId && (
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span className="text-xs">Assigned</span>
                  </div>
                )}
                {card.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span className="text-xs">
                      {new Date(card.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
