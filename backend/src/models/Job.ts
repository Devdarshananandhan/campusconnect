import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: mongoose.Types.ObjectId; // Reference to Company model
  description: string;
  requirements: string[];
  responsibilities: string[];
  type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'co-op';
  location: string;
  locationType: 'on-site' | 'remote' | 'hybrid';
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  skills: string[];
  benefits: string[];
  applicationDeadline?: Date;
  applyUrl?: string;
  postedBy: mongoose.Types.ObjectId; // User ID of employer
  status: 'active' | 'closed' | 'draft';
  applications: mongoose.Types.ObjectId[]; // Reference to Application model
  views: number;
  referrals: mongoose.Types.ObjectId[]; // Reference to Referral model
  tags: string[];
  isRemote: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    requirements: [{
      type: String,
      trim: true
    }],
    responsibilities: [{
      type: String,
      trim: true
    }],
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'co-op'],
      required: true,
      index: true
    },
    location: {
      type: String,
      required: true
    },
    locationType: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      default: 'on-site'
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    salaryMin: {
      type: Number
    },
    salaryMax: {
      type: Number
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive'],
      default: 'entry',
      index: true
    },
    skills: [{
      type: String,
      trim: true
    }],
    benefits: [{
      type: String,
      trim: true
    }],
    applicationDeadline: {
      type: Date
    },
    applyUrl: {
      type: String,
      trim: true
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
      index: true
    },
    applications: [{
      type: Schema.Types.ObjectId,
      ref: 'Application'
    }],
    views: {
      type: Number,
      default: 0
    },
    referrals: [{
      type: Schema.Types.ObjectId,
      ref: 'Referral'
    }],
    tags: [{
      type: String,
      trim: true
    }],
    isRemote: {
      type: Boolean,
      default: false,
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient searching
JobSchema.index({ title: 'text', description: 'text', skills: 'text' });
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ company: 1, status: 1 });

// Transform _id to id in JSON responses
JobSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.model<IJob>('Job', JobSchema);
