'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useProjectStore } from '@/store/project-store';
import { CURRENT_USER, generateMockProject } from '@/lib/mock-data';

export default function Home() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const { projects, addProject, setCurrentProject } = useProjectStore();

  useEffect(() => {
    // Auto-login for demo
    if (!user) {
      login(CURRENT_USER);
    }

    // Create demo project if none exists
    if (projects.length === 0) {
      const mockProject = generateMockProject();
      addProject(mockProject);
      setCurrentProject(mockProject.id);
    }

    // Redirect to documents
    router.push('/documents');
  }, [user, projects, login, addProject, setCurrentProject, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Froncort...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  );
}
