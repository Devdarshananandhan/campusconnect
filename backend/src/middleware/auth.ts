import { Response } from 'express';

const isAuthenticated = (req: any, res: Response, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};

/**
 * Middleware to check if user has one of the allowed roles
 * @param allowedRoles - Array of role strings that are allowed to access the route
 */
const hasRole = (...allowedRoles: string[]) => {
  return (req: any, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(403).json({ error: 'Forbidden: No role assigned' });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden: Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole 
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is an employer
 */
const isEmployer = hasRole('employer', 'recruiter');

/**
 * Middleware to check if user can apply to jobs (student or alumni)
 */
const canApplyToJobs = hasRole('student', 'alumni');

/**
 * Middleware to check if user can provide referrals (alumni, faculty, employer, recruiter)
 */
const canProvideReferrals = hasRole('alumni', 'faculty', 'employer', 'recruiter');

/**
 * Middleware to check if user can mentor (alumni, faculty)
 */
const canMentor = hasRole('alumni', 'faculty');

export { 
  isAuthenticated, 
  hasRole, 
  isEmployer, 
  canApplyToJobs, 
  canProvideReferrals,
  canMentor 
};