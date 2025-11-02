import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Activity } from '@/lib/types';

interface ActivityState {
  activities: Activity[];
  addActivity: (activity: Activity) => void;
  getActivitiesByProject: (projectId: string) => Activity[];
  getActivitiesByUser: (userId: string) => Activity[];
  getActivitiesByResource: (resourceId: string) => Activity[];
  clearActivities: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      activities: [],
      addActivity: (activity) =>
        set((state) => ({
          activities: [activity, ...state.activities].slice(0, 1000), // Keep last 1000 activities
        })),
      getActivitiesByProject: (projectId) => {
        const state = get();
        return state.activities.filter((a) => a.projectId === projectId);
      },
      getActivitiesByUser: (userId) => {
        const state = get();
        return state.activities.filter((a) => a.userId === userId);
      },
      getActivitiesByResource: (resourceId) => {
        const state = get();
        return state.activities.filter((a) => a.resourceId === resourceId);
      },
      clearActivities: () => set({ activities: [] }),
    }),
    {
      name: 'activity-storage-v2',
    }
  )
);
