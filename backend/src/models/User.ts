import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'alumni', 'faculty', 'employer', 'recruiter'], 
    required: true,
    index: true 
  },
  // Company association for employers/recruiters
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  profile: {
    name: { type: String, required: true },
    avatar: String,
    bio: String,
    major: String,
    graduationYear: String,
    company: String,
    department: String,
    jobTitle: String, // Added for employers/recruiters
    skills: [String],
    interests: [String],
    location: String,
    linkedinUrl: String,
    githubUrl: String
  },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  endorsements: [{
    skill: String,
    endorsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  // Career & Academic Information
  careerGoals: String,
  currentPosition: String,
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: Number,
    endYear: Number,
    current: Boolean
  }],
  // Mentorship Information
  mentorProfile: {
    isAvailable: { type: Boolean, default: false },
    expertiseAreas: [String],
    availability: String,
    maxMentees: { type: Number, default: 5 },
    bio: String,
    achievements: [String]
  },
  // Gamification
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    stats: {
      eventsAttended: { type: Number, default: 0 },
      connectionsAdded: { type: Number, default: 0 },
      mentorshipHours: { type: Number, default: 0 },
      skillsEndorsed: { type: Number, default: 0 },
      postsCreated: { type: Number, default: 0 }
    }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
    showEmail: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for search
userSchema.index({ 
  'profile.name': 'text', 
  'profile.skills': 'text', 
  'profile.bio': 'text' 
});

const User = mongoose.model('User', userSchema);
export default User;