import React, { useState } from 'react';
import { Settings, GraduationCap, Briefcase, Award, Loader2 } from 'lucide-react';
import { User } from '../../types';

interface ProfileProps {
  currentUser: User | null;
  postsCount: number;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, postsCount, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(currentUser?.profile?.bio || '');
  const [saving, setSaving] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Unable to load profile details. Please try refreshing the page.
        </div>
      </div>
    );
  }

  const avatar =
    currentUser.profile?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.profile?.name || 'User')}`;

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await onUpdateProfile({
        profile: {
          ...currentUser.profile,
          bio: editedBio,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-16 mb-6">
            <img src={avatar} alt={currentUser.profile?.name} className="w-32 h-32 rounded-full border-4 border-white shadow-lg" />
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 inline mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{currentUser.profile?.name}</h1>
            <p className="text-lg text-gray-600 capitalize mt-1">{currentUser.role}</p>
            {currentUser.profile?.major && (
              <p className="text-gray-600 flex items-center mt-1">
                <GraduationCap className="w-4 h-4 mr-2" />
                {currentUser.profile.major}
                {currentUser.profile?.graduationYear && ` • Class of ${currentUser.profile.graduationYear}`}
              </p>
            )}
            {currentUser.profile?.company && (
              <p className="text-gray-600 flex items-center mt-1">
                <Briefcase className="w-4 h-4 mr-2" />
                {currentUser.profile.company}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentUser.connections?.length || 0}</div>
              <div className="text-sm text-gray-600">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{currentUser.endorsements?.length || 0}</div>
              <div className="text-sm text-gray-600">Endorsements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{postsCount}</div>
              <div className="text-sm text-gray-600">Posts</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">About</h2>
            {isEditing ? (
              <textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell us about yourself..."
                aria-label="Edit bio"
              />
            ) : (
              <p className="text-gray-700">{currentUser.profile?.bio || 'Add a short introduction to let others know more about you.'}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.profile?.skills?.map((skill) => (
                <span key={skill} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {skill}
                  <Award className="w-4 h-4 inline ml-2" />
                </span>
              ))}
              {(!currentUser.profile?.skills || currentUser.profile.skills.length === 0) && (
                <span className="text-sm text-gray-500">No skills listed yet.</span>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {currentUser.profile?.interests?.length ? (
                currentUser.profile.interests.map((interest) => (
                  <span key={interest} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                    {interest}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">Share your interests to help mentors and peers find you.</span>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={saving}
                type="button"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;