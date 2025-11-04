'use client';

import React, { useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useKanbanStore } from '@/store/kanban-store';
import { useProjectStore } from '@/store/project-store';
import { generateMockKanbanBoard } from '@/lib/mock-data';
import { Kanban as KanbanIcon } from 'lucide-react';

export default function KanbanPage() {
  const { addBoard, getBoardsByProject } = useKanbanStore();
  const { currentProjectId } = useProjectStore();
  const initializedRef = useRef(false);

  const projectBoards = currentProjectId
    ? getBoardsByProject(currentProjectId)
    : [];

  useEffect(() => {
    // Create initial board if none exists and we haven't initialized yet
    if (currentProjectId && projectBoards.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      const mockBoard = generateMockKanbanBoard(currentProjectId);
      addBoard(mockBoard);
    }
  }, [currentProjectId, projectBoards.length, addBoard]);

  return (
    <MainLayout>
      <div className="h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold mb-2">Kanban Boards</h1>
          <p className="text-black">
            Manage your tasks with drag-and-drop Kanban boards
          </p>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-auto p-6">
          {projectBoards.length > 0 ? (
            <div className="space-y-8">
              {projectBoards.map((board) => (
                <div key={board.id}>
                  <h2 className="text-xl font-semibold mb-4">{board.name}</h2>
                  <KanbanBoard board={board} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-black">
                <KanbanIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>No boards found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
