import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanyReview extends Document {
  company: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId; // Alumni who worked here
  rating: {
    overall: number;
    workLifeBalance: number;
    compensation: number;
    careerGrowth: number;
    management: number;
    culture: number;
  };
  position: string; // Job title they had
  employmentType: 'full-time' | 'part-time' | 'internship' | 'contract';
  tenure: {
    start: Date;
    end?: Date;
    current: boolean;
  };
  pros: string;
  cons: string;
  advice?: string; // Advice for students applying
  wouldRecommend: boolean;
  verified: boolean; // Verified by admin
  helpful: mongoose.Types.ObjectId[]; // Users who found this helpful
  createdAt: Date;
  updatedAt: Date;
}

const CompanyReviewSchema: Schema = new Schema(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      workLifeBalance: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      compensation: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      careerGrowth: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      management: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      culture: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      }
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      required: true
    },
    tenure: {
      start: {
        type: Date,
        required: true
      },
      end: Date,
      current: {
        type: Boolean,
        default: false
      }
    },
    pros: {
      type: String,
      required: true
    },
    cons: {
      type: String,
      required: true
    },
    advice: {
      type: String,
      trim: true
    },
    wouldRecommend: {
      type: Boolean,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    helpful: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// Ensure one review per company per user
CompanyReviewSchema.index({ company: 1, reviewer: 1 }, { unique: true });

// Transform _id to id in JSON responses
CompanyReviewSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.model<ICompanyReview>('CompanyReview', CompanyReviewSchema);
