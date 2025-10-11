import express, { Request, Response } from 'express';
import Job from '../models/Job';
import Company from '../models/Company';
import Application from '../models/Application';
import { isAuthenticated, isEmployer } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all jobs with filters
// @access  Private
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const {
      type,
      location,
      experienceLevel,
      search,
      skills,
      isRemote,
      company,
      status = 'active',
      limit = 20,
      offset = 0
    } = req.query;

    const query: any = { status };

    if (type) query.type = type;
    if (location) query.location = new RegExp(location as string, 'i');
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (isRemote === 'true') query.isRemote = true;
    if (company) query.company = company;
    
    if (skills) {
      const skillsArray = (skills as string).split(',');
      query.skills = { $in: skillsArray };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const jobs = await Job.find(query)
      .populate('company', 'name logo industry size headquarters')
      .populate('postedBy', 'profile.name')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .lean();

    const total = await Job.countDocuments(query);

    res.json({ jobs, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
});

// @route   GET /api/jobs/:id
// @desc    Get single job by ID
// @access  Private
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company')
      .populate('postedBy', 'profile.name profile.avatar')
      .populate({
        path: 'referrals',
        populate: {
          path: 'referrer',
          select: 'profile.name profile.avatar'
        }
      });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({ job });
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job', details: error.message });
  }
});

// @route   POST /api/jobs
// @desc    Create a new job posting
// @access  Private (Employers and Recruiters only)
router.post('/', isAuthenticated, isEmployer, async (req: any, res: Response) => {
  try {
    const {
      title,
      company,
      description,
      requirements,
      responsibilities,
      type,
      location,
      locationType,
      salaryRange,
      experienceLevel,
      skills,
      benefits,
      applicationDeadline,
      tags,
      isRemote
    } = req.body;

    // Verify company exists
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Check if user is authorized to post for this company
    const userId = req.user!._id;
    const isRecruiter = companyDoc.recruiters.some((r: any) => r.toString() === userId.toString());
    
    if (!isRecruiter) {
      return res.status(403).json({ error: 'You are not authorized to post jobs for this company' });
    }

    const newJob = new Job({
      title,
      company,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      type,
      location,
      locationType: locationType || 'on-site',
      salaryRange,
      experienceLevel: experienceLevel || 'entry',
      skills: skills || [],
      benefits: benefits || [],
      applicationDeadline,
      postedBy: userId,
      status: 'active',
      tags: tags || [],
      isRemote: isRemote || false,
      isFeatured: false
    });

    await newJob.save();

    // Add job to company's jobs array
    companyDoc.jobs.push(newJob._id as any);
    await companyDoc.save();

    const populatedJob = await Job.findById(newJob._id)
      .populate('company', 'name logo industry')
      .populate('postedBy', 'profile.name');

    res.status(201).json({ message: 'Job posted successfully', job: populatedJob });
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
});

// @route   PUT /api/jobs/:id
// @desc    Update job posting
// @access  Private (Employers and Recruiters only - Job poster)
router.put('/:id', isAuthenticated, isEmployer, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const userId = req.user!._id;
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to update this job' });
    }

    const updates = req.body;
    delete updates.postedBy; // Prevent changing the poster
    delete updates.company; // Prevent changing the company

    Object.assign(job, updates);
    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate('company', 'name logo')
      .populate('postedBy', 'profile.name');

    res.json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job', details: error.message });
  }
});

// @route   DELETE /api/jobs/:id
// @desc    Delete job posting
// @access  Private (Employers and Recruiters only - Job poster)
router.delete('/:id', isAuthenticated, isEmployer, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const userId = req.user!._id;
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this job' });
    }

    // Remove from company's jobs array
    await Company.findByIdAndUpdate(job.company, {
      $pull: { jobs: job._id }
    });

    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job', details: error.message });
  }
});

// @route   GET /api/jobs/:id/applications
// @desc    Get all applications for a job (Employers and Recruiters only)
// @access  Private
router.get('/:id/applications', isAuthenticated, isEmployer, async (req: any, res: Response) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const userId = req.user!._id;
    if (job.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'You are not authorized to view applications for this job' });
    }

    const applications = await Application.find({ job: job._id })
      .populate('applicant', 'profile.name profile.avatar profile.major profile.graduationYear')
      .populate('referredBy', 'profile.name profile.avatar')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications', details: error.message });
  }
});

export default router;
