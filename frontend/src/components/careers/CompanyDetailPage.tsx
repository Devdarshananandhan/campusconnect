import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Star,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Twitter,
  Calendar,
  Heart,
  Share2,
  MessageSquare,
  TrendingUp,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Company, Job, CompanyReview } from '../../types';
import api from '../../services/api';
import JobCard from './JobCard';
import CompanyReviewForm from './CompanyReviewForm';

interface CompanyDetailPageProps {
  companyId: string;
  onBack: () => void;
  onJobClick: (jobId: string) => void;
  onWriteReview?: () => void;
  currentUser: any;
}

const CompanyDetailPage: React.FC<CompanyDetailPageProps> = ({
  companyId,
  onBack,
  onJobClick,
  onWriteReview,
  currentUser,
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews' | 'alumni'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    loadCompanyDetails();
  }, [companyId]);

  const loadCompanyDetails = async () => {
    setLoading(true);
    try {
      const [companyData, jobsData] = await Promise.all([
        api.getCompanyById(companyId),
        api.getCompanyJobs(companyId),
      ]);
      
      setCompany(companyData);
      setJobs(jobsData);
      setIsFollowing(companyData.followers?.includes(currentUser?.id) || false);
    } catch (error) {
      console.error('Failed to load company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      await api.followCompany(companyId);
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to follow company:', error);
    }
  };

  const handleSubmitReview = async (reviewData: any) => {
    try {
      await api.addCompanyReview(companyId, reviewData);
      await loadCompanyDetails(); // Reload to show new review
      setShowReviewForm(false);
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: company?.name,
        text: `Check out ${company?.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getAverageRating = (reviews: CompanyReview[]) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    return total / reviews.length;
  };

  const getRatingDistribution = (reviews: CompanyReview[]) => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5;
      if (rating >= 1 && rating <= 5) {
        dist[rating]++;
      }
    });
    return dist;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <div className="card p-8 animate-pulse">
          <div className="h-32 bg-gray-300 rounded mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Company not found</h3>
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </button>
      </div>
    );
  }

  const avgRating = company.reviews ? getAverageRating(company.reviews) : 0;
  const ratingDist = company.reviews ? getRatingDistribution(company.reviews) : { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const alumniCount = company.alumniEmployees?.length || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'jobs', label: `Jobs (${jobs.length})`, icon: Briefcase },
    { id: 'reviews', label: `Reviews (${company.reviews?.length || 0})`, icon: Star },
    { id: 'alumni', label: `Alumni (${alumniCount})`, icon: GraduationCap },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <button onClick={onBack} className="btn-secondary">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Companies
      </button>

      {/* Company Hero */}
      <div className="card overflow-hidden">
        {/* Cover Image */}
        {company.coverImage && (
          <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500 relative">
            <img
              src={company.coverImage}
              alt={company.name}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        )}
        {!company.coverImage && (
          <div className="h-48 bg-gradient-to-r from-primary-500 to-secondary-500"></div>
        )}

        {/* Company Info */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6 -mt-20">
            <div className="flex items-start space-x-6">
              {/* Logo */}
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-32 h-32 rounded-xl object-contain bg-white border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <Building2 className="w-16 h-16 text-primary-600" />
                </div>
              )}

              {/* Company Name & Info */}
              <div className="pt-16">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900 font-display">
                    {company.name}
                  </h1>
                  {company.isVerified && (
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-700 mb-3">{company.industry}</p>
                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {company.headquarters || company.location}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1 capitalize" />
                    {company.size}
                  </span>
                  {company.foundedYear && (
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Founded {company.foundedYear}
                    </span>
                  )}
                  {avgRating > 0 && (
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500 fill-current" />
                      {avgRating.toFixed(1)} ({company.reviews?.length || 0} reviews)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-16">
              <button onClick={handleShare} className="btn-secondary">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
              <button
                onClick={handleFollow}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isFollowing
                    ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    : 'btn-primary'
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 inline ${isFollowing ? 'fill-current' : ''}`}
                />
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-4 gap-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{jobs.length}</div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary-600">
                {company.followers?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{alumniCount}</div>
              <div className="text-sm text-gray-600">Alumni</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-6">
        <div className="flex space-x-1 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <div className="card p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                About {company.name}
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {company.description}
              </p>
            </div>

            {/* Company Culture */}
            {company.culture && (
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display">
                  Culture & Values
                </h2>

                {company.culture.values && company.culture.values.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Core Values</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {company.culture.values.map((value, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Award className="w-5 h-5 text-primary-600 flex-shrink-0" />
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {company.culture.benefits && company.culture.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {company.culture.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {company.culture.workEnvironment && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Environment</h3>
                    <p className="text-gray-700">{company.culture.workEnvironment}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Links */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connect</h3>
              <div className="space-y-3">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Visit Website</span>
                  </a>
                )}
                {company.socialMedia?.linkedin && (
                  <a
                    href={company.socialMedia.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {company.socialMedia?.twitter && (
                  <a
                    href={company.socialMedia.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>

            {/* Locations */}
            {company.locations && company.locations.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Locations</h3>
                <div className="space-y-2">
                  {company.locations.map((location, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span>{location}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'jobs' && (
        <div>
          {jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No open positions</h3>
              <p className="text-gray-600">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => onJobClick(job.id)}
                  onSave={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Review Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Overall Rating</h3>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
              </div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= Math.round(avgRating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {company.reviews?.length || 0} reviews
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDist[rating as keyof typeof ratingDist];
                const percentage =
                  company.reviews && company.reviews.length > 0
                    ? (count / company.reviews.length) * 100
                    : 0;
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-12">{rating} stars</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-yellow-500 ${
                          percentage === 0
                            ? 'w-0'
                            : percentage < 10
                            ? 'w-[10%]'
                            : percentage < 25
                            ? 'w-1/4'
                            : percentage < 50
                            ? 'w-1/2'
                            : percentage < 75
                            ? 'w-3/4'
                            : 'w-full'
                        }`}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowReviewForm(true)}
              className="btn-primary w-full mt-6"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Write a Review
            </button>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {!company.reviews || company.reviews.length === 0 ? (
              <div className="card p-12 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">Be the first to review this company</p>
              </div>
            ) : (
              company.reviews.map((review) => {
                const reviewer =
                  typeof review.reviewer === 'object' ? review.reviewer : null;
                return (
                  <div key={review.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold">
                            {reviewer?.profile?.name?.[0] || 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {reviewer?.profile?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-600">{review.position}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                    <p className="text-gray-700 mb-4">{review.review}</p>
                    {(review.pros || review.cons) && (
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        {review.pros && (
                          <div>
                            <div className="text-sm font-semibold text-green-900 mb-1">
                              Pros
                            </div>
                            <p className="text-sm text-gray-700">{review.pros}</p>
                          </div>
                        )}
                        {review.cons && (
                          <div>
                            <div className="text-sm font-semibold text-red-900 mb-1">Cons</div>
                            <p className="text-sm text-gray-700">{review.cons}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {review.employmentStatus && (
                        <span className="capitalize">{review.employmentStatus}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'alumni' && (
        <div>
          {alumniCount === 0 ? (
            <div className="card p-12 text-center">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No alumni yet</h3>
              <p className="text-gray-600">
                Be the first from your university to work here
              </p>
            </div>
          ) : (
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {alumniCount} {alumniCount === 1 ? 'Alumnus' : 'Alumni'} from your university
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {company.alumniEmployees.map((alumni, index) => {
                  const alum = typeof alumni === 'object' ? alumni : null;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-lg">
                          {alum?.profile?.name?.[0] || 'A'}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {alum?.profile?.name || 'Alumni Member'}
                        </div>
                        <div className="text-sm text-gray-600">{alum?.role || 'Employee'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Review Form Modal */}
      {showReviewForm && company && (
        <CompanyReviewForm
          company={company}
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleSubmitReview}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default CompanyDetailPage;
