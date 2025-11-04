'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FolderOpen, Trash2, CheckCircle, AlertCircle, Globe, Lock } from 'lucide-react';

interface ProjectManagerProps {
  onClose: () => void;
}

export function ProjectManager({ onClose }: ProjectManagerProps) {
  const { projects, createProject, deleteProject: deleteProjectFromStore, setCurrentProject, loadProjects } = useProjectStore();
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectVisibility, setNewProjectVisibility] = useState<'public' | 'private'>('private');
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;

    setIsCreating(true);
    setMessage(null);

    const result = await createProject(
      newProjectName,
      newProjectDescription,
      newProjectVisibility,
      user.id
    );

    setIsCreating(false);

    if (result.success && result.project) {
      setMessage({ type: 'success', text: 'Project created successfully!' });
      setCurrentProject(result.project.id);
      setNewProjectName('');
      setNewProjectDescription('');
      setNewProjectVisibility('private');
      setShowCreateForm(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to create project' });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Delete this project? This will delete all documents and tasks.')) {
      const result = await deleteProjectFromStore(projectId);
      if (result.success) {
        setMessage({ type: 'success', text: 'Project deleted successfully' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete project' });
      }
    }
  };

  const handleSelectProject = (projectId: string) => {
    setCurrentProject(projectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">Manage Projects</h2>
          <button onClick={onClose} className="text-black hover:text-black">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{message.text}</span>
            </div>
          )}
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)} className="w-full mb-4" variant="outline">
              <Plus size={16} className="mr-2" />Create New Project
            </Button>
          )}
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">New Project</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="My Awesome Project" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} placeholder="Brief description..." rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Visibility</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewProjectVisibility('private')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        newProjectVisibility === 'private'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Lock size={16} />
                      <span className="font-medium">Private</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewProjectVisibility('public')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        newProjectVisibility === 'public'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Globe size={16} />
                      <span className="font-medium">Public</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {newProjectVisibility === 'private'
                      ? 'Only you can see this project'
                      : 'Anyone can view this project'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim() || isCreating} className="flex-1">
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                  <Button onClick={() => { setShowCreateForm(false); setNewProjectName(''); setNewProjectDescription(''); setNewProjectVisibility('private'); setMessage(null); }} variant="outline" className="flex-1" disabled={isCreating}>Cancel</Button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-3">Your Projects</h3>
            {projects.length === 0 ? (
              <div className="text-center text-black py-8">
                <FolderOpen size={48} className="mx-auto mb-3 opacity-50" />
                <p>No projects yet. Create one to get started!</p>
              </div>
            ) : (
              projects.map((project) => {
                const isOwner = user && project.ownerId === user.id;
                return (
                  <div key={project.id} className="border rounded-lg p-4 hover:border-blue-500">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 cursor-pointer" onClick={() => handleSelectProject(project.id)}>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          {project.visibility === 'public' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                              <Globe size={12} />
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                              <Lock size={12} />
                              Private
                            </span>
                          )}
                          {!isOwner && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                              Shared
                            </span>
                          )}
                        </div>
                        {project.description && <p className="text-sm text-black mb-2">{project.description}</p>}
                        <div className="text-xs text-black">
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {isOwner && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="text-red-600">
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        <div className="p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
        </div>
      </div>
    </div>
  );
}
