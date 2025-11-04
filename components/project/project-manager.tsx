'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/store/project-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FolderOpen, Trash2 } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectManagerProps {
  onClose: () => void;
}

export function ProjectManager({ onClose }: ProjectManagerProps) {
  const { projects, addProject, deleteProject, setCurrentProject } = useProjectStore();
  const { user } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim() || !user) return;

    const newProject: Project = {
      id: `project-${crypto.randomUUID()}`,
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [{
        userId: user.id,
        role: 'owner',
        addedAt: new Date(),
      }],
    };

    addProject(newProject);
    setCurrentProject(newProject.id);
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateForm(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Delete this project? This will delete all documents and tasks.')) {
      deleteProject(projectId);
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
                <div className="flex gap-2">
                  <Button onClick={handleCreateProject} disabled={!newProjectName.trim()} className="flex-1">Create</Button>
                  <Button onClick={() => { setShowCreateForm(false); setNewProjectName(''); setNewProjectDescription(''); }} variant="outline" className="flex-1">Cancel</Button>
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
              projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:border-blue-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => handleSelectProject(project.id)}>
                      <h4 className="font-semibold text-lg mb-1">{project.name}</h4>
                      {project.description && <p className="text-sm text-black mb-2">{project.description}</p>}
                      <div className="text-xs text-black">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="text-red-600">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
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
