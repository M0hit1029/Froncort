import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/lib/types';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string) => void;
  getCurrentProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      addProject: (project) =>
        set((state) => {
          // Prevent adding duplicate projects
          if (state.projects.some((p) => p.id === project.id)) {
            return state;
          }
          return { projects: [...state.projects, project] };
        }),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId:
            state.currentProjectId === id ? null : state.currentProjectId,
        })),
      setCurrentProject: (id) => set({ currentProjectId: id }),
      getCurrentProject: () => {
        const state = get();
        return (
          state.projects.find((p) => p.id === state.currentProjectId) || null
        );
      },
    }),
    {
      name: 'project-storage-v2',
    }
  )
);
