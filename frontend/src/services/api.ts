import {
  User,
  Post,
  Event,
  Mentorship,
  Connection,
  Message,
  Notification,
  Group,
  SkillGap,
  Analytics,
  KnowledgePost,
  Comment
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important: Send cookies with requests for session auth
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          this.logout();
          window.location.href = '/';
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // ==================== AUTH ====================
  async login(email: string, password: string, role: string): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    // For session-based auth, token is just a placeholder
    if (data.token && data.token !== 'session-based-auth') {
      this.setToken(data.token);
    }
    return data;
  }

  async register(userData: Partial<User>): Promise<{ user: User; token: string }> {
    const data = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    // For session-based auth, token is just a placeholder
    if (data.token && data.token !== 'session-based-auth') {
      this.setToken(data.token);
    }
    return data;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('auth_token');
    try {
      await this.request<void>('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // ==================== USERS ====================
  async getCurrentUser(): Promise<User> {
    const { user } = await this.request<{ user: User }>('/auth/me');
    return user;
  }

  async getUserById(userId: string): Promise<User> {
    const { user } = await this.request<{ user: User }>(`/users/${userId}`);
    return user;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { user } = await this.request<{ user: User }>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return user;
  }

  async searchUsers(query: string, filters?: {
    role?: string;
    major?: string;
    skills?: string[];
    graduationYear?: string;
  }): Promise<User[]> {
    const params = new URLSearchParams({ q: query, ...(filters as any) });
    const { users } = await this.request<{ users: User[] }>(`/users/search?${params.toString()}`);
    return users;
  }

  async getUsers(limit = 20, offset = 0): Promise<{ users: User[]; total: number }> {
    return this.request<{ users: User[]; total: number }>(`/users?limit=${limit}&offset=${offset}`);
  }

  // ==================== CONNECTIONS ====================
  async getConnections(): Promise<Connection[]> {
    const { connections } = await this.request<{ connections: Connection[] }>(`/connections`);
    return connections;
  }

  async sendConnectionRequest(targetUserId: string, message?: string): Promise<Connection> {
    const { connection } = await this.request<{ connection: Connection }>('/connections/request', {
      method: 'POST',
      body: JSON.stringify({ to: targetUserId, message }),
    });
    return connection;
  }

  async acceptConnectionRequest(connectionId: string): Promise<Connection> {
    const { connection } = await this.request<{ connection: Connection }>(`/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'accepted' })
    });
    return connection;
  }

  async rejectConnectionRequest(connectionId: string): Promise<void> {
    await this.request<void>(`/connections/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    });
  }

  async endorseSkill(userId: string, skill: string): Promise<User> {
    return this.request<User>(`/users/${userId}/endorse`, {
      method: 'POST',
      body: JSON.stringify({ skill }),
    });
  }

  // ==================== POSTS ====================
  async getFeed(page = 1, limit = 20): Promise<{ posts: Post[]; page: number; hasMore: boolean }> {
    return this.request<{ posts: Post[]; page: number; hasMore: boolean }>(`/posts/feed?page=${page}&limit=${limit}`);
  }

  async createPost(postData: Partial<Post>): Promise<Post> {
    const { post } = await this.request<{ message: string; post: Post }>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
    return post;
  }

  async likePost(postId: string): Promise<number> {
    const { likes } = await this.request<{ likes: number }>(`/posts/${postId}/like`, {
      method: 'POST',
    });
    return likes;
  }

  async commentOnPost(postId: string, content: string): Promise<Comment[]> {
    const { comments } = await this.request<{ comments: any[] }>(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return comments;
  }

  // ==================== EVENTS ====================
  async getEvents(filters?: { category?: string; upcoming?: boolean }): Promise<Event[]> {
    const params = new URLSearchParams(filters as any);
    const { events } = await this.request<{ events: Event[] }>(`/events?${params.toString()}`);
    return events;
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const { event } = await this.request<{ message: string; event: Event }>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
    return event;
  }

  async rsvpEvent(eventId: string, status: 'going' | 'interested' | 'not_going'): Promise<Event> {
    const { event } = await this.request<{ message: string; event: Event }>(`/events/${eventId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
    return event;
  }

  async submitEventFeedback(eventId: string, rating: number, feedback: string): Promise<void> {
    await this.request<{ message: string }>(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async getRecommendedEvents(userId: string): Promise<Event[]> {
    const { events } = await this.request<{ events: Event[] }>(`/events/recommended/${userId}`);
    return events;
  }

  // ==================== MENTORSHIP ====================
  async getMentorships(userId: string): Promise<Mentorship[]> {
    return this.request<Mentorship[]>(`/users/${userId}/mentorships`);
  }

  async requestMentorship(mentorId: string, message: string, goals: string[]): Promise<Mentorship> {
    return this.request<Mentorship>('/mentorships/request', {
      method: 'POST',
      body: JSON.stringify({ mentorId, message, goals }),
    });
  }

  async getRecommendedMentors(userId: string): Promise<Array<{ mentor: User; matchScore: number; reason: string }>> {
    return this.request<Array<{ mentor: User; matchScore: number; reason: string }>>(`/mentorships/recommended/${userId}`);
  }

  // ==================== MESSAGES ====================
  async getConversationList(): Promise<any[]> {
    const { conversations } = await this.request<{ conversations: any[] }>(`/messages/conversations/list`);
    return conversations;
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    const { messages } = await this.request<{ messages: Message[] }>(`/messages/${userId}`);
    return messages;
  }

  async sendMessage(to: string, content: string): Promise<Message> {
    const { data } = await this.request<{ message: string; data: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ to, content }),
    });
    return data;
  }

  // ==================== NOTIFICATIONS ====================
  async getNotifications(page = 1): Promise<{ notifications: Notification[]; unreadCount: number; hasMore: boolean }> {
    return this.request<{ notifications: Notification[]; unreadCount: number; hasMore: boolean }>(`/notifications?page=${page}`);
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request<void>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  // ==================== GROUPS ====================
  async getGroups(filters?: { type?: string; privacy?: string }): Promise<Group[]> {
    const params = new URLSearchParams(filters as any);
    return this.request<Group[]>(`/groups?${params}`);
  }

  async getGroupById(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}`);
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    return this.request<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async joinGroup(groupId: string): Promise<Group> {
    return this.request<Group>(`/groups/${groupId}/join`, {
      method: 'POST',
    });
  }

  // ==================== SKILL GAP ====================
  async analyzeSkillGap(userId: string, careerGoal: string): Promise<SkillGap> {
    return this.request<SkillGap>('/skillgap/analyze', {
      method: 'POST',
      body: JSON.stringify({ userId, careerGoal }),
    });
  }

  async getSkillGapAnalysis(userId: string): Promise<SkillGap | null> {
    return this.request<SkillGap | null>(`/skillgap/${userId}`);
  }

  // ==================== GAMIFICATION ====================
  async awardPoints(userId: string, points: number, reason: string): Promise<User> {
    return this.request<User>(`/gamification/${userId}/points`, {
      method: 'POST',
      body: JSON.stringify({ points, reason }),
    });
  }

  async getLeaderboard(type: 'points' | 'connections' | 'events' | 'mentorship', limit = 10): Promise<Array<{
    user: User;
    score: number;
    rank: number;
  }>> {
    return this.request<Array<{ user: User; score: number; rank: number }>>(`/gamification/leaderboard/${type}?limit=${limit}`);
  }

  // ==================== ANALYTICS ====================
  async getAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'weekly'): Promise<Analytics> {
    return this.request<Analytics>(`/analytics?period=${period}`);
  }

  // ==================== KNOWLEDGE HUB ====================
  async searchKnowledgePosts(params: {
    q?: string;
    category?: string;
    company?: string;
    industry?: string;
    skill?: string;
    courseCode?: string;
    verified?: boolean;
    evergreen?: boolean;
    sortBy?: 'relevance' | 'recent' | 'popular' | 'helpful';
    page?: number;
    limit?: number;
  }): Promise<{ posts: KnowledgePost[]; total: number; page: number; pages: number }> {
    const queryString = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    return this.request<{ posts: KnowledgePost[]; total: number; page: number; pages: number }>(
      `/knowledge/search?${queryString}`
    );
  }

  async getKnowledgePost(id: string): Promise<{ post: KnowledgePost }> {
    return this.request<{ post: KnowledgePost }>(`/knowledge/${id}`);
  }

  async createKnowledgePost(postData: {
    title: string;
    body: string;
    category: string;
    tags?: string[];
    company?: string;
    industry?: string;
    relatedSkills?: string[];
    courseCodes?: string[];
    isEvergreen?: boolean;
  }): Promise<{ message: string; post: KnowledgePost }> {
    return this.request<{ message: string; post: KnowledgePost }>('/knowledge', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async voteKnowledgePost(id: string, voteType: 'up' | 'down'): Promise<{ upvotes: number; downvotes: number; voteScore: number }> {
    return this.request<{ upvotes: number; downvotes: number; voteScore: number }>(`/knowledge/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  async markKnowledgePostHelpful(id: string): Promise<{ helpfulCount: number }> {
    return this.request<{ helpfulCount: number }>(`/knowledge/${id}/helpful`, {
      method: 'POST',
    });
  }

  async bookmarkKnowledgePost(id: string): Promise<{ bookmarked: boolean; bookmarkCount: number }> {
    return this.request<{ bookmarked: boolean; bookmarkCount: number }>(`/knowledge/${id}/bookmark`, {
      method: 'POST',
    });
  }

  async commentOnKnowledgePost(id: string, content: string): Promise<{ comments: any[] }> {
    return this.request<{ comments: any[] }>(`/knowledge/${id}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async verifyKnowledgePost(id: string): Promise<{ message: string; post: KnowledgePost }> {
    return this.request<{ message: string; post: KnowledgePost }>(`/knowledge/${id}/verify`, {
      method: 'POST',
    });
  }

  async getBookmarkedKnowledgePosts(): Promise<{ posts: KnowledgePost[] }> {
    return this.request<{ posts: KnowledgePost[] }>('/knowledge/user/bookmarks');
  }

  async getTrendingKnowledgePosts(): Promise<{ posts: KnowledgePost[] }> {
    return this.request<{ posts: KnowledgePost[] }>('/knowledge/trending');
  }
}

export const api = new ApiService();
export default api;