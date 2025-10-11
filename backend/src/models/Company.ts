import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  logo?: string;
  website?: string;
  industry: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  description: string;
  founded?: number;
  headquarters: string;
  locations: string[];
  culture: {
    values: string[];
    perks: string[];
    workLifeBalance: number; // 1-5 rating
    diversity: number; // 1-5 rating
    innovation: number; // 1-5 rating
  };
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  alumniCount: number; // Number of XYZ alumni working here
  alumniReviews: mongoose.Types.ObjectId[]; // Reference to Review model
  jobs: mongoose.Types.ObjectId[]; // Reference to Job model
  recruiters: mongoose.Types.ObjectId[]; // User IDs with recruiter access
  verified: boolean;
  featured: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    logo: {
      type: String
    },
    website: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      required: true,
      index: true
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise'],
      default: 'medium'
    },
    description: {
      type: String,
      required: true
    },
    founded: {
      type: Number
    },
    headquarters: {
      type: String,
      required: true
    },
    locations: [{
      type: String,
      trim: true
    }],
    culture: {
      values: [{
        type: String,
        trim: true
      }],
      perks: [{
        type: String,
        trim: true
      }],
      workLifeBalance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      diversity: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      },
      innovation: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String
    },
    alumniCount: {
      type: Number,
      default: 0
    },
    alumniReviews: [{
      type: Schema.Types.ObjectId,
      ref: 'CompanyReview'
    }],
    jobs: [{
      type: Schema.Types.ObjectId,
      ref: 'Job'
    }],
    recruiters: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    verified: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Text search index
CompanySchema.index({ name: 'text', description: 'text', industry: 'text' });

// Transform _id to id in JSON responses
CompanySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.model<ICompany>('Company', CompanySchema);
