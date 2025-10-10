import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ['major', 'club', 'research', 'career', 'project', 'other'],
    required: true,
    index: true
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  avatar: String,
  coverImage: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  pendingRequests: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    requestedAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  rules: [String],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ type: 1, privacy: 1 });

const Group = mongoose.model('Group', groupSchema);
export default Group;
