import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/lib/types';

interface KanbanState {
  boards: KanbanBoard[];
  addBoard: (board: KanbanBoard) => void;
  updateBoard: (id: string, updates: Partial<KanbanBoard>) => void;
  deleteBoard: (id: string) => void;
  getBoard: (id: string) => KanbanBoard | null;
  getBoardsByProject: (projectId: string) => KanbanBoard[];
  addCard: (boardId: string, columnId: string, card: KanbanCard) => void;
  updateCard: (boardId: string, cardId: string, updates: Partial<KanbanCard>) => void;
  moveCard: (boardId: string, cardId: string, targetColumnId: string, newOrder: number) => void;
  deleteCard: (boardId: string, cardId: string) => void;
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      boards: [],
      addBoard: (board) =>
        set((state) => ({ boards: [...state.boards, board] })),
      updateBoard: (id, updates) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === id ? { ...b, ...updates, updatedAt: new Date() } : b
          ),
        })),
      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((b) => b.id !== id),
        })),
      getBoard: (id) => {
        const state = get();
        return state.boards.find((b) => b.id === id) || null;
      },
      getBoardsByProject: (projectId) => {
        const state = get();
        return state.boards.filter((b) => b.projectId === projectId);
      },
      addCard: (boardId, columnId, card) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  columns: b.columns.map((col) =>
                    col.id === columnId
                      ? { ...col, cards: [...col.cards, card] }
                      : col
                  ),
                  updatedAt: new Date(),
                }
              : b
          ),
        })),
      updateCard: (boardId, cardId, updates) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  columns: b.columns.map((col) => ({
                    ...col,
                    cards: col.cards.map((card) =>
                      card.id === cardId
                        ? { ...card, ...updates, updatedAt: new Date() }
                        : card
                    ),
                  })),
                  updatedAt: new Date(),
                }
              : b
          ),
        })),
      moveCard: (boardId, cardId, targetColumnId, newOrder) =>
        set((state) => ({
          boards: state.boards.map((b) => {
            if (b.id !== boardId) return b;

            // Find the card in all columns
            let cardToMove: KanbanCard | null = null;
            let sourceColumnId = '';

            b.columns.forEach((col) => {
              const card = col.cards.find((c) => c.id === cardId);
              if (card) {
                cardToMove = card;
                sourceColumnId = col.id;
              }
            });

            if (!cardToMove) return b;

            // Remove card from source column and add to target column
            return {
              ...b,
              columns: b.columns.map((col) => {
                if (col.id === sourceColumnId) {
                  return {
                    ...col,
                    cards: col.cards.filter((c) => c.id !== cardId),
                  };
                }
                if (col.id === targetColumnId) {
                  const updatedCard = { ...cardToMove!, order: newOrder };
                  const newCards = [...col.cards, updatedCard].sort(
                    (a, b) => a.order - b.order
                  );
                  return { ...col, cards: newCards };
                }
                return col;
              }),
              updatedAt: new Date(),
            };
          }),
        })),
      deleteCard: (boardId, cardId) =>
        set((state) => ({
          boards: state.boards.map((b) =>
            b.id === boardId
              ? {
                  ...b,
                  columns: b.columns.map((col) => ({
                    ...col,
                    cards: col.cards.filter((c) => c.id !== cardId),
                  })),
                  updatedAt: new Date(),
                }
              : b
          ),
        })),
    }),
    {
      name: 'kanban-storage',
    }
  )
);
