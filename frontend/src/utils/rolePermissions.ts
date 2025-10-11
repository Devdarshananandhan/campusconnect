// Role-Based Access Control (RBAC) Utilities

export type UserRole = 'student' | 'alumni' | 'faculty' | 'employer' | 'recruiter';

export interface RolePermissions {
  // Career Features
  canBrowseJobs: boolean;
  canApplyToJobs: boolean;
  canPostJobs: boolean;
  canViewEmployerDashboard: boolean;
  canViewApplicants: boolean;
  canRequestReferrals: boolean;
  canProvideReferrals: boolean;
  canReviewCompanies: boolean;
  
  // Social Features
  canCreatePosts: boolean;
  canJoinGroups: boolean;
  canAttendEvents: boolean;
  canUseMentorship: boolean;
  canUseMessaging: boolean;
  
  // Academic Features
  canAccessKnowledgeHub: boolean;
  canEarnBadges: boolean;
}

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = (role: UserRole): RolePermissions => {
  const basePermissions: RolePermissions = {
    canBrowseJobs: true,
    canApplyToJobs: false,
    canPostJobs: false,
    canViewEmployerDashboard: false,
    canViewApplicants: false,
    canRequestReferrals: false,
    canProvideReferrals: false,
    canReviewCompanies: false,
    canCreatePosts: true,
    canJoinGroups: true,
    canAttendEvents: true,
    canUseMentorship: false,
    canUseMessaging: true,
    canAccessKnowledgeHub: true,
    canEarnBadges: true,
  };

  switch (role) {
    case 'student':
      return {
        ...basePermissions,
        canApplyToJobs: true,
        canRequestReferrals: true,
        canReviewCompanies: false, // Students can't review until they've worked there
        canUseMentorship: true,
      };

    case 'alumni':
      return {
        ...basePermissions,
        canApplyToJobs: true,
        canRequestReferrals: true,
        canProvideReferrals: true,
        canReviewCompanies: true,
        canUseMentorship: true,
      };

    case 'faculty':
      return {
        ...basePermissions,
        canApplyToJobs: false,
        canRequestReferrals: false,
        canProvideReferrals: true,
        canReviewCompanies: false,
        canUseMentorship: true,
      };

    case 'employer':
    case 'recruiter':
      return {
        ...basePermissions,
        canApplyToJobs: false,
        canPostJobs: true,
        canViewEmployerDashboard: true,
        canViewApplicants: true,
        canRequestReferrals: false,
        canProvideReferrals: false,
        canReviewCompanies: false,
        canUseMentorship: false,
        canEarnBadges: false, // Employers don't participate in gamification
      };

    default:
      return basePermissions;
  }
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (
  role: UserRole | undefined,
  permission: keyof RolePermissions
): boolean => {
  if (!role) return false;
  const permissions = getRolePermissions(role);
  return permissions[permission];
};

/**
 * Get display name for role
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    student: 'Student',
    alumni: 'Alumni',
    faculty: 'Faculty',
    employer: 'Employer',
    recruiter: 'Recruiter',
  };
  return displayNames[role] || role;
};

/**
 * Get role badge color
 */
export const getRoleBadgeColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    student: 'bg-blue-100 text-blue-700',
    alumni: 'bg-green-100 text-green-700',
    faculty: 'bg-purple-100 text-purple-700',
    employer: 'bg-orange-100 text-orange-700',
    recruiter: 'bg-pink-100 text-pink-700',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

/**
 * Check if user can access a specific view
 */
export const canAccessView = (role: UserRole | undefined, view: string): boolean => {
  if (!role) return false;
  
  const permissions = getRolePermissions(role);
  
  const viewPermissions: Record<string, keyof RolePermissions> = {
    'careers': 'canBrowseJobs',
    'companies': 'canBrowseJobs',
    'my-applications': 'canApplyToJobs',
    'referrals': 'canRequestReferrals',
    'referral-dashboard': 'canProvideReferrals',
    'employer-dashboard': 'canViewEmployerDashboard',
    'mentorship': 'canUseMentorship',
    'knowledge': 'canAccessKnowledgeHub',
    'leaderboard': 'canEarnBadges',
    'badges': 'canEarnBadges',
  };
  
  const permissionKey = viewPermissions[view];
  if (!permissionKey) return true; // Default allow for unmapped views
  
  return permissions[permissionKey];
};
