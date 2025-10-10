import React from 'react';
import { Search, Bell, LogOut, Users, Menu, X, CheckCheck } from 'lucide-react';
import { Notification, User } from '../../types';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Notification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onMarkAllNotificationsRead: () => void;
  activeView?: string;
}

const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  notifications,
  showNotifications,
  setShowNotifications,
  sidebarOpen,
  setSidebarOpen,
  onMarkAllNotificationsRead,
  activeView
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const avatar = currentUser?.profile?.avatar ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.profile?.name || 'User')}`;

  // Context-aware search placeholder
  const getSearchPlaceholder = () => {
    switch (activeView) {
      case 'network':
        return 'Search users, skills, companies...';
      case 'events':
        return 'Search events, workshops, hackathons...';
      case 'groups':
        return 'Search groups, communities, projects...';
      case 'knowledge':
        return 'Search posts, topics, skills...';
      case 'mentorship':
        return 'Search mentors, expertise, industries...';
      case 'messages':
        return 'Search conversations...';
      default:
        return 'Search users, skills, events...';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CampusConnect</span>
            </div>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={getSearchPlaceholder()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="Toggle notifications"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <img
                src={avatar}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-blue-600"
              />
              <span className="hidden md:block text-sm font-medium">
                {currentUser?.profile?.name || 'Member'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showNotifications && (
        <div className="absolute right-4 top-16 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={onMarkAllNotificationsRead}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div key={notif.id ?? notif.createdAt} className={`p-4 hover:bg-gray-50 ${!notif.read ? 'bg-blue-50' : ''}`}>
                  <p className="text-sm text-gray-900">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;