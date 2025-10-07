import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Crown, Star } from 'lucide-react';
import { User } from '../../types';
import api from '../../services/api';

interface LeaderboardEntry {
  user: User;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  currentUserId: string;
  type?: 'points' | 'connections' | 'events' | 'mentorship';
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ currentUserId, type = 'points' }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedType, setSelectedType] = useState(type);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaderboard(selectedType, 10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'points', label: 'Points', icon: Trophy, gradient: 'from-yellow-400 to-orange-500' },
    { value: 'connections', label: 'Connections', icon: Star, gradient: 'from-blue-400 to-cyan-500' },
    { value: 'events', label: 'Events', icon: Award, gradient: 'from-purple-400 to-pink-500' },
    { value: 'mentorship', label: 'Mentorship', icon: Crown, gradient: 'from-green-400 to-emerald-500' },
  ];

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-orange-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-300 to-amber-500';
    return 'from-primary-400 to-primary-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-display">Leaderboard</h2>
            <p className="text-gray-600 text-sm">Top performers this week</p>
          </div>
        </div>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedType === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedType(option.value as any)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? `border-primary-500 bg-gradient-to-br ${option.gradient} text-white shadow-lg scale-105`
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {option.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-100 rounded-xl">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          leaderboard.map((entry) => {
            const isCurrentUser = entry.user.id === currentUserId;
            return (
              <div
                key={entry.user.id}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-200 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-primary-50 to-accent-50 border-2 border-primary-300'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {getRankIcon(entry.rank)}
                </div>

                {/* Avatar */}
                <div className="relative">
                  <img
                    src={entry.user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user.id}`}
                    alt={entry.user.profile?.name}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                  {entry.rank <= 3 && (
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${getRankColor(entry.rank)} rounded-full flex items-center justify-center border-2 border-white`}>
                      <span className="text-white text-xs font-bold">#{entry.rank}</span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {entry.user.profile?.name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">You</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {entry.user.profile?.major || entry.user.profile?.company || 'CampusConnect Member'}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{entry.score.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    {selectedType === 'points' && 'points'}
                    {selectedType === 'connections' && 'connections'}
                    {selectedType === 'events' && 'events'}
                    {selectedType === 'mentorship' && 'hours'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Current User Rank (if not in top 10) */}
      {!leaderboard.find((e) => e.user.id === currentUserId) && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border-2 border-primary-300">
            <div className="flex-shrink-0 w-12 text-center text-gray-600 font-bold">
              #47
            </div>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
              alt="You"
              className="w-12 h-12 rounded-full border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                You
                <span className="ml-2 text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full">Your Rank</span>
              </h4>
              <p className="text-sm text-gray-500">Keep going to climb the ranks!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">450</div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
