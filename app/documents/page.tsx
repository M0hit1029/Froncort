'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { TipTapEditor } from '@/components/editor/tiptap-editor';
import { useDocumentStore } from '@/store/document-store';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';
import { useActivityStore } from '@/store/activity-store';
import { generateMockPage } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Clock, Users } from 'lucide-react';
import { DocumentPage } from '@/lib/types';

export default function DocumentsPage() {
  const { pages, addPage, updatePage, getPagesByProject } = useDocumentStore();
  const { currentProjectId } = useProjectStore();
  const { user } = useAuthStore();
  const { addActivity } = useActivityStore();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const projectPages = currentProjectId
    ? getPagesByProject(currentProjectId)
    : [];

  useEffect(() => {
    // Create initial page if none exists
    if (currentProjectId && projectPages.length === 0) {
      const mockPage = generateMockPage(currentProjectId);
      addPage(mockPage);
      setSelectedPageId(mockPage.id);
    } else if (projectPages.length > 0 && !selectedPageId) {
      setSelectedPageId(projectPages[0].id);
    }
  }, [currentProjectId, projectPages.length, addPage, selectedPageId]);

  const selectedPage = projectPages.find((p) => p.id === selectedPageId);

  const handleContentChange = (content: string) => {
    if (selectedPageId && user) {
      updatePage(selectedPageId, content, user.id);
      setLastSaved(new Date());

      // Add activity
      if (currentProjectId) {
        addActivity({
          id: `activity-${Date.now()}`,
          type: 'page_edited',
          userId: user.id,
          projectId: currentProjectId,
          resourceId: selectedPageId,
          resourceType: 'page',
          description: `edited ${selectedPage?.title || 'a page'}`,
          createdAt: new Date(),
        });
      }
    }
  };

  const handleCreatePage = () => {
    if (!currentProjectId || !user) return;

    const newPage: DocumentPage = {
      id: `page-${Date.now()}`,
      projectId: currentProjectId,
      title: 'Untitled Page',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Untitled Page' }],
          },
        ],
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
      lastEditedBy: user.id,
      versions: [],
    };

    addPage(newPage);
    setSelectedPageId(newPage.id);

    // Add activity
    addActivity({
      id: `activity-${Date.now()}`,
      type: 'page_created',
      userId: user.id,
      projectId: currentProjectId,
      resourceId: newPage.id,
      resourceType: 'page',
      description: 'created a new page',
      createdAt: new Date(),
    });
  };

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Pages Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <Button onClick={handleCreatePage} className="w-full" size="sm">
              <Plus size={16} className="mr-2" />
              New Page
            </Button>
          </div>

          <div className="p-2">
            {projectPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPageId(page.id)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${
                  selectedPageId === page.id
                    ? 'bg-blue-50 text-blue-900 font-medium'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span className="truncate">{page.title}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPage ? (
            <>
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <h1 className="text-2xl font-bold mb-2">
                  {selectedPage.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {lastSaved
                        ? `Saved ${lastSaved.toLocaleTimeString()}`
                        : 'Auto-saving...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>1 person editing</span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                  <TipTapEditor
                    content={selectedPage.content}
                    onChange={handleContentChange}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select a page or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
