import React, { useEffect, useState } from 'react';
import { Trophy, Award, Star, TrendingUp, Medal, Crown, Target, Zap } from 'lucide-react';
import { Badge as BadgeType } from '../../types';
import api from '../../services/api';

interface BadgeCardProps {
  badge: BadgeType;
  unlocked: boolean;
  progress?: number;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ badge, unlocked, progress = 0 }) => {
  const iconMap: { [key: string]: React.FC<any> } = {
    Trophy,
    Award,
    Star,
    Medal,
    Crown,
    Target,
    Zap,
  };

  const Icon = iconMap[badge.icon] || Trophy;

  return (
    <div
      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
        unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-glow'
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      {unlocked && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Unlocked!
        </div>
      )}

      <div className="flex flex-col items-center text-center">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            unlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
              : 'bg-gray-300'
          }`}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>

        <h3 className={`text-lg font-bold mb-2 ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
          {badge.name}
        </h3>

        <p className={`text-sm mb-4 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
          {badge.description}
        </p>

        {!unlocked && progress > 0 && (
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {unlocked && badge.earnedAt && (
          <div className="text-xs text-gray-500 mt-2">
            Earned {new Date(badge.earnedAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

interface BadgeShowcaseProps {
  userId: string;
}

export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({ userId }) => {
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, [userId]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      const data = await api.getBadges(userId);
      setEarnedBadges(data.earned || []);
      setAllBadges(data.available || []);
    } catch (error) {
      console.error('Failed to load badges:', error);
      setEarnedBadges([]);
      setAllBadges([]);
    } finally {
      setLoading(false);
    }
  };

  const unlockedBadges = earnedBadges;
  const lockedBadges = allBadges.filter(
    (b) => !earnedBadges.find((ub) => ub.name === b.name)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Badge Collection</h2>
          <p className="text-gray-600">
            {unlockedBadges.length} of {allBadges.length} badges earned
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg">
          <Trophy className="w-5 h-5" />
          <span className="font-bold">{unlockedBadges.length} Badges</span>
        </div>
      </div>

      {/* Unlocked Badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Unlocked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.map((badge, index) => (
              <BadgeCard key={badge.name || index} badge={badge} unlocked={true} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-500 mb-4">Locked</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((badge, index) => (
              <BadgeCard key={badge.name || badge.id || index} badge={badge} unlocked={false} progress={0} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
