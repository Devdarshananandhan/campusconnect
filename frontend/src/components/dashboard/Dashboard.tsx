import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Header from '../shared/Header';
import Sidebar from '../shared/Sidebar';
import Feed, { FeedItem } from './Feed';
import Network, { NetworkUserCard } from './Network';
import Events, { EventCard } from '../events/EventsList';
import Mentorship, { MentorSuggestion } from './Mentorship';
import Messages, { ConversationPreview } from '../messaging/Messages';
import Profile from '../profile/Profile';
import GroupsPage from '../groups/GroupsPage';
import Leaderboard from '../gamification/Leaderboard';
import { BadgeShowcase } from '../gamification/BadgeShowcase';
import KnowledgeHub from '../knowledge/KnowledgeHub';
import JobsPage from '../careers/JobsPage';
import JobDetailPage from '../careers/JobDetailPage';
import MyApplicationsPage from '../careers/MyApplicationsPage';
import CompaniesPage from '../careers/CompaniesPage';
import CompanyDetailPage from '../careers/CompanyDetailPage';
import ReferralMarketplace from '../careers/ReferralMarketplace';
import ReferralDashboard from '../careers/ReferralDashboard';
import EmployerDashboard from '../careers/EmployerDashboard';
import PostJobForm from '../careers/PostJobForm';
import ApplicantTrackingSystem from '../careers/ApplicantTrackingSystem';
import api from '../../services/api';
import {
  Event as EventType,
  Message as MessageType,
  Notification as NotificationType,
  Post as PostType,
  User
} from '../../types';

interface DashboardProps {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentUser, setCurrentUser }) => {
  const [activeView, setActiveView] = useState('feed');
  const [feedPosts, setFeedPosts] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [creatingPost, setCreatingPost] = useState(false);

  const [events, setEvents] = useState<EventCard[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [creatingEvent, setCreatingEvent] = useState(false);

  const [networkSuggestions, setNetworkSuggestions] = useState<NetworkUserCard[]>([]);
  const [networkLoading, setNetworkLoading] = useState(true);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [mentors, setMentors] = useState<MentorSuggestion[]>([]);
  const [mentorshipLoading, setMentorshipLoading] = useState(false);

  const [conversationList, setConversationList] = useState<ConversationPreview[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatUser, setChatUser] = useState<ConversationPreview['user'] | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Careers state
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showPostJobForm, setShowPostJobForm] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const [atsJobId, setAtsJobId] = useState<string | null>(null);

  // Clear search when changing views
  useEffect(() => {
    setSearchQuery('');
  }, [activeView]);

  const createTempId = useCallback(
    () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    []
  );

  const mapPostToFeedItem = useCallback((post: PostType): FeedItem => {
    const postId = (post as any)._id || post.id || createTempId();
    const authorUser = typeof post.author === 'string' ? undefined : (post.author as User);
    return {
      id: postId,
      content: post.content,
      createdAt: post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString(),
      likes: Array.isArray(post.likes) ? post.likes.length : ((post as any).likes ?? 0),
      comments: Array.isArray(post.comments) ? post.comments.length : ((post as any).comments?.length ?? 0),
      author: {
        id: authorUser?.id || (authorUser as any)?._id || (typeof post.author === 'string' ? post.author : ''),
        name: authorUser?.profile?.name || 'CampusConnect Member',
        role: authorUser?.role,
        avatar: authorUser?.profile?.avatar
      }
    };
  }, [createTempId]);

  const mapEventToCard = useCallback((event: EventType): EventCard => ({
    id: (event as any)._id || event.id,
    title: event.title,
    startDate: event.startDate ? new Date(event.startDate).toISOString() : new Date().toISOString(),
    endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
    category: event.category,
    location: event.location,
    attendeeCount: Array.isArray(event.attendees) ? event.attendees.length : 0,
    description: event.description || ''
  }), []);

