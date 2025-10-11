// User Types
export interface User {
  id: string;
  email: string;
  role: 'student' | 'alumni' | 'faculty';
  profile: UserProfile;
  connections: string[];
  endorsements: Endorsement[];
  careerGoals?: string;
  currentPosition?: string;
  experience: Experience[];
  education: Education[];
  mentorProfile?: MentorProfile;
  gamification: Gamification;
  privacy: Privacy;
  isActive: boolean;
  lastActive: Date;
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  bio?: string;
  major?: string;
  graduationYear?: string;
  company?: string;
  department?: string;
  skills: string[];
  interests: string[];
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface Endorsement {
  skill: string;
  endorsedBy: string;
  createdAt: Date;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  current: boolean;
}

export interface MentorProfile {
  isAvailable: boolean;
  expertiseAreas: string[];
  availability?: string;
  maxMentees: number;
  bio?: string;
  achievements: string[];
}

export interface Gamification {
  points: number;
  level: number;
  badges: Badge[];
  stats: UserStats;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface UserStats {
  eventsAttended: number;
  connectionsAdded: number;
  mentorshipHours: number;
  skillsEndorsed: number;
  postsCreated: number;
}

export interface Privacy {
  profileVisibility: 'public' | 'connections' | 'private';
  showEmail: boolean;
}

// Post Types
export interface Post {
  id: string;
  author: User;
  content: string;
  type: 'status' | 'job' | 'opportunity' | 'achievement' | 'announcement' | 'article' | 'question';
  attachments: Attachment[];
  tags: string[];
  opportunityDetails?: OpportunityDetails;
  likes: Like[];
  comments: Comment[];
  shares: Share[];
  visibility: 'public' | 'connections' | 'private';
  isPinned: boolean;
  isReported: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
}

export interface OpportunityDetails {
  title: string;
  company: string;
  location: string;
  deadline?: Date;
  applyLink?: string;
  type: 'internship' | 'full-time' | 'part-time' | 'volunteer' | 'research';
}

export interface Like {
  user: string;
  createdAt: Date;
}

export interface Comment {
  user: User;
  content: string;
  createdAt: Date;
}

export interface Share {
  user: string;
  createdAt: Date;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  category: 'Career' | 'Academic' | 'Cultural' | 'Networking' | 'Workshop' | 'Other';
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  organizer: User;
  attendees: Attendee[];
  maxAttendees?: number;
  capacity?: number;
  tags: string[];
  imageUrl?: string;
  isPublished: boolean;
  feedback: EventFeedback[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendee {
  user: string;
  rsvpDate: Date;
  attended: boolean;
}

export interface EventFeedback {
  user: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// Mentorship Types
export interface Mentorship {
  id: string;
  mentor: User;
  mentee: User;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  topic: string;
  description?: string;
  goals: string[];
  sessions: MentorshipSession[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorshipSession {
  date: Date;
  duration: number;
  notes?: string;
  completed: boolean;
}

// Connection Types
export interface Connection {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  user: User;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

// Notification Types
export interface Notification {
  id: string;
  user: string;
  type: NotificationType;
  title?: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType =
  | 'connection_request'
  | 'connection_accepted'
  | 'message'
  | 'event_reminder'
  | 'event_invitation'
  | 'event_update'
  | 'event_cancelled'
  | 'endorsement'
  | 'mentorship_request'
  | 'mentorship_accepted'
  | 'mentorship_session'
  | 'post_like'
  | 'post_comment'
  | 'post_share'
  | 'group_invitation'
  | 'group_request'
  | 'badge_earned'
  | 'level_up'
  | 'announcement';

// Group Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'major' | 'club' | 'research' | 'career' | 'project' | 'other';
  privacy: 'public' | 'private' | 'secret';
  avatar?: string;
  coverImage?: string;
  creator: string;
  admins: string[];
  members: GroupMember[];
  pendingRequests: GroupRequest[];
  tags: string[];
  rules: string[];
  posts: string[];
  events: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  user: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

export interface GroupRequest {
  user: string;
  message?: string;
  requestedAt: Date;
}

// Skill Gap Types
export interface SkillGap {
  id: string;
  user: string;
  careerGoal: string;
  currentSkills: string[];
  requiredSkills: string[];
  skillGaps: SkillGapItem[];
  suggestedMentors: SuggestedMentor[];
  progress: SkillProgress[];
  lastAnalyzed: Date;
}

export interface SkillGapItem {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  recommendations: Recommendation[];
}

export interface Recommendation {
  type: 'course' | 'workshop' | 'mentor' | 'project';
  title: string;
  description: string;
  url?: string;
  provider?: string;
}

export interface SuggestedMentor {
  mentor: User;
  matchScore: number;
  reason: string;
}

export interface SkillProgress {
  skill: string;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: Date;
}

// Analytics Types
export interface Analytics {
  platform: PlatformAnalytics;
  userDistribution: UserDistribution;
  engagement: EngagementMetrics;
  mentorship: MentorshipAnalytics;
  events: EventAnalytics;
  connections: ConnectionAnalytics;
  popularSkills: PopularSkill[];
  topPosts: TopPost[];
  date: Date;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalConnections: number;
  totalEvents: number;
  totalMentorships: number;
  totalGroups: number;
}

export interface UserDistribution {
  students: number;
  alumni: number;
  faculty: number;
}

export interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  totalPosts: number;
  totalMessages: number;
}

export interface MentorshipAnalytics {
  activeMentorships: number;
  completedMentorships: number;
  totalMentorshipHours: number;
  averageRating: number;
  topMentors: TopMentor[];
}

export interface TopMentor {
  user: User;
  menteesCount: number;
  totalHours: number;
}

export interface EventAnalytics {
  totalCreated: number;
  totalAttendees: number;
  averageAttendance: number;
  rsvpRate: number;
  byCategory: EventCategoryStats[];
}

export interface EventCategoryStats {
  category: string;
  count: number;
  averageAttendance: number;
}

export interface ConnectionAnalytics {
  studentToAlumni: number;
  studentToFaculty: number;
  studentToStudent: number;
  alumniToAlumni: number;
  acceptanceRate: number;
}

export interface PopularSkill {
  skill: string;
  count: number;
  trending: boolean;
}

export interface TopPost {
  post: string;
  likes: number;
  comments: number;
  shares: number;
}

// Knowledge Hub Types
export interface KnowledgePost {
  _id: string;
  title: string;
  body: string;
  author: User | string;
  category: 
    | 'career-advice'
    | 'interview-tips'
    | 'industry-insights'
    | 'course-guidance'
    | 'research-tips'
    | 'networking-strategies'
    | 'skill-development'
    | 'job-search'
    | 'academic-to-industry'
    | 'other';
  tags: string[];
  company?: string;
  industry?: string;
  relatedSkills: string[];
  courseCodes?: string[];
  suggestedMentors: (User | string)[];
  verifiedByAdmin: boolean;
  verifiedBy?: User | string;
  verifiedAt?: Date;
  upvotes: (User | string)[];
  downvotes: (User | string)[];
  voteScore: number;
  views: number;
  helpfulCount: number;
  bookmarks: (User | string)[];
  comments: KnowledgeComment[];
  isActive: boolean;
  isPinned: boolean;
  isEvergreen: boolean;
  expiresAt?: Date;
  aiGeneratedTags?: string[];
  aiSuggestedSkills?: string[];
  aiMatchScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeComment {
  user: User | string;
  content: string;
  createdAt: Date;
  upvotes: (User | string)[];
}

// ==================== CAREER PLATFORM TYPES ====================

// Job Types
export interface Job {
  id: string;
  _id?: string;
  title: string;
  description: string;
  company: Company | string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'remote';
  location: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  department?: string;
  applicationDeadline?: Date;
  applyUrl?: string;
  postedBy: User | string;
  applications: Application[] | string[];
  isActive: boolean;
  featured: boolean;
  views: number;
  applicantCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Application Types
export interface Application {
  id: string;
  _id?: string;
  job: Job | string;
  applicant: User | string;
  resume: string;
  coverLetter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn';
  statusHistory: StatusChange[];
  answers?: Record<string, any>;
  customAnswers?: Record<string, any>;
  linkedinUrl?: string;
  portfolioUrl?: string;
  availableStartDate?: Date | string;
  referral?: Referral | string;
  notes?: string;
  employerNotes?: string;
  rating?: number;
  appliedAt: Date;
  updatedAt: Date;
}

export interface StatusChange {
  status: string;
  changedBy: User | string;
  changedAt: Date;
  notes?: string;
}

// Company Types
export interface Company {
  id: string;
  _id?: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  location: string;
  locations?: string[];
  foundedYear?: number;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  culture?: {
    values: string[];
    benefits: string[];
    workEnvironment?: string;
  };
  alumniEmployees: (User | string)[];
  followers: (User | string)[];
  jobs: (Job | string)[];
  reviews: CompanyReview[];
  averageRating: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyReview {
  id?: string;
  reviewer: User | string;
  rating: number;
  title: string;
  pros: string;
  cons: string;
  advice?: string;
  position?: string;
  employmentStatus: 'current' | 'former' | 'intern';
  isAnonymous: boolean;
  helpful: number;
  createdAt: Date;
}

// Referral Types
export interface Referral {
  id: string;
  _id?: string;
  job: Job | string;
  student: User | string;
  alumnus: User | string;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  message: string;
  relationship: 'classmate' | 'club-member' | 'project-partner' | 'mentor-mentee' | 'other';
  endorsement?: string;
  rejectionReason?: string;
  success?: boolean;
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

export interface ReferralStats {
  totalSent: number;
  totalReceived: number;
  approvalRate: number;
  successfulReferrals: number;
  vouchScore: number;
}
