import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['status', 'job', 'opportunity', 'achievement', 'announcement', 'article', 'question'],
    default: 'status',
    index: true
  },
  attachments: [{
    type: { type: String, enum: ['image', 'video', 'document'] },
    url: String,
    thumbnail: String
  }],
  tags: [String],
  // For job/opportunity posts
  opportunityDetails: {
    title: String,
    company: String,
    location: String,
    deadline: Date,
    applyLink: String,
    type: { type: String, enum: ['internship', 'full-time', 'part-time', 'volunteer', 'research'] }
  },
  likes: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  shares: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  visibility: { 
    type: String, 
    enum: ['public', 'connections', 'private'], 
    default: 'public' 
  },
  isPinned: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
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

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
const Post = mongoose.model('Post', postSchema);

export default Post;