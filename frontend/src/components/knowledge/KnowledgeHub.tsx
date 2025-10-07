import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookMarked, 
  TrendingUp, 
  Award, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare,
  Eye,
  BookmarkPlus,
  Share2,
  Clock,
  Building2,
  Briefcase,
  Code,
  GraduationCap,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { KnowledgePost } from '../../types';
import api from '../../services/api';

interface KnowledgeHubProps {
  currentUser: any;
}

const KnowledgeHub: React.FC<KnowledgeHubProps> = ({ currentUser }) => {
  const [posts, setPosts] = useState<KnowledgePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'recent' | 'popular' | 'helpful'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<KnowledgePost | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { value: 'all', label: 'All Topics', icon: '📚' },
    { value: 'career-advice', label: 'Career Advice', icon: '💼' },
    { value: 'interview-tips', label: 'Interview Tips', icon: '🎯' },
    { value: 'industry-insights', label: 'Industry Insights', icon: '🏢' },
    { value: 'course-guidance', label: 'Course Guidance', icon: '📖' },
    { value: 'research-tips', label: 'Research Tips', icon: '🔬' },
    { value: 'networking-strategies', label: 'Networking', icon: '🤝' },
    { value: 'skill-development', label: 'Skill Development', icon: '💡' },
    { value: 'job-search', label: 'Job Search', icon: '🔍' },
    { value: 'academic-to-industry', label: 'Academia → Industry', icon: '🎓' },
  ];

  useEffect(() => {
    loadPosts();
  }, [searchQuery, selectedCategory, sortBy, page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        sortBy,
        page,
        limit: 20,
      };

      if (searchQuery) params.q = searchQuery;
      if (selectedCategory !== 'all') params.category = selectedCategory;

      const response = await api.searchKnowledgePosts(params);
      setPosts(response.posts);
      setTotal(response.total);
    } catch (err) {
      console.error('Failed to load knowledge posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    try {
      await api.voteKnowledgePost(postId, voteType);
      loadPosts(); // Reload to get updated votes
    } catch (err) {
      console.error('Vote failed:', err);
    }
  };

  const handleMarkHelpful = async (postId: string) => {
    try {
      await api.markKnowledgePostHelpful(postId);
      loadPosts();
    } catch (err) {
      console.error('Mark helpful failed:', err);
    }
  };

  const handleBookmark = async (postId: string) => {
    try {
      await api.bookmarkKnowledgePost(postId);
      loadPosts();
    } catch (err) {
      console.error('Bookmark failed:', err);
    }
  };

  const KnowledgePostCard: React.FC<{ post: KnowledgePost }> = ({ post }) => {
    const author = typeof post.author === 'string' ? null : post.author;
    const isUpvoted = typeof currentUser === 'object' && post.upvotes.includes(currentUser._id || currentUser.id);
    const isDownvoted = typeof currentUser === 'object' && post.downvotes.includes(currentUser._id || currentUser.id);
    const isBookmarked = typeof currentUser === 'object' && post.bookmarks.includes(currentUser._id || currentUser.id);

    return (
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img
              src={author?.profile?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt={author?.profile?.name || 'User'}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">{author?.profile?.name || 'Anonymous'}</h4>
                {post.verifiedByAdmin && (
                  <span title="Verified by Admin">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{author?.role === 'alumni' ? '🎓 Alumni' : author?.role === 'faculty' ? '👨‍🏫 Faculty' : '👤 User'}</span>
                {author?.profile?.company && (
                  <>
                    <span>•</span>
                    <Building2 className="w-3 h-3" />
                    <span>{author.profile.company}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {post.isPinned && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">📌 Pinned</span>
            )}
            {post.isEvergreen && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">🌲 Evergreen</span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
            onClick={() => setSelectedPost(post)}>
          {post.title}
        </h3>

        {/* Body Preview */}
        <p className="text-gray-700 mb-4 line-clamp-3">{post.body}</p>

        {/* Tags and Metadata */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {categories.find(c => c.value === post.category)?.label || post.category}
            </span>
          )}
          {post.relatedSkills?.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full flex items-center">
              <Code className="w-3 h-3 mr-1" />
              {skill}
            </span>
          ))}
          {post.company && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center">
              <Briefcase className="w-3 h-3 mr-1" />
              {post.company}
            </span>
          )}
        </div>

        {/* Engagement Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Voting */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(post._id, 'up')}
                className={`p-2 rounded-lg transition-colors ${
                  isUpvoted ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
                }`}
                aria-label="Upvote"
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-900">{post.voteScore}</span>
              <button
                onClick={() => handleVote(post._id, 'down')}
                className={`p-2 rounded-lg transition-colors ${
                  isDownvoted ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                }`}
                aria-label="Downvote"
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>

            {/* Comments */}
            <div className="flex items-center space-x-1 text-gray-600">
              <MessageSquare className="w-5 h-5" />
              <span>{post.comments?.length || 0}</span>
            </div>

            {/* Views */}
            <div className="flex items-center space-x-1 text-gray-600">
              <Eye className="w-5 h-5" />
              <span>{post.views}</span>
            </div>

            {/* Helpful */}
            <button
              onClick={() => handleMarkHelpful(post._id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-orange-600 transition-colors"
            >
              <Award className="w-5 h-5" />
              <span>{post.helpfulCount}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBookmark(post._id)}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'
              }`}
              aria-label="Bookmark"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100" aria-label="Share">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Create Post Modal Component
  const CreatePostModal: React.FC = () => {
    const [formData, setFormData] = useState({
      title: '',
      body: '',
      category: 'career-advice',
      tags: [] as string[],
      company: '',
      industry: '',
      relatedSkills: [] as string[],
      courseCodes: [] as string[],
      isEvergreen: false,
    });
    const [tagInput, setTagInput] = useState('');
    const [skillInput, setSkillInput] = useState('');
    const [courseInput, setCourseInput] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleAddTag = () => {
      if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
        setTagInput('');
      }
    };

    const handleAddSkill = () => {
      if (skillInput.trim() && !formData.relatedSkills.includes(skillInput.trim())) {
        setFormData({ ...formData, relatedSkills: [...formData.relatedSkills, skillInput.trim()] });
        setSkillInput('');
      }
    };

    const handleAddCourse = () => {
      if (courseInput.trim() && !formData.courseCodes.includes(courseInput.trim())) {
        setFormData({ ...formData, courseCodes: [...formData.courseCodes, courseInput.trim()] });
        setCourseInput('');
      }
    };

    const handleRemoveTag = (tag: string) => {
      setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const handleRemoveSkill = (skill: string) => {
      setFormData({ ...formData, relatedSkills: formData.relatedSkills.filter(s => s !== skill) });
    };

    const handleRemoveCourse = (course: string) => {
      setFormData({ ...formData, courseCodes: formData.courseCodes.filter(c => c !== course) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.title.trim() || !formData.body.trim()) {
        setSubmitError('Title and body are required');
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        await api.createKnowledgePost(formData);
        setShowCreateModal(false);
        loadPosts(); // Reload posts
        
        // Reset form
        setFormData({
          title: '',
          body: '',
          category: 'career-advice',
          tags: [],
          company: '',
          industry: '',
          relatedSkills: [],
          courseCodes: [],
          isEvergreen: false,
        });
      } catch (err: any) {
        setSubmitError(err.message || 'Failed to create post');
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">✍️ Share Your Knowledge</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700">{submitError}</p>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., How to Ace the Google Technical Interview"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select category"
              >
                {categories.filter(c => c.value !== 'all').map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Share your insights, tips, and advice in detail..."
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.body.length} characters
              </p>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., Google, Microsoft, Amazon"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry (Optional)
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology, Finance, Healthcare"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags (e.g., interview, algorithms)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  aria-label="Add tag"
                  title="Add tag"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center space-x-1">
                    <span>{tag}</span>
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900" aria-label={`Remove tag ${tag}`} title="Remove tag">
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Related Skills */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Related Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skills (e.g., Python, System Design)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                  aria-label="Add skill"
                  title="Add skill"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.relatedSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center space-x-1">
                    <Code className="w-3 h-3" />
                    <span>{skill}</span>
                    <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-purple-900" aria-label={`Remove skill ${skill}`} title="Remove skill">
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Course Codes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Codes (Optional)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCourse())}
                  placeholder="Add course codes (e.g., CS101, MATH202)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddCourse}
                  className="px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  aria-label="Add course code"
                  title="Add course code"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.courseCodes.map((course) => (
                  <span key={course} className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center space-x-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>{course}</span>
                    <button type="button" onClick={() => handleRemoveCourse(course)} className="hover:text-green-900" aria-label={`Remove course ${course}`} title="Remove course">
                      <Minus className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Evergreen */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isEvergreen}
                  onChange={(e) => setFormData({ ...formData, isEvergreen: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="font-semibold text-gray-700">Mark as Evergreen Content</span>
                  <p className="text-sm text-gray-500">This advice will remain relevant over time</p>
                </div>
              </label>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Publishing...' : 'Publish Knowledge Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">\n      {/* Create Post Modal */}\n      {showCreateModal && <CreatePostModal />}\n\n      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎓 Collective Knowledge Hub
            </h1>
            <p className="text-gray-600 mt-2">
              Discover insights from alumni and faculty. Search, learn, and contribute to the community wisdom.
            </p>
          </div>
          {(currentUser?.role === 'alumni' || currentUser?.role === 'faculty') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              ✍️ Share Your Knowledge
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          {/* Search Bar */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by company, skill, course code, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center space-x-2"
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                aria-label="Sort posts"
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="recent">🕒 Most Recent</option>
                <option value="helpful">⭐ Most Helpful</option>
                <option value="relevance">🎯 Most Relevant</option>
              </select>
            </div>
            <span className="text-sm text-gray-600">
              {total} {total === 1 ? 'post' : 'posts'} found
            </span>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <BookMarked className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No knowledge posts found</h3>
            <p className="text-gray-500">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Be the first to share your insights!'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <KnowledgePostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {total > 20 && (
              <div className="flex justify-center mt-8 space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeHub;