  const mapNotification = useCallback((notification: any): NotificationType => ({
    id: notification.id || notification._id || createTempId(),
    user: notification.user,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    data: notification.data,
    read: notification.read,
    actionUrl: notification.actionUrl,
    createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date()
  }), [createTempId]);

  const mapMessage = useCallback((message: any): MessageType => ({
    id: message.id || message._id || createTempId(),
    from: typeof message.from === 'string' ? message.from : message.from?._id || message.from?.id,
    to: typeof message.to === 'string' ? message.to : message.to?._id || message.to?.id,
    content: message.content,
    read: message.read ?? false,
    createdAt: message.createdAt ? new Date(message.createdAt) : new Date()
  }), [createTempId]);

  const ensureCurrentUser = useCallback(async () => {
    if (currentUser) return;
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to load current user', error);
    }
  }, [currentUser, setCurrentUser]);

  useEffect(() => {
    void ensureCurrentUser();
  }, [ensureCurrentUser]);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const { posts } = await api.getFeed();
      setFeedPosts(posts.map(mapPostToFeedItem));
    } catch (error) {
      console.error('Failed to load feed', error);
      setFeedPosts([]);
    } finally {
      setFeedLoading(false);
    }
  }, [mapPostToFeedItem]);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const eventsResponse = await api.getEvents();
      setEvents(eventsResponse.map(mapEventToCard));
    } catch (error) {
      console.error('Failed to load events', error);
      setEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [mapEventToCard]);

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const { notifications: notificationList } = await api.getNotifications(1);
      setNotifications(notificationList.map(mapNotification));
    } catch (error) {
      console.error('Failed to load notifications', error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [mapNotification]);

  const loadNetwork = useCallback(async () => {
    if (!currentUser) return;
    setNetworkLoading(true);
    try {
      const { users } = await api.getUsers(25, 0);
      const suggestions = users
        .filter((user) => user.id !== currentUser.id && !currentUser.connections?.includes(user.id))
        .map<NetworkUserCard>((user) => ({
          id: user.id,
          name: user.profile?.name || 'CampusConnect Member',
          role: user.role,
          avatar: user.profile?.avatar,
          company: user.profile?.company,
          department: user.profile?.major,
          headline: user.careerGoals,
          skills: user.profile?.skills || []
        }));
      setNetworkSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load network suggestions', error);
      setNetworkSuggestions([]);
    } finally {
      setNetworkLoading(false);
    }
  }, [currentUser]);

  const loadMentors = useCallback(async () => {
    if (!currentUser) return;
    setMentorshipLoading(true);
    try {
      const recommendations = await api.getRecommendedMentors(currentUser.id);
      const normalized = recommendations.map<MentorSuggestion>(({ mentor, matchScore, reason }) => ({
        id: mentor.id,
        name: mentor.profile?.name || 'Mentor',
        role: mentor.role,
        avatar: mentor.profile?.avatar,
        company: mentor.profile?.company,
        expertise: mentor.profile?.skills || [],
        availability: mentor.mentorProfile?.isAvailable ? 'Available' : 'Limited',
        matchScore: Math.round(matchScore * 100),
        reason
      }));
      setMentors(normalized);
    } catch (error) {
      console.error('Failed to load mentor recommendations', error);
      setMentors([]);
    } finally {
      setMentorshipLoading(false);
    }
  }, [currentUser]);

  const loadConversations = useCallback(async () => {
    setConversationsLoading(true);
    try {
      const conversations = await api.getConversationList();
      const normalized: ConversationPreview[] = conversations.map((conversation: any) => {
        const otherParticipant =
          conversation.from &&
          (conversation.from._id?.toString?.() || conversation.from.id) !== currentUser?.id
            ? conversation.from
            : conversation.to;
        const user = {
          id: otherParticipant?._id?.toString() || otherParticipant?.id || '',
          name: otherParticipant?.profile?.name || 'Member',
          avatar: otherParticipant?.profile?.avatar
        };
        return {
          id: conversation.conversationId || conversation._id || `${user.id}-${conversation.createdAt}`,
          user,
          lastMessage: conversation.content || '',
          timestamp: conversation.createdAt,
          unread:
            conversation.to?.id === currentUser?.id || conversation.to?._id?.toString() === currentUser?.id
              ? conversation.read === false
                ? 1
                : 0
              : 0
        };
      });
      setConversationList(normalized);
    } catch (error) {
      console.error('Failed to load conversations', error);
      setConversationList([]);
    } finally {
      setConversationsLoading(false);
    }
  }, [currentUser?.id]);

  const loadMessagesForUser = useCallback(async (userId: string) => {
    setMessagesLoading(true);
    try {
      const messagesResponse = await api.getMessagesForUser(userId);
      setMessages(messagesResponse.map(mapMessage));
    } catch (error) {
      console.error('Failed to load messages', error);
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }, [mapMessage]);

  useEffect(() => {
    if (!currentUser) return;
    void loadFeed();
    void loadEvents();
    void loadNotifications();
    void loadNetwork();
    void loadMentors();
    void loadConversations();
  }, [currentUser, loadFeed, loadEvents, loadNotifications, loadNetwork, loadMentors, loadConversations]);

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Failed to logout', error);
    } finally {
      setCurrentUser(null);
      setNotifications([]);
    }
  }, [setCurrentUser]);

  const handleCreatePost = useCallback(
    async (content: string) => {
      if (!currentUser) return;
      setCreatingPost(true);
      try {
        const post = await api.createPost({ content, type: 'status' });
        setFeedPosts((prev) => [mapPostToFeedItem(post), ...prev]);
      } catch (error) {
        console.error('Failed to create post', error);
      } finally {
        setCreatingPost(false);
      }
    },
    [currentUser, mapPostToFeedItem]
  );

  const handleLikePost = useCallback(async (postId: string) => {
    try {
      const likes = await api.likePost(postId);
      setFeedPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, likes } : post))
      );
    } catch (error) {
      console.error('Failed to like post', error);
    }
  }, []);

  const handleCreateEvent = useCallback(
    async (eventData: {
      title: string;
      description?: string;
      startDate: string;
      endDate?: string;
      location: string;
      category?: string;
      isVirtual?: boolean;
      virtualLink?: string;
    }) => {
      setCreatingEvent(true);
      try {
        const allowedCategories: Array<EventType['category']> = [
          'Career',
          'Academic',
          'Cultural',
          'Networking',
          'Workshop',
          'Other'
        ];
        const category = allowedCategories.includes(eventData.category as EventType['category'])
          ? (eventData.category as EventType['category'])
          : undefined;
        const payload: Partial<EventType> = {
          title: eventData.title,
          description: eventData.description,
          startDate: new Date(eventData.startDate),
          endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
          location: eventData.location,
          category,
          isVirtual: eventData.isVirtual,
          virtualLink: eventData.virtualLink
        };
        const event = await api.createEvent(payload);
        setEvents((prev) => [mapEventToCard(event), ...prev]);
      } catch (error) {
        console.error('Failed to create event', error);
      } finally {
        setCreatingEvent(false);
      }
    },
    [mapEventToCard]
  );

  const handleRsvp = useCallback(
    async (eventId: string) => {
      try {
        const updatedEvent = await api.rsvpEvent(eventId, 'going');
        setEvents((prev) =>
          prev.map((event) =>
            event.id === ((updatedEvent as any)._id || updatedEvent.id)
              ? mapEventToCard(updatedEvent)
              : event
          )
        );
      } catch (error) {
        console.error('Failed to RSVP to event', error);
      }
    },
    [mapEventToCard]
  );

  const handleConnect = useCallback(
    async (userId: string) => {
      try {
        await api.sendConnectionRequest(userId);
        await Promise.all([loadNetwork(), loadNotifications()]);
      } catch (error) {
        console.error('Failed to send connection request', error);
      }
    },
    [loadNetwork, loadNotifications]
  );

  const handleMarkAllNotificationsRead = useCallback(async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  }, []);

  const handleRequestMentorship = useCallback(
    async (mentorId: string, topic: string) => {
      try {
        await api.requestMentorship(mentorId, topic, [topic]);
        await loadMentors();
      } catch (error) {
        console.error('Failed to request mentorship', error);
      }
    },
    [loadMentors]
  );

  const handleSelectConversation = useCallback(
    async (conversation: ConversationPreview) => {
      setChatUser(conversation.user);
      setActiveView('messages');
      await loadMessagesForUser(conversation.user.id);
    },
    [loadMessagesForUser]
  );

  const handleStartMessage = useCallback(
    (user: NetworkUserCard) => {
      const conversation: ConversationPreview = {
        id: user.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        lastMessage: '',
        timestamp: new Date().toISOString(),
        unread: 0
      };

      setConversationList((prev) => {
        if (prev.some((entry) => entry.user.id === user.id)) {
          return prev;
        }
        return [conversation, ...prev];
      });

      setChatUser(conversation.user);
      setActiveView('messages');
      void loadMessagesForUser(user.id);
    },
    [loadMessagesForUser]
  );

  const handleMessageUserById = useCallback(
    async (userId: string) => {
      try {
        // Fetch user details
        const userData = await api.getUserById(userId);
        handleStartMessage({
          id: userData.id || (userData as any)._id,
          name: userData.profile?.name || 'User',
          avatar: userData.profile?.avatar || '',
          skills: []
        });
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    },
    [handleStartMessage]
  );

  const handleSendMessage = useCallback(async () => {
    if (!chatUser || !messageInput.trim()) return;
    setSendingMessage(true);
    try {
      const message = await api.sendMessage(chatUser.id, messageInput.trim());
      const normalized = mapMessage(message);
      setMessages((prev) => [...prev, normalized]);
      setMessageInput('');
      await loadConversations();
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSendingMessage(false);
    }
  }, [chatUser, messageInput, mapMessage, loadConversations]);

  const handleProfileUpdate = useCallback(
    async (updates: Partial<User>) => {
      if (!currentUser) return;
      try {
        const updatedUser = await api.updateProfile(currentUser.id, updates);
        setCurrentUser(updatedUser);
      } catch (error) {
        console.error('Failed to update profile', error);
      }
    },
    [currentUser, setCurrentUser]
  );

  // Calculate unread messages count
  const unreadMessagesCount = useMemo(() => {
    return conversationList.reduce((total, conversation) => total + (conversation.unread || 0), 0);
  }, [conversationList]);

  return (
    <>
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        activeView={activeView}
      />
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          sidebarOpen={sidebarOpen} 
          unreadMessages={unreadMessagesCount}
        />
        <main className="flex-1 p-6 animate-fade-in">
          {activeView === 'feed' && (
            <Feed
              currentUser={currentUser}
              posts={feedPosts}
              onCreatePost={handleCreatePost}
              onLikePost={handleLikePost}
              loading={feedLoading || creatingPost}
            />
          )}
          {activeView === 'knowledge' && <KnowledgeHub currentUser={currentUser} />}
          {activeView === 'network' && (
            <Network
              suggestions={networkSuggestions}
              onConnect={handleConnect}
              onStartMessage={handleStartMessage}
              loading={networkLoading}
            />
          )}
          {activeView === 'events' && (
            <Events
              events={events}
              onRsvp={handleRsvp}
              onCreateEvent={handleCreateEvent}
              loading={eventsLoading}
              creating={creatingEvent}
            />
          )}
          {activeView === 'mentorship' && (
            <Mentorship
              mentors={mentors}
              loading={mentorshipLoading}
              onRequestMentorship={handleRequestMentorship}
              onRefresh={() => void loadMentors()}
            />
          )}
          {activeView === 'messages' && (
            <Messages
              currentUser={currentUser}
              conversations={conversationList}
              selectedUser={chatUser}
              onSelectConversation={handleSelectConversation}
              messages={messages}
              messageInput={messageInput}
              onMessageInputChange={setMessageInput}
              onSendMessage={handleSendMessage}
              loadingConversations={conversationsLoading}
              loadingMessages={messagesLoading}
              sendingMessage={sendingMessage}
            />
          )}
          {activeView === 'groups' && (
            <GroupsPage 
              currentUser={currentUser} 
              onMessageUser={(userId) => {
                setActiveView('messages');
                void handleMessageUserById(userId);
              }}
            />
          )}
          {activeView === 'careers' && !selectedJobId && (
            <JobsPage 
              currentUser={currentUser}
              onJobClick={(jobId) => setSelectedJobId(jobId)}
              onCreateJob={() => {
                setShowPostJobForm(true);
                setJobToEdit(null);
              }}
            />
          )}
          {activeView === 'my-applications' && (
            <MyApplicationsPage currentUser={currentUser} />
          )}
          {activeView === 'referrals' && (
            <ReferralMarketplace
              currentUser={currentUser}
              onJobClick={(jobId) => {
                setSelectedJobId(jobId);
                setActiveView('careers');
              }}
            />
          )}
          {activeView === 'referral-dashboard' && (
            <ReferralDashboard
              currentUser={currentUser}
              onJobClick={(jobId) => {
                setSelectedJobId(jobId);
                setActiveView('careers');
              }}
            />
          )}
          {activeView === 'companies' && !selectedCompanyId && (
            <CompaniesPage
              currentUser={currentUser}
              onCompanyClick={(companyId) => setSelectedCompanyId(companyId)}
            />
          )}
          {activeView === 'companies' && selectedCompanyId && (
            <CompanyDetailPage
              companyId={selectedCompanyId}
              onBack={() => setSelectedCompanyId(null)}
              onJobClick={(jobId) => {
                setSelectedJobId(jobId);
                setActiveView('careers');
              }}
              currentUser={currentUser}
            />
          )}
          {activeView === 'careers' && selectedJobId && (
            <JobDetailPage
              jobId={selectedJobId}
              onBack={() => setSelectedJobId(null)}
              onRequestReferral={(jobId) => {
                setActiveView('referrals');
              }}
              currentUser={currentUser}
            />
          )}
          {activeView === 'employer-dashboard' && !atsJobId && (
            <EmployerDashboard
              currentUser={currentUser}
              onCreateJob={() => {
                setShowPostJobForm(true);
                setJobToEdit(null);
              }}
              onEditJob={(jobId) => {
                // Load job data and open edit form
                api.getJob(jobId).then((job) => {
                  setJobToEdit(job);
                  setShowPostJobForm(true);
                });
              }}
              onViewApplications={(jobId) => {
                setAtsJobId(jobId);
              }}
            />
          )}
          {activeView === 'employer-dashboard' && atsJobId && (
            <ApplicantTrackingSystem
              jobId={atsJobId}
              onBack={() => setAtsJobId(null)}
            />
          )}
          {activeView === 'leaderboard' && <Leaderboard currentUserId={currentUser?.id || ''} />}
          {activeView === 'badges' && currentUser && <BadgeShowcase userId={currentUser.id} />}
          {activeView === 'profile' && (
            <Profile
              currentUser={currentUser}
              postsCount={feedPosts.length}
              onUpdateProfile={handleProfileUpdate}
            />
          )}
        </main>

        {/* Post Job Form Modal */}
        {showPostJobForm && (
          <PostJobForm
            currentUser={currentUser}
            jobToEdit={jobToEdit}
            onClose={() => {
              setShowPostJobForm(false);
              setJobToEdit(null);
            }}
            onSuccess={() => {
              // Reload employer dashboard if active
              if (activeView === 'employer-dashboard') {
                window.location.reload();
              }
            }}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;