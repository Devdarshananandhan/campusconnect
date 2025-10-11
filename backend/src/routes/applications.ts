import express, { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import Notification from '../models/Notification';
import { isAuthenticated, canApplyToJobs, isEmployer } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/applications
// @desc    Submit a job application
// @access  Private (Students and Alumni only)
router.post('/', isAuthenticated, canApplyToJobs, async (req: any, res: Response) => {
  try {
    const { job, resume, coverLetter, answers, referredBy } = req.body;

    const userId = req.user!._id;

    // Check if job exists
    const jobDoc = await Job.findById(job);
    if (!jobDoc) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (jobDoc.status !== 'active') {
      return res.status(400).json({ error: 'This job is no longer accepting applications' });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({ job, applicant: userId });
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied to this job' });
    }

    const newApplication = new Application({
      job,
      applicant: userId,
      resume,
      coverLetter,
      answers: answers || [],
      referredBy,
      status: 'applied',
      timeline: [{
        status: 'applied',
        changedAt: new Date()
      }]
    });

    await newApplication.save();

    // Add application to job's applications array
    jobDoc.applications.push(newApplication._id as any);
    await jobDoc.save();

    // Create notification for employer
    await Notification.create({
      user: jobDoc.postedBy,
      type: 'post_like', // We'll need to add 'application' type
      message: `New application for ${jobDoc.title}`,
      data: { applicationId: newApplication._id, jobId: job }
    });

    const populatedApplication = await Application.findById(newApplication._id)
      .populate('job', 'title company')
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      });

    res.status(201).json({ message: 'Application submitted successfully', application: populatedApplication });
  } catch (error: any) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application', details: error.message });
  }
});

// @route   GET /api/applications
// @desc    Get user's applications
// @access  Private
router.get('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const userId = req.user!._id;
    const { status } = req.query;

    const query: any = { applicant: userId };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo industry'
        }
      })
      .populate('referredBy', 'profile.name profile.avatar')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'name logo industry'
        }
      })
      .populate('applicant', 'profile.name profile.avatar profile.major profile.skills')
      .populate('referredBy', 'profile.name profile.avatar')
      .populate('notes.author', 'profile.name')
      .populate('timeline.changedBy', 'profile.name');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const userId = req.user!._id;
    const job = await Job.findById(application.job);

    // Check authorization: applicant or job poster
    if (
      application.applicant._id.toString() !== userId.toString() &&
      job?.postedBy.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized to view this application' });
    }

    res.json({ application });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application', details: error.message });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Employers and Recruiters only)
// @access  Private
router.put('/:id/status', isAuthenticated, isEmployer, async (req: any, res: Response) => {
  try {
    const { status, notes } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const userId = req.user!._id;
    const job = application.job as any;

    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this application' });
    }

    application.status = status;
    application.timeline.push({
      status,
      changedAt: new Date(),
      changedBy: userId,
      notes
    });

    await application.save();

    // Notify applicant
    await Notification.create({
      user: application.applicant,
      type: 'post_like', // We'll need 'application_update' type
      message: `Your application for ${job.title} has been updated to: ${status}`,
      data: { applicationId: application._id, status }
    });

    res.json({ message: 'Application status updated', application });
  } catch (error: any) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application', details: error.message });
  }
});

// @route   POST /api/applications/:id/notes
// @desc    Add a note to application (Recruiter only)
// @access  Private
router.post('/:id/notes', isAuthenticated, async (req: any, res: Response) => {
  try {
    const { content } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const userId = req.user!._id;
    const job = application.job as any;

    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to add notes to this application' });
    }

    application.notes.push({
      author: userId,
      content,
      createdAt: new Date()
    });

    await application.save();

    const updatedApplication = await Application.findById(application._id)
      .populate('notes.author', 'profile.name');

    res.json({ message: 'Note added successfully', application: updatedApplication });
  } catch (error: any) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note', details: error.message });
  }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Applicant only)
router.put('/:id/withdraw', isAuthenticated, async (req: any, res: Response) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const userId = req.user!._id;

    if (application.applicant.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to withdraw this application' });
    }

    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ error: 'Cannot withdraw application in current status' });
    }

    application.status = 'withdrawn';
    application.timeline.push({
      status: 'withdrawn',
      changedAt: new Date(),
      notes: 'Withdrawn by applicant'
    });

    await application.save();

    res.json({ message: 'Application withdrawn successfully', application });
  } catch (error: any) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application', details: error.message });
  }
});

export default router;
