import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  MapPin,
  Users,
  Star,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Filter,
  ChevronRight,
} from 'lucide-react';
import { Company } from '../../types';
import api from '../../services/api';

interface CompaniesPageProps {
  currentUser: any;
  onCompanyClick: (companyId: string) => void;
}

const CompaniesPage: React.FC<CompaniesPageProps> = ({ currentUser, onCompanyClick }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response = await api.getCompanies();
      const data = response.companies || response;
      setCompanies(data);
      
      // Initialize followed companies
      const followed = new Set<string>(
        data.filter((c: Company) => c.followers?.includes(currentUser?.id)).map((c: Company) => c.id)
      );
      setFollowedCompanies(followed);
    } catch (error) {
      console.error('Failed to load companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (companyId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.followCompany(companyId);
      setFollowedCompanies((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(companyId)) {
          newSet.delete(companyId);
        } else {
          newSet.add(companyId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Failed to follow company:', error);
    }
  };

  const industries = [
    'all',
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'E-commerce',
    'Consulting',
    'Manufacturing',
    'Energy',
    'Other',
  ];

  const sizes = [
    { value: 'all', label: 'All Sizes' },
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1000+)' },
  ];

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry =
      selectedIndustry === 'all' || company.industry === selectedIndustry;
    const matchesSize = selectedSize === 'all' || company.size === selectedSize;
    return matchesSearch && matchesIndustry && matchesSize;
  });

  const featuredCompanies = filteredCompanies.filter((c) => c.featured);
  const regularCompanies = filteredCompanies.filter((c) => !c.featured);

  const getAverageRating = (company: Company) => {
    if (!company.reviews || company.reviews.length === 0) return 0;
    const total = company.reviews.reduce((sum, review) => {
      const r = typeof review === 'object' ? review : null;
      return sum + (r?.rating || 0);
    }, 0);
    return total / company.reviews.length;
  };

  const CompanyCard: React.FC<{ company: Company }> = ({ company }) => {
    const avgRating = getAverageRating(company);
    const isFollowed = followedCompanies.has(company.id);
    const alumniCount = company.alumniEmployees?.length || 0;
    const activeJobs = company.activeJobs || 0;

    return (
      <div
        onClick={() => onCompanyClick(company.id)}
        className="card p-6 hover:shadow-xl transition-all cursor-pointer group"
      >
        {/* Company Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4 flex-1">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-16 h-16 rounded-xl object-contain bg-gray-50 border p-2"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary-600" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                {company.name}
              </h3>
              <p className="text-gray-600 text-sm capitalize">{company.industry}</p>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={(e) => handleFollow(company.id, e)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isFollowed
                ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* Company Description */}
        <p className="text-gray-700 line-clamp-2 mb-4">{company.description}</p>

        {/* Company Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700 capitalize">{company.size}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{company.headquarters}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-700">
              {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Briefcase className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{activeJobs} jobs</span>
          </div>
        </div>

        {/* Alumni Badge */}
        {alumniCount > 0 && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium text-primary-900">
                {alumniCount} {alumniCount === 1 ? 'alumnus works' : 'alumni work'} here
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-600">
            {company.reviews?.length || 0} reviews
          </div>
          <div className="flex items-center text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
            View Profile
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display gradient-text">
          Explore Companies
        </h1>
        <p className="text-gray-600 text-lg">
          Discover top employers hiring from your university
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Industry Filter */}
          <div className="flex-1">
            <label htmlFor="industry-filter" className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Industry
            </label>
            <select
              id="industry-filter"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="input w-full"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'All Industries' : industry}
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="flex-1">
            <label htmlFor="size-filter" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Company Size
            </label>
            <select
              id="size-filter"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="input w-full"
            >
              {sizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {filteredCompanies.length} {filteredCompanies.length === 1 ? 'Company' : 'Companies'}
        </h2>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-300 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured Companies */}
          {featuredCompanies.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-bold text-gray-900">Featured Companies</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {featuredCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}

          {/* All Companies */}
          {regularCompanies.length > 0 && (
            <div>
              {featuredCompanies.length > 0 && (
                <h3 className="text-lg font-bold text-gray-900 mb-4">All Companies</h3>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                {regularCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
