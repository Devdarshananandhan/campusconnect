import express, { Request, Response } from 'express';
import Referral from '../models/Referral';
import Job from '../models/Job';
import Notification from '../models/Notification';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/referrals
// @desc    Request a referral from an alumnus
// @access  Private (Students)
router.post('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { job, referrer, requestMessage, relationship, strength } = req.body;

    const userId = req.user!._id;

    // Check if job exists
    const jobDoc = await Job.findById(job).populate('company');
    if (!jobDoc) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already requested referral from this person for this job
    const existingReferral = await Referral.findOne({ job, candidate: userId, referrer });
    if (existingReferral) {
      return res.status(400).json({ error: 'You have already requested a referral from this alumnus for this job' });
    }

    const newReferral = new Referral({
      job,
      candidate: userId,
      referrer,
      status: 'pending',
      requestMessage,
      relationship,
      strength,
      company: jobDoc.company._id
    });

    await newReferral.save();

    // Notify the alumnus
    await Notification.create({
      user: referrer,
      type: 'post_like', // We'll need 'referral_request' type
      message: `${req.user.profile.name} has requested a referral for ${jobDoc.title}`,
      data: { referralId: newReferral._id, jobId: job }
    });

    const populatedReferral = await Referral.findById(newReferral._id)
      .populate('candidate', 'profile.name profile.avatar profile.major')
      .populate('referrer', 'profile.name profile.avatar')
      .populate({
        path: 'job',
        select: 'title company',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      });

    res.status(201).json({ message: 'Referral requested successfully', referral: populatedReferral });
  } catch (error: any) {
    console.error('Error requesting referral:', error);
    res.status(500).json({ error: 'Failed to request referral', details: error.message });
  }
});

// @route   GET /api/referrals/received
// @desc    Get referral requests received by alumnus
// @access  Private (Alumni)
router.get('/received', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user!._id;
    const { status } = req.query;

    const query: any = { referrer: userId };
    if (status) query.status = status;

    const referrals = await Referral.find(query)
      .populate('candidate', 'profile.name profile.avatar profile.major profile.skills profile.graduationYear')
      .populate({
        path: 'job',
        select: 'title type location',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ referrals });
  } catch (error: any) {
    console.error('Error fetching received referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals', details: error.message });
  }
});

// @route   GET /api/referrals/sent
// @desc    Get referral requests sent by student
// @access  Private (Students)
router.get('/sent', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user!._id;
    const { status } = req.query;

    const query: any = { candidate: userId };
    if (status) query.status = status;

    const referrals = await Referral.find(query)
      .populate('referrer', 'profile.name profile.avatar profile.company')
      .populate({
        path: 'job',
        select: 'title type location',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json({ referrals });
  } catch (error: any) {
    console.error('Error fetching sent referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals', details: error.message });
  }
});

// @route   GET /api/referrals/:id
// @desc    Get single referral details
// @access  Private
router.get('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const referral = await Referral.findById(req.params.id)
      .populate('candidate', 'profile.name profile.avatar profile.major profile.skills profile.bio experience education')
      .populate('referrer', 'profile.name profile.avatar profile.company')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo industry'
        }
      });

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const userId = req.user!._id;

    // Check authorization: candidate or referrer
    if (
      referral.candidate._id.toString() !== userId.toString() &&
      referral.referrer._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to view this referral' });
    }

    res.json({ referral });
  } catch (error: any) {
    console.error('Error fetching referral:', error);
    res.status(500).json({ error: 'Failed to fetch referral', details: error.message });
  }
});

// @route   PUT /api/referrals/:id/accept
// @desc    Accept a referral request
// @access  Private (Referrer only)
router.put('/:id/accept', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { message } = req.body;

    const referral = await Referral.findById(req.params.id).populate('job candidate');

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const userId = req.user!._id;

    if (referral.referrer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept this referral' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ error: 'This referral has already been processed' });
    }

    referral.status = 'accepted';
    referral.message = message;
    referral.responseMessage = message;

    await referral.save();

    // Add referral to job
    const job = await Job.findById(referral.job);
    if (job) {
      job.referrals.push(referral._id as any);
      await job.save();
    }

    // Notify the candidate
    const candidate = referral.candidate as any;
    await Notification.create({
      user: candidate._id,
      type: 'post_like', // We'll need 'referral_accepted' type
      message: `Your referral request for ${(referral.job as any).title} has been accepted!`,
      data: { referralId: referral._id, jobId: referral.job }
    });

    res.json({ message: 'Referral accepted successfully', referral });
  } catch (error: any) {
    console.error('Error accepting referral:', error);
    res.status(500).json({ error: 'Failed to accept referral', details: error.message });
  }
});

// @route   PUT /api/referrals/:id/decline
// @desc    Decline a referral request
// @access  Private (Referrer only)
router.put('/:id/decline', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { responseMessage } = req.body;

    const referral = await Referral.findById(req.params.id).populate('job candidate');

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const userId = req.user!._id;

    if (referral.referrer.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to decline this referral' });
    }

    if (referral.status !== 'pending') {
      return res.status(400).json({ error: 'This referral has already been processed' });
    }

    referral.status = 'declined';
    referral.responseMessage = responseMessage;

    await referral.save();

    // Notify the candidate
    const candidate = referral.candidate as any;
    await Notification.create({
      user: candidate._id,
      type: 'post_like', // We'll need 'referral_declined' type
      message: `Your referral request for ${(referral.job as any).title} was declined`,
      data: { referralId: referral._id }
    });

    res.json({ message: 'Referral declined', referral });
  } catch (error: any) {
    console.error('Error declining referral:', error);
    res.status(500).json({ error: 'Failed to decline referral', details: error.message });
  }
});

// @route   GET /api/referrals/job/:jobId/alumni
// @desc    Get alumni working at the company (for referral requests)
// @access  Private
router.get('/job/:jobId/alumni', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.jobId).populate('company');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const company = job.company as any;

    // Find alumni working at this company
    // This is a simplified version - you'd query based on user's current company
    const User = require('../models/User').default;
    const alumni = await User.find({
      role: { $in: ['alumni', 'faculty'] },
      'profile.company': company.name,
      isActive: true
    })
      .select('profile.name profile.avatar profile.company profile.bio')
      .limit(20)
      .lean();

    res.json({ alumni });
  } catch (error: any) {
    console.error('Error fetching alumni:', error);
    res.status(500).json({ error: 'Failed to fetch alumni', details: error.message });
  }
});

export default router;
