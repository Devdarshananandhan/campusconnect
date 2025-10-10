import { 
  search as esSearch, 
  isElasticsearchAvailable, 
  INDICES 
} from './elasticsearch';
import User from '../models/User';
import Group from '../models/Group';
import Event from '../models/Event';
import KnowledgePost from '../models/KnowledgePost';

interface SearchParams {
  query: string;
  type?: 'users' | 'groups' | 'events' | 'knowledge' | 'all';
  filters?: any;
  page?: number;
  limit?: number;
  sort?: any;
}

interface SearchResult {
  users?: any[];
  groups?: any[];
  events?: any[];
  knowledgePosts?: any[];
  total: number;
}

/**
 * Unified search service that uses Elasticsearch when available,
 * falls back to MongoDB text search otherwise
 */
export class SearchService {
  private useElasticsearch: boolean = false;

  async initialize() {
    this.useElasticsearch = await isElasticsearchAvailable();
    if (this.useElasticsearch) {
      console.log('Search service: Using Elasticsearch');
    } else {
      console.log('Search service: Using MongoDB (Elasticsearch not available)');
    }
  }

  /**
   * Perform a unified search across multiple entities
   */
  async search(params: SearchParams): Promise<SearchResult> {
    const { query, type = 'all', filters = {}, page = 1, limit = 20, sort } = params;
    const from = (page - 1) * limit;

    if (this.useElasticsearch) {
      return this.searchWithElasticsearch({ query, type, filters, from, limit, sort });
    } else {
      return this.searchWithMongoDB({ query, type, filters, page, limit, sort });
    }
  }

  /**
   * Search using Elasticsearch
   */
  private async searchWithElasticsearch(params: {
    query: string;
    type: string;
    filters: any;
    from: number;
    limit: number;
    sort?: any;
  }): Promise<SearchResult> {
    const { query, type, filters, from, limit, sort } = params;
    const result: SearchResult = { total: 0 };

    try {
      if (type === 'users' || type === 'all') {
        const usersResult = await esSearch({
          index: INDICES.USERS,
          query,
          filters: filters.users || {},
          from: type === 'all' ? 0 : from,
          size: type === 'all' ? 5 : limit,
          sort
        });
        result.users = await this.enrichUsersFromDB(usersResult.hits);
        result.total += usersResult.total;
      }

      if (type === 'groups' || type === 'all') {
        const groupsResult = await esSearch({
          index: INDICES.GROUPS,
          query,
          filters: filters.groups || {},
          from: type === 'all' ? 0 : from,
          size: type === 'all' ? 5 : limit,
          sort
        });
        result.groups = await this.enrichGroupsFromDB(groupsResult.hits);
        result.total += groupsResult.total;
      }

      if (type === 'events' || type === 'all') {
        const eventsResult = await esSearch({
          index: INDICES.EVENTS,
          query,
          filters: filters.events || {},
          from: type === 'all' ? 0 : from,
          size: type === 'all' ? 5 : limit,
          sort
        });
        result.events = await this.enrichEventsFromDB(eventsResult.hits);
        result.total += eventsResult.total;
      }

      if (type === 'knowledge' || type === 'all') {
        const knowledgeResult = await esSearch({
          index: INDICES.KNOWLEDGE_POSTS,
          query,
          filters: filters.knowledge || {},
          from: type === 'all' ? 0 : from,
          size: type === 'all' ? 5 : limit,
          sort
        });
        result.knowledgePosts = await this.enrichKnowledgeFromDB(knowledgeResult.hits);
        result.total += knowledgeResult.total;
      }

      return result;
    } catch (error) {
      console.error('Elasticsearch search error:', error);
      // Fall back to MongoDB on error
      return this.searchWithMongoDB({ query, type, filters, page: 1, limit, sort });
    }
  }

  /**
   * Search using MongoDB text search as fallback
   */
  private async searchWithMongoDB(params: {
    query: string;
    type: string;
    filters: any;
    page: number;
    limit: number;
    sort?: any;
  }): Promise<SearchResult> {
    const { query, type, filters, page, limit } = params;
    const result: SearchResult = { total: 0 };

    try {
      if (type === 'users' || type === 'all') {
        const userQuery: any = filters.users || {};
        if (query) {
          userQuery.$text = { $search: query };
        }
        const users = await User.find(userQuery)
          .select('profile email role createdAt')
          .limit(type === 'all' ? 5 : limit)
          .skip(type === 'all' ? 0 : (page - 1) * limit)
          .lean();
        result.users = users;
        result.total += await User.countDocuments(userQuery);
      }

      if (type === 'groups' || type === 'all') {
        const groupQuery: any = filters.groups || {};
        if (query) {
          groupQuery.$text = { $search: query };
        }
        const groups = await Group.find(groupQuery)
          .populate('creator', 'profile email')
          .limit(type === 'all' ? 5 : limit)
          .skip(type === 'all' ? 0 : (page - 1) * limit)
          .lean();
        result.groups = groups;
        result.total += await Group.countDocuments(groupQuery);
      }

      if (type === 'events' || type === 'all') {
        const eventQuery: any = filters.events || {};
        if (query) {
          eventQuery.$text = { $search: query };
        }
        const events = await Event.find(eventQuery)
          .populate('organizer', 'profile email')
          .limit(type === 'all' ? 5 : limit)
          .skip(type === 'all' ? 0 : (page - 1) * limit)
          .lean();
        result.events = events;
        result.total += await Event.countDocuments(eventQuery);
      }

      if (type === 'knowledge' || type === 'all') {
        const knowledgeQuery: any = filters.knowledge || {};
        if (query) {
          knowledgeQuery.$text = { $search: query };
        }
        const posts = await KnowledgePost.find(knowledgeQuery)
          .populate('author', 'profile email role')
          .limit(type === 'all' ? 5 : limit)
          .skip(type === 'all' ? 0 : (page - 1) * limit)
          .lean();
        result.knowledgePosts = posts;
        result.total += await KnowledgePost.countDocuments(knowledgeQuery);
      }

      return result;
    } catch (error) {
      console.error('MongoDB search error:', error);
      throw error;
    }
  }

  /**
   * Enrich Elasticsearch results with full data from MongoDB
   */
  private async enrichUsersFromDB(hits: any[]) {
    const userIds = hits.map((hit) => hit.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('profile email role createdAt')
      .lean();
    return users;
  }

  private async enrichGroupsFromDB(hits: any[]) {
    const groupIds = hits.map((hit) => hit.groupId);
    const groups = await Group.find({ _id: { $in: groupIds } })
      .populate('creator', 'profile email')
      .lean();
    return groups;
  }

  private async enrichEventsFromDB(hits: any[]) {
    const eventIds = hits.map((hit) => hit.eventId);
    const events = await Event.find({ _id: { $in: eventIds } })
      .populate('organizer', 'profile email')
      .lean();
    return events;
  }

  private async enrichKnowledgeFromDB(hits: any[]) {
    const postIds = hits.map((hit) => hit.postId);
    const posts = await KnowledgePost.find({ _id: { $in: postIds } })
      .populate('author', 'profile email role')
      .lean();
    return posts;
  }
}

export const searchService = new SearchService();
