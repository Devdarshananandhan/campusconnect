import React, { useMemo, useState } from 'react';
import { Briefcase, Loader2, RefreshCw, Sparkles } from 'lucide-react';

export interface MentorSuggestion {
  id: string;
  name: string;
  role?: string;
  avatar?: string;
  company?: string;
  expertise: string[];
  availability?: string;
  matchScore?: number;
  reason?: string;
}

interface MentorshipProps {
  mentors: MentorSuggestion[];
  loading?: boolean;
  onRequestMentorship: (mentorId: string, topic: string) => Promise<void>;
  onRefresh?: () => void;
}

const Mentorship: React.FC<MentorshipProps> = ({ mentors, loading = false, onRequestMentorship, onRefresh }) => {
  const [mentorSearch, setMentorSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const filteredMentors = useMemo(() => {
    return mentors.filter((suggestion) => {
      const matchesTopic = !selectedTopic || suggestion.reason?.toLowerCase().includes(selectedTopic.toLowerCase());
      const haystack = `${suggestion.name} ${suggestion.company || ''} ${suggestion.expertise.join(' ')}`.toLowerCase();
      const matchesSearch = !mentorSearch || haystack.includes(mentorSearch.toLowerCase());
      return matchesTopic && matchesSearch;
    });
  }, [mentors, mentorSearch, selectedTopic]);

  const handleRequest = async (mentorId: string) => {
    setSubmittingId(mentorId);
    try {
      await onRequestMentorship(mentorId, 'General Career Guidance');
    } catch (error) {
      console.error('Failed to request mentorship', error);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Find Your Mentor</h2>
            <p className="text-sm text-gray-600">Personalized matches curated from faculty, alumni, and peer mentors</p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            value={mentorSearch}
            onChange={(e) => setMentorSearch(e.target.value)}
            placeholder="Search by name, expertise, or company..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search mentors"
          />
          <select
            id="topic-select"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Filter by recommendation type"
          >
            <option value="">All Recommendations</option>
            <option value="career">Career Development</option>
            <option value="technical">Technical Skills</option>
            <option value="research">Research</option>
            <option value="leadership">Leadership</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-gray-50 rounded-lg">
            <Sparkles className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p>No mentor matches yet. Update your goals or try refreshing recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMentors.map((mentor) => (
              <div key={mentor.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      mentor.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(mentor.name)}`
                    }
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                        {mentor.role && <p className="text-sm text-gray-600 capitalize">{mentor.role}</p>}
                        {mentor.company && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Briefcase className="w-3 h-3 mr-1" />
                            {mentor.company}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {typeof mentor.matchScore === 'number' && (
                          <p className="text-sm font-semibold text-blue-600">Match: {mentor.matchScore}%</p>
                        )}
                        {mentor.availability && (
                          <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {mentor.availability}
                          </span>
                        )}
                      </div>
                    </div>

                    {mentor.reason && (
                      <p className="mt-3 text-sm text-gray-600 bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                        {mentor.reason}
                      </p>
                    )}

                    {mentor.expertise.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Expertise:</p>
                        <div className="flex flex-wrap gap-2">
                          {mentor.expertise.slice(0, 6).map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => handleRequest(mentor.id)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled={submittingId === mentor.id}
                        type="button"
                      >
                        {submittingId === mentor.id ? 'Sending…' : 'Request Mentorship'}
                      </button>
                      <button
                        type="button"
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow p-6 text-white">
        <h3 className="text-xl font-bold mb-2">AI-Powered Matching</h3>
        <p className="mb-4 opacity-90">Get personalized mentor recommendations based on your goals and interests</p>
        <button
          type="button"
          onClick={onRefresh}
          className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-70"
          disabled={loading}
        >
          Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

export default Mentorship;