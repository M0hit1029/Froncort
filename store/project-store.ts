import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/lib/types';
import {
  fetchProjects,
  createProject as createProjectService,
  updateProject as updateProjectService,
  deleteProject as deleteProjectService,
  subscribeToProjects,
} from '@/lib/services/projects';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  loadProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  createProject: (
    name: string,
    description: string,
    visibility: 'public' | 'private',
    ownerId: string
  ) => Promise<{ success: boolean; error?: string; project?: Project }>;
  updateProject: (
    id: string,
    updates: Partial<{ name: string; description: string; visibility: 'public' | 'private' }>
  ) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (id: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentProject: (id: string) => void;
  getCurrentProject: () => Project | null;
  initializeRealtimeSubscription: () => () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      isLoading: false,
      error: null,

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        const { data, error } = await fetchProjects();
        
        if (error) {
          set({ isLoading: false, error: error.message });
          console.error('Failed to load projects:', error);
        } else {
          set({ projects: data || [], isLoading: false, error: null });
        }
      },

      addProject: (project) =>
        set((state) => {
          // Prevent adding duplicate projects
          if (state.projects.some((p) => p.id === project.id)) {
            return state;
          }
          return { projects: [...state.projects, project] };
        }),

      createProject: async (name, description, visibility, ownerId) => {
        set({ isLoading: true, error: null });
        const { data, error } = await createProjectService(
          name,
          description,
          visibility,
          ownerId
        );

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        if (data) {
          // Add to local state
          get().addProject(data);
          set({ isLoading: false, error: null });
          return { success: true, project: data };
        }

        return { success: false, error: 'Unknown error occurred' };
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        const { data, error } = await updateProjectService(id, updates);

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        if (data) {
          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? data : p)),
            isLoading: false,
            error: null,
          }));
          return { success: true };
        }

        return { success: false, error: 'Unknown error occurred' };
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        const { error } = await deleteProjectService(id);

        if (error) {
          set({ isLoading: false, error: error.message });
          return { success: false, error: error.message };
        }

        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId:
            state.currentProjectId === id ? null : state.currentProjectId,
          isLoading: false,
          error: null,
        }));

        return { success: true };
      },

      setCurrentProject: (id) => set({ currentProjectId: id }),

      getCurrentProject: () => {
        const state = get();
        return (
          state.projects.find((p) => p.id === state.currentProjectId) || null
        );
      },

      initializeRealtimeSubscription: () => {
        return subscribeToProjects(
          (project) => {
            // On insert - add to local store if not already present
            get().addProject(project);
          },
          (project) => {
            // On update - update in local store
            set((state) => ({
              projects: state.projects.map((p) =>
                p.id === project.id ? project : p
              ),
            }));
          },
          (id) => {
            // On delete - remove from local store
            set((state) => ({
              projects: state.projects.filter((p) => p.id !== id),
              currentProjectId:
                state.currentProjectId === id ? null : state.currentProjectId,
            }));
          }
        );
      },
    }),
    {
      name: 'project-storage-v3',
      // Don't persist loading and error state
      partialize: (state) => ({
        projects: state.projects,
        currentProjectId: state.currentProjectId,
      }),
      // Migrate from v2 to v3: add visibility and ownerId to existing projects
      migrate: (persistedState: unknown, version: number) => {
        if (version === 2) {
          const state = persistedState as { projects: Array<Partial<Project>>; currentProjectId: string | null };
          return {
            ...state,
            projects: state.projects.map((project) => ({
              ...project,
              visibility: project.visibility || 'private',
              ownerId: project.ownerId || project.members?.[0]?.userId || '',
            })),
          } as ProjectState;
        }
        return persistedState as ProjectState;
      },
      version: 3,
    }
  )
);
