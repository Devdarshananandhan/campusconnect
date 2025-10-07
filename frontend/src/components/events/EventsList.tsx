import React, { useState } from 'react';
import { Plus, MapPin, Users, Calendar, X } from 'lucide-react';

export interface EventCard {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  category?: string;
  location?: string;
  attendeeCount: number;
  description?: string;
}

interface EventsListProps {
  events: EventCard[];
  onCreateEvent: (eventData: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location: string;
    category?: string;
    isVirtual?: boolean;
    virtualLink?: string;
  }) => Promise<void>;
  onRsvp: (eventId: string) => Promise<void>;
  loading?: boolean;
  creating?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ events, onCreateEvent, onRsvp, loading = false, creating = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: 'Career',
  });
  const [submitting, setSubmitting] = useState(false);
  const [rsvpInProgress, setRsvpInProgress] = useState<string>('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.title || !formValues.startDate || !formValues.location) return;
    setSubmitting(true);
    try {
      await onCreateEvent({
        title: formValues.title,
        description: formValues.description,
        startDate: formValues.startDate,
        endDate: formValues.endDate || formValues.startDate,
        location: formValues.location,
        category: formValues.category,
      });
      setFormValues({ title: '', description: '', startDate: '', endDate: '', location: '', category: 'Career' });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRsvp = async (eventId: string) => {
    setRsvpInProgress(eventId);
    try {
      await onRsvp(eventId);
    } catch (error) {
      console.error('Failed to RSVP:', error);
    } finally {
      setRsvpInProgress('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Campus Events</h2>
            <p className="text-sm text-gray-600">Discover opportunities to connect, learn, and grow</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Close' : 'Create Event'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formValues.title}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="event-title"
                  required
                  placeholder="e.g., Alumni Networking Night"
                />
              </div>
              <div>
                <label htmlFor="event-category" className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={formValues.category}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="event-category"
                  title="Select event category"
                >
                  <option value="Career">Career</option>
                  <option value="Academic">Academic</option>
                  <option value="Networking">Networking</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="event-start" className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="datetime-local"
                  value={formValues.startDate}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="event-start"
                  required
                />
              </div>
              <div>
                <label htmlFor="event-end" className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="datetime-local"
                  value={formValues.endDate}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="event-end"
                  placeholder="End date (optional)"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="event-location" className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formValues.location}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  id="event-location"
                  required
                  placeholder="e.g., Innovation Hall, Room 101"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={formValues.description}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Share details about the event, speakers, agenda, etc."
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={submitting || creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting || creating ? 'Publishing…' : 'Publish Event'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-400" />
            No events scheduled yet. Be the first to create one!
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {event.category && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                          {event.category}
                        </span>
                      )}
                      <span className="text-sm text-gray-600">
                        {new Date(event.startDate).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    {event.description && <p className="text-gray-600 mb-3">{event.description}</p>}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {event.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </span>
                      )}
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {event.attendeeCount} attending
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRsvp(event.id)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap disabled:opacity-50"
                    disabled={rsvpInProgress === event.id}
                  >
                    {rsvpInProgress === event.id ? 'Saving…' : 'RSVP'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;