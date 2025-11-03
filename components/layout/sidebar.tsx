'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';
import { FileText, Kanban, Activity, FolderOpen, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProjectManager } from '@/components/project/project-manager';
import { supabase } from '@/lib/supabase';

function UserSection() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="p-4 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400 flex-1 min-w-0">
          <div className="font-medium text-white truncate">{user.name}</div>
          <div className="text-xs truncate">{user.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors ml-2"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { projects, currentProjectId, setCurrentProject } = useProjectStore();
  const currentProject = projects.find((p) => p.id === currentProjectId);
  const [showProjectManager, setShowProjectManager] = useState(false);

  const navigation = [
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
    },
    {
      name: 'Kanban',
      href: '/kanban',
      icon: Kanban,
    },
    {
      name: 'Activity',
      href: '/activity',
      icon: Activity,
    },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Logo / Brand */}
      <div className="p-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
            F
          </div>
          <span className="font-semibold text-lg">Froncort</span>
        </Link>
      </div>

      {/* Project Selector */}
      <div className="p-4 border-b border-gray-800">
        {currentProject ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FolderOpen size={16} />
                <span className="font-medium truncate">
                  {currentProject.name}
                </span>
              </div>
              <button
                onClick={() => setShowProjectManager(true)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Manage Projects"
              >
                <Settings size={16} />
              </button>
            </div>
            {projects.length > 1 && (
              <select
                value={currentProjectId || ''}
                onChange={(e) => setCurrentProject(e.target.value)}
                className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-700"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-400">
            <button
              onClick={() => setShowProjectManager(true)}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Create a project
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <UserSection />

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager onClose={() => setShowProjectManager(false)} />
      )}
    </div>
  );
}
