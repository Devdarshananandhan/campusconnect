import React from 'react';
import { Users, Lock, Globe, Eye, Calendar, MessageCircle, UserPlus, Settings } from 'lucide-react';
import { Group } from '../../types';

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  onView?: (groupId: string) => void;
  isMember?: boolean;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onJoin, onView, isMember = false }) => {
  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      major: 'from-blue-500 to-cyan-500',
      club: 'from-purple-500 to-pink-500',
      research: 'from-green-500 to-emerald-500',
      career: 'from-orange-500 to-red-500',
      project: 'from-indigo-500 to-purple-500',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  const getPrivacyIcon = () => {
    if (group.privacy === 'private') return <Lock className="w-4 h-4" />;
    if (group.privacy === 'secret') return <Eye className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const memberCount = group.members?.length || 0;
  const postCount = group.posts?.length || 0;

  return (
    <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group" onClick={() => onView?.(group.id)}>
      {/* Header with gradient */}
      <div className={`h-32 bg-gradient-to-br ${getTypeColor(group.type)} rounded-t-2xl relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
            {getPrivacyIcon()}
            <span className="capitalize">{group.privacy}</span>
          </span>
        </div>
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {group.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Group Name & Description */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors font-display">
          {group.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-1 text-gray-500">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{memberCount} members</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{postCount} posts</span>
          </div>
        </div>

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {group.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="badge">
                {tag}
              </span>
            ))}
            {group.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{group.tags.length - 3} more</span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            <Calendar className="w-3 h-3 inline mr-1" />
            Created {new Date(group.createdAt).toLocaleDateString()}
          </div>
          
          {isMember ? (
            <button className="btn-secondary text-sm" onClick={(e) => { e.stopPropagation(); onView?.(group.id); }}>
              <Settings className="w-4 h-4 mr-1" />
              Manage
            </button>
          ) : (
            <button className="btn-primary text-sm" onClick={(e) => { e.stopPropagation(); onJoin?.(group.id); }}>
              <UserPlus className="w-4 h-4 mr-1" />
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface GroupListProps {
  groups: Group[];
  currentUserId: string;
  onJoinGroup?: (groupId: string) => void;
  onViewGroup?: (groupId: string) => void;
  loading?: boolean;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  currentUserId,
  onJoinGroup,
  onViewGroup,
  loading = false,
}) => {
  const isMember = (group: Group) => {
    return group.members?.some((member) => {
      // Handle both populated (object) and unpopulated (string) user field
      const userId = typeof member.user === 'string' ? member.user : (member.user as any)?._id || (member.user as any)?.id;
      return userId === currentUserId;
    }) || false;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-32 bg-gray-300 rounded-t-2xl"></div>
            <div className="p-6 space-y-4">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No groups found</h3>
        <p className="text-gray-600">Be the first to create a group!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          isMember={isMember(group)}
          onJoin={onJoinGroup}
          onView={onViewGroup}
        />
      ))}
    </div>
  );
};

export default GroupList;
