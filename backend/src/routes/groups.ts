import express, { Request, Response } from 'express';
import Group from '../models/Group';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/groups
// @desc    Get all groups with optional filters
// @access  Private
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { type, privacy, search } = req.query;
    const query: any = { isActive: true };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (privacy && privacy !== 'all') {
      query.privacy = privacy;
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const groups = await Group.find(query)
      .populate('creator', 'profile.name profile.avatar role')
      .populate('admins', 'profile.name profile.avatar')
      .populate('members.user', 'profile.name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ groups });
  } catch (error: any) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
});

// @route   GET /api/groups/:id
// @desc    Get group by ID
// @access  Private
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'profile.name profile.avatar role')
      .populate('admins', 'profile.name profile.avatar role')
      .populate('members.user', 'profile.name profile.avatar role')
      .populate('pendingRequests.user', 'profile.name profile.avatar role')
      .populate({
        path: 'posts',
        options: { limit: 20, sort: { createdAt: -1 } }
      })
      .populate({
        path: 'events',
        options: { limit: 10, sort: { startDate: -1 } }
      });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json({ group });
  } catch (error: any) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group', details: error.message });
  }
});

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { name, description, type, privacy, tags, rules, avatar, coverImage } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const newGroup = new Group({
      name,
      description,
      type,
      privacy: privacy || 'public',
      avatar,
      coverImage,
      creator: req.user!._id,
      admins: [req.user!._id],
      members: [{
        user: req.user!._id,
        role: 'admin',
        joinedAt: new Date()
      }],
      tags: tags || [],
      rules: rules || [],
      posts: [],
      events: [],
      isActive: true
    });

    await newGroup.save();

    const populatedGroup = await Group.findById(newGroup.id)
      .populate('creator', 'profile.name profile.avatar role')
      .populate('admins', 'profile.name profile.avatar')
      .populate('members.user', 'profile.name profile.avatar');

    res.status(201).json({ 
      message: 'Group created successfully', 
      group: populatedGroup 
    });
  } catch (error: any) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
});

// @route   POST /api/groups/:id/join
// @desc    Join a group or request to join (for private groups)
// @access  Private
router.post('/:id/join', isAuthenticated, async (req: any, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const userId = req.user!._id;
    const isMember = group.members.some((m: any) => m.user.toString() === userId);

    if (isMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    if (group.privacy === 'private') {
      // Add to pending requests
      const alreadyRequested = group.pendingRequests.some((r: any) => r.user.toString() === userId);
      if (alreadyRequested) {
        return res.status(400).json({ error: 'You have already requested to join this group' });
      }

      group.pendingRequests.push({
        user: userId as any,
        message: req.body.message || '',
        requestedAt: new Date()
      });

      await group.save();
      return res.json({ message: 'Join request sent', group });
    } else {
      // Add directly to members for public groups
      group.members.push({
        user: userId as any,
        role: 'member',
        joinedAt: new Date()
      });

      await group.save();

      const updatedGroup = await Group.findById(group.id)
        .populate('creator', 'profile.name profile.avatar role')
        .populate('admins', 'profile.name profile.avatar')
        .populate('members.user', 'profile.name profile.avatar');

      res.json({ message: 'Joined group successfully', group: updatedGroup });
    }
  } catch (error: any) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group', details: error.message });
  }
});

// @route   POST /api/groups/:id/leave
// @desc    Leave a group
// @access  Private
router.post('/:id/leave', isAuthenticated, async (req: any, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const userId = req.user!._id;

    if (group.creator.toString() === userId) {
      return res.status(400).json({ error: 'Creator cannot leave the group. Transfer ownership first.' });
    }

    group.members = group.members.filter((m: any) => m.user.toString() !== userId);
    group.admins = group.admins.filter((a: any) => a.toString() !== userId);

    await group.save();
    res.json({ message: 'Left group successfully' });
  } catch (error: any) {
    console.error('Error leaving group:', error);
    res.status(500).json({ error: 'Failed to leave group', details: error.message });
  }
});

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admins only)
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const userId = req.user!._id;
    const isAdmin = group.admins.some((a: any) => a.toString() === userId);

    if (!isAdmin && group.creator.toString() !== userId) {
      return res.status(403).json({ error: 'Only admins can update group details' });
    }

    const { name, description, privacy, tags, rules, avatar, coverImage } = req.body;

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    if (privacy) group.privacy = privacy;
    if (tags) group.tags = tags;
    if (rules) group.rules = rules;
    if (avatar) group.avatar = avatar;
    if (coverImage) group.coverImage = coverImage;

    await group.save();

    const updatedGroup = await Group.findById(group.id)
      .populate('creator', 'profile.name profile.avatar role')
      .populate('admins', 'profile.name profile.avatar')
      .populate('members.user', 'profile.name profile.avatar');

    res.json({ message: 'Group updated successfully', group: updatedGroup });
  } catch (error: any) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group', details: error.message });
  }
});

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Creator only)
router.delete('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator.toString() !== req.user!._id) {
      return res.status(403).json({ error: 'Only the creator can delete this group' });
    }

    group.isActive = false;
    await group.save();

    res.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group', details: error.message });
  }
});

export default router;
