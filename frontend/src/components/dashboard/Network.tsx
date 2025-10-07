import React from 'react';
import { Filter, Briefcase, BookOpen, MailPlus } from 'lucide-react';

export interface NetworkUserCard {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  company?: string;
  department?: string;
  headline?: string;
  skills: string[];
}

interface NetworkProps {
  suggestions: NetworkUserCard[];
  onConnect: (userId: string) => Promise<void>;
  onStartMessage: (user: NetworkUserCard) => void;
  loading?: boolean;
}

const Network: React.FC<NetworkProps> = ({ suggestions, onConnect, onStartMessage, loading = false }) => {
  const [isConnecting, setIsConnecting] = React.useState<string>('');

  const handleConnect = async (userId: string) => {
    setIsConnecting(userId);
    try {
      await onConnect(userId);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    } finally {
      setIsConnecting('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Grow Your Network</h2>
            <p className="text-gray-600 text-sm">Recommended connections based on interests and role</p>
          </div>
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50" type="button">
            <Filter className="w-4 h-4 inline mr-2" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading connections…</div>
        ) : suggestions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No suggestions just yet. Update your profile to help us find better matches!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`
                    }
                    alt={user.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    {user.role && <p className="text-sm text-gray-600 capitalize">{user.role}</p>}
                    {user.company && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <Briefcase className="w-3 h-3 mr-1" />
                        {user.company}
                      </p>
                    )}
                    {user.department && (
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {user.department}
                      </p>
                    )}
                    {user.headline && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{user.headline}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleConnect(user.id)}
                        className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={isConnecting === user.id}
                      >
                        {isConnecting === user.id ? 'Sending…' : 'Connect'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onStartMessage(user)}
                        className="px-4 py-1 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 flex items-center"
                      >
                        <MailPlus className="w-4 h-4 mr-1" />
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;