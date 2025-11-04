'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/main-layout';
import { useProjectStore } from '@/store/project-store';
import { useDocumentStore } from '@/store/document-store';
import { useKanbanStore } from '@/store/kanban-store';
import { useActivityStore } from '@/store/activity-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Kanban, 
  Activity as ActivityIcon, 
  ArrowRight,
  Users,
  Clock
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { projects, setCurrentProject } = useProjectStore();
  const { getPagesByProject } = useDocumentStore();
  const { getBoardsByProject } = useKanbanStore();
  const { getActivitiesByProject } = useActivityStore();

  const project = projects.find(p => p.id === projectId);
  
  // Memoize expensive store queries to prevent unnecessary recalculations
  const documents = React.useMemo(() => getPagesByProject(projectId), [projectId, getPagesByProject]);
  const boards = React.useMemo(() => getBoardsByProject(projectId), [projectId, getBoardsByProject]);
  const activities = React.useMemo(() => getActivitiesByProject(projectId), [projectId, getActivitiesByProject]);

  useEffect(() => {
    if (projectId) {
      setCurrentProject(projectId);
    }
  }, [projectId, setCurrentProject]);

  if (!project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project not found</h1>
            <Button onClick={() => router.push('/documents')}>
              Go to Documents
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mb-4">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{project.members?.length || 0} member{(project.members?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Documents Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/documents')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Documents</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Collaborative documentation with rich text editing
                </p>
                <div className="text-2xl font-bold text-blue-600">
                  {documents.length}
                </div>
                <p className="text-xs text-gray-500">
                  {documents.length === 1 ? 'document' : 'documents'}
                </p>
              </CardContent>
            </Card>

            {/* Kanban Boards Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/kanban')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Kanban size={24} className="text-green-600" />
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kanban Boards</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Task management with drag-and-drop boards
                </p>
                <div className="text-2xl font-bold text-green-600">
                  {boards.length}
                </div>
                <p className="text-xs text-gray-500">
                  {boards.length === 1 ? 'board' : 'boards'}
                </p>
              </CardContent>
            </Card>

            {/* Activity Feed Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/activity')}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <ActivityIcon size={24} className="text-purple-600" />
                  </div>
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Activity Feed</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Track all changes and updates in real-time
                </p>
                <div className="text-2xl font-bold text-purple-600">
                  {activities.length}
                </div>
                <p className="text-xs text-gray-500">
                  recent {activities.length === 1 ? 'activity' : 'activities'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
            <div className="bg-white rounded-lg border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Documents</h3>
                  <p className="text-3xl font-bold">{documents.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Kanban Boards</h3>
                  <p className="text-3xl font-bold">{boards.length}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Activities</h3>
                  <p className="text-3xl font-bold">{activities.slice(0, 10).length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2 text-blue-900">What&apos;s included in this project?</h2>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <FileText size={16} className="mt-1 flex-shrink-0" />
                <span><strong>Documents:</strong> Create and edit collaborative documents with rich text formatting, version history, and real-time collaboration.</span>
              </li>
              <li className="flex items-start gap-2">
                <Kanban size={16} className="mt-1 flex-shrink-0" />
                <span><strong>Kanban Boards:</strong> Organize tasks with drag-and-drop cards, assign team members, set due dates, and track progress.</span>
              </li>
              <li className="flex items-start gap-2">
                <ActivityIcon size={16} className="mt-1 flex-shrink-0" />
                <span><strong>Activity Feed:</strong> Monitor all project activities including document edits, card movements, and team member actions.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
