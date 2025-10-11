import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  job: mongoose.Types.ObjectId;
  candidate: mongoose.Types.ObjectId; // Student being referred
  referrer: mongoose.Types.ObjectId; // Alumni making the referral
  status: 'pending' | 'accepted' | 'declined' | 'application-submitted' | 'hired';
  message?: string; // Referrer's endorsement message
  relationship: 'classmate' | 'colleague' | 'mentor' | 'friend' | 'other';
  strength: 'strong' | 'moderate' | 'weak'; // How well referrer knows candidate
  requestMessage?: string; // Original request from student
  responseMessage?: string; // Referrer's response
  company: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema: Schema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    referrer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'application-submitted', 'hired'],
      default: 'pending',
      index: true
    },
    message: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      enum: ['classmate', 'colleague', 'mentor', 'friend', 'other'],
      required: true
    },
    strength: {
      type: String,
      enum: ['strong', 'moderate', 'weak'],
      required: true
    },
    requestMessage: {
      type: String,
      trim: true
    },
    responseMessage: {
      type: String,
      trim: true
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate referrals
ReferralSchema.index({ job: 1, candidate: 1, referrer: 1 }, { unique: true });

// Transform _id to id in JSON responses
ReferralSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

export default mongoose.model<IReferral>('Referral', ReferralSchema);
