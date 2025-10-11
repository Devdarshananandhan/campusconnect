import express, { Request, Response } from 'express';
import Company from '../models/Company';
import CompanyReview from '../models/CompanyReview';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/companies
// @desc    Get all companies
// @access  Private
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { industry, size, search, limit = 20, offset = 0 } = req.query;

    const query: any = {};

    if (industry) query.industry = industry;
    if (size) query.size = size;
    if (search) {
      query.$text = { $search: search as string };
    }

    const companies = await Company.find(query)
      .select('-recruiters') // Don't expose recruiter list publicly
      .sort({ featured: -1, alumniCount: -1 })
      .skip(parseInt(offset as string))
      .limit(parseInt(limit as string))
      .lean();

    const total = await Company.countDocuments(query);

    res.json({ companies, total, limit: parseInt(limit as string), offset: parseInt(offset as string) });
  } catch (error: any) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies', details: error.message });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Private
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate({
        path: 'jobs',
        match: { status: 'active' },
        options: { limit: 10, sort: { createdAt: -1 } },
        select: 'title type location experienceLevel createdAt'
      })
      .populate({
        path: 'alumniReviews',
        options: { limit: 5, sort: { createdAt: -1 } },
        populate: {
          path: 'reviewer',
          select: 'profile.name profile.avatar profile.graduationYear'
        }
      });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error: any) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company', details: error.message });
  }
});

// @route   POST /api/companies
// @desc    Create a company profile
// @access  Private
router.post('/', isAuthenticated, async (req: any, res: Response) => {
  try {
    const {
      name,
      logo,
      website,
      industry,
      size,
      description,
      founded,
      headquarters,
      locations,
      culture,
      socialLinks
    } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    const userId = req.user!._id;

    const newCompany = new Company({
      name,
      logo,
      website,
      industry,
      size: size || 'medium',
      description,
      founded,
      headquarters,
      locations: locations || [],
      culture: culture || { values: [], perks: [], workLifeBalance: 3, diversity: 3, innovation: 3 },
      socialLinks: socialLinks || {},
      alumniCount: 0,
      recruiters: [userId],
      verified: false,
      featured: false,
      createdBy: userId
    });

    await newCompany.save();

    res.status(201).json({ message: 'Company created successfully', company: newCompany });
  } catch (error: any) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company', details: error.message });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update company profile
// @access  Private (Recruiters only)
router.put('/:id', isAuthenticated, async (req: any, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const userId = req.user!._id;
    const isRecruiter = company.recruiters.some((r: any) => r.toString() === userId.toString());

    if (!isRecruiter) {
      return res.status(403).json({ error: 'Not authorized to update this company' });
    }

    const updates = req.body;
    delete updates.recruiters; // Prevent unauthorized recruiter changes
    delete updates.verified; // Only admins can verify
    delete updates.createdBy;

    Object.assign(company, updates);
    await company.save();

    res.json({ message: 'Company updated successfully', company });
  } catch (error: any) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company', details: error.message });
  }
});

// @route   POST /api/companies/:id/reviews
// @desc    Add a review for a company
// @access  Private (Alumni only)
router.post('/:id/reviews', isAuthenticated, async (req: any, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const userId = req.user!._id;

    // Check if user already reviewed
    const existingReview = await CompanyReview.findOne({ company: company._id, reviewer: userId });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this company' });
    }

    const {
      rating,
      position,
      employmentType,
      tenure,
      pros,
      cons,
      advice,
      wouldRecommend
    } = req.body;

    const newReview = new CompanyReview({
      company: company._id,
      reviewer: userId,
      rating,
      position,
      employmentType,
      tenure,
      pros,
      cons,
      advice,
      wouldRecommend,
      verified: false
    });

    await newReview.save();

    // Add review to company
    company.alumniReviews.push(newReview._id as any);
    company.alumniCount += 1;
    await company.save();

    const populatedReview = await CompanyReview.findById(newReview._id)
      .populate('reviewer', 'profile.name profile.avatar profile.graduationYear');

    res.status(201).json({ message: 'Review submitted successfully', review: populatedReview });
  } catch (error: any) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review', details: error.message });
  }
});

// @route   GET /api/companies/:id/reviews
// @desc    Get all reviews for a company
// @access  Private
router.get('/:id/reviews', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const reviews = await CompanyReview.find({ company: req.params.id })
      .populate('reviewer', 'profile.name profile.avatar profile.graduationYear')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews', details: error.message });
  }
});

// @route   POST /api/companies/:id/reviews/:reviewId/helpful
// @desc    Mark a review as helpful
// @access  Private
router.post('/:id/reviews/:reviewId/helpful', isAuthenticated, async (req: any, res: Response) => {
  try {
    const review = await CompanyReview.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userId = req.user!._id;

    if (review.helpful.includes(userId)) {
      // Remove from helpful
      review.helpful = review.helpful.filter((id: any) => id.toString() !== userId.toString());
    } else {
      // Add to helpful
      review.helpful.push(userId);
    }

    await review.save();

    res.json({ message: 'Updated successfully', helpfulCount: review.helpful.length });
  } catch (error: any) {
    console.error('Error updating helpful:', error);
    res.status(500).json({ error: 'Failed to update', details: error.message });
  }
});

export default router;
