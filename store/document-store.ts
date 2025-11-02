import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DocumentPage, PageVersion } from '@/lib/types';

interface DocumentState {
  pages: DocumentPage[];
  addPage: (page: DocumentPage) => void;
  updatePage: (id: string, content: string, userId: string) => void;
  deletePage: (id: string) => void;
  getPage: (id: string) => DocumentPage | null;
  getPagesByProject: (projectId: string) => DocumentPage[];
  addVersion: (pageId: string, version: PageVersion) => void;
  restoreVersion: (pageId: string, versionId: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      pages: [],
      addPage: (page) =>
        set((state) => {
          // Prevent adding duplicate pages
          if (state.pages.some((p) => p.id === page.id)) {
            return state;
          }
          return { pages: [...state.pages, page] };
        }),
      updatePage: (id, content, userId) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id
              ? {
                  ...p,
                  content,
                  updatedAt: new Date(),
                  lastEditedBy: userId,
                }
              : p
          ),
        })),
      deletePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id),
        })),
      getPage: (id) => {
        const state = get();
        return state.pages.find((p) => p.id === id) || null;
      },
      getPagesByProject: (projectId) => {
        const state = get();
        return state.pages.filter((p) => p.projectId === projectId);
      },
      addVersion: (pageId, version) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId
              ? { ...p, versions: [...p.versions, version] }
              : p
          ),
        })),
      restoreVersion: (pageId, versionId) =>
        set((state) => ({
          pages: state.pages.map((p) => {
            if (p.id === pageId) {
              const version = p.versions.find((v) => v.id === versionId);
              if (version) {
                return {
                  ...p,
                  content: version.content,
                  updatedAt: new Date(),
                };
              }
            }
            return p;
          }),
        })),
    }),
    {
      name: 'document-storage-v2',
    }
  )
);
