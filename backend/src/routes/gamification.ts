import express, { Request, Response } from 'express';
import User from '../models/User';
import Event from '../models/Event';
import Connection from '../models/Connection';
import Mentorship from '../models/Mentorship';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/gamification/leaderboard/:type
// @desc    Get leaderboard by type
// @access  Private
router.get('/leaderboard/:type', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    let leaderboard: any[] = [];

    switch (type) {
      case 'points':
        const usersByPoints = await User.find({ isActive: true })
          .select('profile.name profile.avatar profile.major profile.company role gamification.points')
          .sort({ 'gamification.points': -1 })
          .limit(limit);

        leaderboard = usersByPoints.map((user, index) => ({
          user: {
            id: user.id,
            profile: user.profile,
            role: user.role
          },
          score: user.gamification?.points || 0,
          rank: index + 1
        }));
        break;

      case 'connections':
        const users = await User.find({ isActive: true })
          .select('profile.name profile.avatar profile.major profile.company role')
          .limit(100);

        const connectionsCount = await Promise.all(
          users.map(async (user) => {
            const count = await Connection.countDocuments({
              $or: [{ requester: user.id }, { recipient: user.id }],
              status: 'accepted'
            });
            return {
              user: {
                id: user.id,
                profile: user.profile,
                role: user.role
              },
              score: count,
              rank: 0
            };
          })
        );

        leaderboard = connectionsCount
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((item, index) => ({ ...item, rank: index + 1 }));
        break;

      case 'events':
        const usersByEvents = await User.find({ isActive: true })
          .select('profile.name profile.avatar profile.major profile.company role gamification.stats.eventsAttended')
          .sort({ 'gamification.stats.eventsAttended': -1 })
          .limit(limit);

        leaderboard = usersByEvents.map((user, index) => ({
          user: {
            id: user.id,
            profile: user.profile,
            role: user.role
          },
          score: user.gamification?.stats?.eventsAttended || 0,
          rank: index + 1
        }));
        break;

      case 'mentorship':
        const usersByMentorship = await User.find({ isActive: true })
          .select('profile.name profile.avatar profile.major profile.company role gamification.stats.mentorshipHours')
          .sort({ 'gamification.stats.mentorshipHours': -1 })
          .limit(limit);

        leaderboard = usersByMentorship.map((user, index) => ({
          user: {
            id: user.id,
            profile: user.profile,
            role: user.role
          },
          score: user.gamification?.stats?.mentorshipHours || 0,
          rank: index + 1
        }));
        break;

      default:
        return res.status(400).json({ error: 'Invalid leaderboard type' });
    }

    res.json(leaderboard);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
  }
});

// @route   POST /api/gamification/:userId/points
// @desc    Award points to a user
// @access  Private
router.post('/:userId/points', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { points, reason } = req.body;

    if (!points || !reason) {
      return res.status(400).json({ error: 'Points and reason are required' });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Award points
    if (!user.gamification) {
      user.gamification = {
        points: 0,
        level: 1,
        badges: [],
        stats: {
          eventsAttended: 0,
          connectionsAdded: 0,
          mentorshipHours: 0,
          skillsEndorsed: 0,
          postsCreated: 0
        }
      };
    }

    user.gamification.points = (user.gamification.points || 0) + points;

    // Calculate level (100 points per level)
    user.gamification.level = Math.floor(user.gamification.points / 100) + 1;

    // Check for new badges
    const newBadges = checkForNewBadges(user);
    if (newBadges.length > 0) {
      user.gamification.badges.push(...newBadges);
    }

    await user.save();

    res.json({ 
      message: 'Points awarded successfully', 
      user: {
        id: user.id,
        gamification: user.gamification,
        newBadges
      }
    });
  } catch (error: any) {
    console.error('Error awarding points:', error);
    res.status(500).json({ error: 'Failed to award points', details: error.message });
  }
});

