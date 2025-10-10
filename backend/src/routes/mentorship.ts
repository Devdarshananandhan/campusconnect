import { Router, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import Mentorship from '../models/Mentorship';
import Notification from '../models/Notification';
import User from '../models/User';

const router = Router();
let io: any;

export const setSocketIO = (socketIO: any) => {
  io = socketIO;
};

// Get recommended mentors based on user's career goals and skills
router.get('/recommended/:userId', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find potential mentors (alumni or faculty with mentor profiles)
    const mentors = await User.find({
      _id: { $ne: userId }, // Exclude current user
      isActive: true,
      role: { $in: ['alumni', 'faculty'] },
      'mentorProfile.isAvailable': true
    })
      .select('-password')
      .limit(10)
      .lean();

    // Simple scoring based on skill matches
    const recommendations = mentors.map((mentor: any) => {
      let matchScore = 0;
      
      // Score based on matching skills
      const userSkills = user.profile?.skills || [];
      const mentorSkills = mentor.profile?.skills || [];
      const mentorExpertise = mentor.mentorProfile?.expertiseAreas || [];
      
      const skillMatches = userSkills.filter((skill: string) => 
        mentorExpertise.includes(skill) || mentorSkills.includes(skill)
      );
      
      matchScore = (skillMatches.length / Math.max(userSkills.length, 1)) * 100;
      
      return {
        mentor,
        matchScore: Math.round(matchScore),
        reason: skillMatches.length > 0 
          ? `Expertise in ${skillMatches.slice(0, 3).join(', ')}`
          : 'Experienced professional in your field'
      };
    })
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ recommendations });
  } catch (error) {
    console.error('Error getting recommended mentors:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/request', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { mentor, topic, description, goals } = req.body;

    const mentorship = new Mentorship({
      mentor,
      mentee: req.user._id,
      topic,
      description,
      goals: goals || [],
      status: 'pending'
    });

    await mentorship.save();

    // Create notification
    await Notification.create({
      user: mentor,
      type: 'mentorship_request',
      message: `${req.user.profile.name} requested mentorship`,
      data: { mentorshipId: mentorship._id }
    });

    io.to(mentor.toString()).emit('notification', {
      type: 'mentorship_request',
      data: mentorship
    });

    res.status(201).json({ message: 'Mentorship request sent', mentorship });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept/Update mentorship
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { status, startDate, endDate } = req.body;

    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (status) mentorship.status = status;
    if (startDate) mentorship.startDate = startDate;
    if (endDate) mentorship.endDate = endDate;

    await mentorship.save();

    res.json({ message: 'Mentorship updated', mentorship });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get mentorship requests
router.get('/requests', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { role } = req.query;
    const query: any = { status: 'pending' };

    if (role === 'mentor') {
      query.mentor = req.user._id;
    } else {
      query.mentee = req.user._id;
    }

    const requests = await Mentorship.find(query)
      .populate('mentor', 'profile.name profile.avatar role')
      .populate('mentee', 'profile.name profile.avatar role')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get active mentorships
router.get('/active', isAuthenticated, async (req: any, res: Response) => {
  try {
    const mentorships = await Mentorship.find({
      $or: [{ mentor: req.user._id }, { mentee: req.user._id }],
      status: 'active'
    })
      .populate('mentor', 'profile.name profile.avatar role')
      .populate('mentee', 'profile.name profile.avatar role');

    res.json({ mentorships });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;