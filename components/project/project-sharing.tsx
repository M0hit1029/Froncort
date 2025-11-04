'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, UserPlus, Trash2, Search, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { UserRole, ProjectMember } from '@/lib/types';
import {
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
  fetchProjectMembers,
  searchUsersByEmail,
} from '@/lib/services/project-members';
import { useAuthStore } from '@/store/auth-store';

interface ProjectSharingProps {
  projectId: string;
  projectName: string;
  ownerId: string;
  onClose: () => void;
}

interface UserDetails {
  id: string;
  email: string;
  name: string;
}

export function ProjectSharing({ projectId, projectName, ownerId, onClose }: ProjectSharingProps) {
  const { user } = useAuthStore();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [userDetails, setUserDetails] = useState<Map<string, UserDetails>>(new Map());
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserDetails[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isOwner = user?.id === ownerId;

  useEffect(() => {
    const loadUserDetails = async (userIds: string[]) => {
      const uniqueIds = [...new Set(userIds)];
      const detailsMap = new Map(userDetails);
      
      for (const userId of uniqueIds) {
        if (!detailsMap.has(userId)) {
          // In a real app, we'd fetch from Supabase users table
          // For now, we'll use a placeholder
          detailsMap.set(userId, {
            id: userId,
            email: `user-${userId.slice(0, 8)}@example.com`,
            name: `User ${userId.slice(0, 8)}`,
          });
        }
      }
      
      setUserDetails(detailsMap);
    };

    const loadMembers = async () => {
      setIsLoading(true);
      const { data, error } = await fetchProjectMembers(projectId);
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else if (data) {
        setMembers(data);
        // Fetch user details for all members
        await loadUserDetails(data.map(m => m.userId));
      }
      
      setIsLoading(false);
    };

    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { data, error } = await searchUsersByEmail(searchEmail);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setSearchResults([]);
    } else if (data) {
      // Filter out users who are already members
      const memberUserIds = new Set(members.map(m => m.userId));
      const filteredResults = data.filter(u => !memberUserIds.has(u.id) && u.id !== ownerId);
      setSearchResults(filteredResults);
    }
    
    setIsSearching(false);
  };

  const handleAddMember = async (userId: string) => {
    setIsLoading(true);
    setMessage(null);

    const { data, error } = await addProjectMember(projectId, userId, selectedRole);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data) {
      setMembers([...members, data]);
      setMessage({ type: 'success', text: 'Member added successfully!' });
      setSearchEmail('');
      setSearchResults([]);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsLoading(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Remove this member from the project?')) return;

    setIsLoading(true);
    setMessage(null);

    const { error } = await removeProjectMember(projectId, userId);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMembers(members.filter(m => m.userId !== userId));
      setMessage({ type: 'success', text: 'Member removed successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsLoading(false);
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setIsLoading(true);
    setMessage(null);

    const { data, error } = await updateProjectMemberRole(projectId, userId, newRole);
    
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else if (data) {
      setMembers(members.map(m => m.userId === userId ? data : m));
      setMessage({ type: 'success', text: 'Role updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
    
    setIsLoading(false);
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'editor':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users size={24} />
              Share Project
            </h2>
            <p className="text-sm text-gray-600 mt-1">{projectName}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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

          {isOwner && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Invite Members</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="Search by email..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button onClick={handleSearch} disabled={isSearching || !searchEmail.trim()}>
                    <Search size={16} className="mr-2" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="border rounded-lg bg-white">
                    {searchResults.map((userResult) => (
                      <div
                        key={userResult.id}
                        className="flex items-center justify-between p-3 border-b last:border-b-0"
                      >
                        <div>
                          <p className="font-medium">{userResult.name}</p>
                          <p className="text-sm text-gray-600">{userResult.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                            className="border rounded px-2 py-1 text-sm"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleAddMember(userResult.id)}
                            disabled={isLoading}
                          >
                            <UserPlus size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-lg font-semibold mb-3">Current Members ({members.length})</h3>
            {isLoading && members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No members yet. Invite someone to collaborate!
              </div>
            ) : (
              members.map((member) => {
                const details = userDetails.get(member.userId);
                const isMemberOwner = member.userId === ownerId;

                return (
                  <div
                    key={member.userId}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{details?.name || 'Loading...'}</p>
                      <p className="text-sm text-gray-600">{details?.email || ''}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Added {new Date(member.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOwner && !isMemberOwner ? (
                        <>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value as UserRole)}
                            className="border rounded px-2 py-1 text-sm"
                            disabled={isLoading}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.userId)}
                            disabled={isLoading}
                            className="text-red-600"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