// @route   GET /api/gamification/:userId/badges
// @desc    Get user's badges
// @access  Private
router.get('/:userId/badges', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('gamification.badges');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const allBadges = getAllAvailableBadges();
    const earnedBadges = user.gamification?.badges || [];

    res.json({ 
      earned: earnedBadges,
      available: allBadges
    });
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges', details: error.message });
  }
});

// Helper function to check for new badges
function checkForNewBadges(user: any): any[] {
  const newBadges: any[] = [];
  const existingBadgeNames = (user.gamification?.badges || []).map((b: any) => b.name);

  // First Post Badge
  if (user.gamification?.stats?.postsCreated >= 1 && !existingBadgeNames.includes('First Post')) {
    newBadges.push({
      name: 'First Post',
      description: 'Created your first post',
      icon: 'Star',
      earnedAt: new Date()
    });
  }

  // Social Butterfly Badge (10 connections)
  if (user.gamification?.stats?.connectionsAdded >= 10 && !existingBadgeNames.includes('Social Butterfly')) {
    newBadges.push({
      name: 'Social Butterfly',
      description: 'Made 10 connections',
      icon: 'Star',
      earnedAt: new Date()
    });
  }

  // Event Enthusiast Badge (5 events)
  if (user.gamification?.stats?.eventsAttended >= 5 && !existingBadgeNames.includes('Event Enthusiast')) {
    newBadges.push({
      name: 'Event Enthusiast',
      description: 'Attended 5 events',
      icon: 'Trophy',
      earnedAt: new Date()
    });
  }

  // Mentor Badge (10 mentorship hours)
  if (user.gamification?.stats?.mentorshipHours >= 10 && !existingBadgeNames.includes('Mentor')) {
    newBadges.push({
      name: 'Mentor',
      description: 'Completed 10 hours of mentorship',
      icon: 'Crown',
      earnedAt: new Date()
    });
  }

  // Points Milestones
  const points = user.gamification?.points || 0;
  
  if (points >= 100 && !existingBadgeNames.includes('Rising Star')) {
    newBadges.push({
      name: 'Rising Star',
      description: 'Earned 100 points',
      icon: 'Star',
      earnedAt: new Date()
    });
  }

  if (points >= 500 && !existingBadgeNames.includes('Campus Legend')) {
    newBadges.push({
      name: 'Campus Legend',
      description: 'Earned 500 points',
      icon: 'Medal',
      earnedAt: new Date()
    });
  }

  if (points >= 1000 && !existingBadgeNames.includes('Elite Member')) {
    newBadges.push({
      name: 'Elite Member',
      description: 'Earned 1000 points',
      icon: 'Crown',
      earnedAt: new Date()
    });
  }

  return newBadges;
}

// Helper function to get all available badges
function getAllAvailableBadges() {
  return [
    { id: '1', name: 'First Post', description: 'Created your first post', icon: 'Star' },
    { id: '2', name: 'Social Butterfly', description: 'Made 10 connections', icon: 'Star' },
    { id: '3', name: 'Event Enthusiast', description: 'Attended 5 events', icon: 'Trophy' },
    { id: '4', name: 'Mentor', description: 'Completed 10 hours of mentorship', icon: 'Crown' },
    { id: '5', name: 'Rising Star', description: 'Earned 100 points', icon: 'Star' },
    { id: '6', name: 'Campus Legend', description: 'Earned 500 points', icon: 'Medal' },
    { id: '7', name: 'Elite Member', description: 'Earned 1000 points', icon: 'Crown' },
    { id: '8', name: 'Knowledge Sharer', description: 'Posted 10 knowledge articles', icon: 'Award' },
    { id: '9', name: 'Helpful Helper', description: '50 helpful marks on knowledge posts', icon: 'Zap' },
    { id: '10', name: 'Networking Pro', description: 'Made 50 connections', icon: 'Target' },
  ];
}

export default router;
