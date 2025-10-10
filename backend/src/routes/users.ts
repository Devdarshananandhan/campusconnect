import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { isAuthenticated } from '../middleware/auth';
import User from '../models/User';
import Notification from '../models/Notification';

const router = Router();

// Get users list with pagination
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = parseInt(req.query.offset as string) || 0;

    const users = await User.find({ isActive: true })
      .select('-password')
      .skip(offset)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await User.countDocuments({ isActive: true });

    res.json({ users, total, limit, offset });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'profile.name profile.avatar role');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users
router.get('/search', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { q, role, skills, major } = req.query;
    const query: any = { isActive: true };

    if (q) {
      query.$text = { $search: q as string };
    }
    if (role) {
      query.role = role;
    }
    if (major) {
      query['profile.major'] = major;
    }
    if (skills) {
      query['profile.skills'] = { $in: (skills as string).split(',') };
    }

    const users = await User.find(query)
      .select('-password')
      .limit(20)
      .lean();

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Endorse skill
router.post('/:id/endorse', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { skill } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already endorsed
    const alreadyEndorsed = user.endorsements.some(
      (e: any) => e.skill === skill && e.endorsedBy.toString() === req.user._id.toString()
    );

    if (alreadyEndorsed) {
      return res.status(400).json({ error: 'Already endorsed this skill' });
    }

    user.endorsements.push({
      skill,
      endorsedBy: req.user._id,
      createdAt: new Date()
    });

    await user.save();

    // Create notification
    await Notification.create({
      user: user._id,
      type: 'endorsement',
      message: `${req.user.profile.name} endorsed your ${skill} skill`,
      data: { skill, endorsedBy: req.user._id }
    });

    res.json({ message: 'Skill endorsed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;