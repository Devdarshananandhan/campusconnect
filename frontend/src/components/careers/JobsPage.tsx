import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp,
  Building2,
  ChevronDown,
  X,
} from 'lucide-react';
import { Job } from '../../types';
import api from '../../services/api';
import JobCard from './JobCard';

interface JobsPageProps {
  currentUser: any;
  onJobClick?: (jobId: string) => void;
  onCreateJob?: () => void;
}

const JobsPage: React.FC<JobsPageProps> = ({ currentUser, onJobClick, onCreateJob }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [maxSalary, setMaxSalary] = useState<number>(200000);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 12;

  useEffect(() => {
    loadJobs();
  }, [selectedType, selectedLocation, minSalary, maxSalary, currentPage]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (selectedType !== 'all') filters.type = selectedType;
      if (selectedLocation) filters.location = selectedLocation;
      if (minSalary > 0) filters.minSalary = minSalary;
      if (maxSalary < 200000) filters.maxSalary = maxSalary;
      if (searchQuery) filters.search = searchQuery;

      const { jobs: fetchedJobs, total } = await api.getJobs(filters);
      setJobs(fetchedJobs);
      setTotalJobs(total);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadJobs();
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedLocation('');
    setMinSalary(0);
    setMaxSalary(200000);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleJobClick = (jobId: string) => {
    if (onJobClick) {
      onJobClick(jobId);
    }
  };

  const handleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      // TODO: Persist to backend
      return newSet;
    });
  };

  const isEmployer = currentUser?.role === 'faculty' || currentUser?.role === 'alumni';

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'remote', label: 'Remote' },
  ];

  const locations = [
    'All Locations',
    'New York, NY',
    'San Francisco, CA',
    'Boston, MA',
    'Seattle, WA',
    'Austin, TX',
    'Remote',
  ];

  const featuredJobs = jobs.filter((job) => job.featured).slice(0, 3);
  const activeFiltersCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedLocation ? 1 : 0) +
    (minSalary > 0 ? 1 : 0) +
    (maxSalary < 200000 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card-gradient p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display gradient-text">
              Career Opportunities
            </h1>
            <p className="text-gray-600 text-lg">
              Discover your next opportunity from top companies
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isEmployer && (
              <button onClick={onCreateJob} className="btn-primary shadow-glow">
                <Building2 className="w-5 h-5 mr-2" />
                Post a Job
              </button>
            )}
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">{totalJobs}</div>
              <div className="text-sm text-gray-600">Open Positions</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by title, company, or keywords..."
              className="input-field pl-12 w-full"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search Jobs
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary relative"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="input-field"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc === 'All Locations' ? '' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Min Salary ($)
              </label>
              <input
                type="number"
                value={minSalary}
                onChange={(e) => setMinSalary(Number(e.target.value))}
                min="0"
                step="10000"
                className="input-field"
              />
            </div>

            {/* Max Salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary ($)
              </label>
              <input
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(Number(e.target.value))}
                min="0"
                step="10000"
                className="input-field"
              />
            </div>
          </div>
        </div>
      )}

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900 font-display">Featured Jobs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {typeof job.company === 'object' ? job.company.name : 'Company'}
                </p>
                <div className="flex items-center justify-between text-xs text-orange-600 font-semibold">
                  <span>{job.location}</span>
                  {job.salary && (
                    <span>
                      ${job.salary.min / 1000}k - ${job.salary.max / 1000}k
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-300 rounded-t-2xl"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or search query
          </p>
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              All Jobs ({totalJobs})
            </h2>
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * jobsPerPage + 1} -{' '}
              {Math.min(currentPage * jobsPerPage, totalJobs)} of {totalJobs}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job.id)}
                onSave={handleSaveJob}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalJobs > jobsPerPage && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.ceil(totalJobs / jobsPerPage) },
                  (_, i) => i + 1
                )
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === Math.ceil(totalJobs / jobsPerPage) ||
                      Math.abs(page - currentPage) <= 2
                  )
                  .map((page, idx, arr) => (
                    <React.Fragment key={page}>
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(Math.ceil(totalJobs / jobsPerPage), p + 1))
                }
                disabled={currentPage === Math.ceil(totalJobs / jobsPerPage)}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
