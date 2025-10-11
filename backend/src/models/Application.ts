import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  resume: string; // URL to resume file
  coverLetter?: string;
  answers: {
    question: string;
    answer: string;
  }[];
  status: 'applied' | 'under-review' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn' | 'hired';
  referredBy?: mongoose.Types.ObjectId; // Alumni who referred this candidate
  timeline: {
    status: string;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    notes?: string;
  }[];
  notes: {
    author: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  rating?: number; // Employer rating (1-5)
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    resume: {
      type: String,
      required: true
    },
    coverLetter: {
      type: String
    },
    answers: [{
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true
      }
    }],
    status: {
      type: String,
      enum: ['applied', 'under-review', 'interviewing', 'offered', 'rejected', 'withdrawn', 'hired'],
      default: 'applied',
      index: true
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    timeline: [{
      status: {
        type: String,
        required: true
      },
      changedAt: {
        type: Date,
        default: Date.now
      },
      changedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: String
    }],
    notes: [{
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure user can't apply twice to same job
ApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
ApplicationSchema.index({ status: 1, createdAt: -1 });

// Automatically add to timeline when status changes
ApplicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      changedAt: new Date(),
      notes: undefined,
      changedBy: undefined
    });
  }
  next();
});

// Transform _id to id in JSON responses
ApplicationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);
