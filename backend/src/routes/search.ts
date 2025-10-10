import express from 'express';
import { searchService } from '../services/searchService';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/**
 * Unified search endpoint
 * GET /api/search?q=query&type=all&page=1&limit=20
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { 
      q = '', 
      type = 'all', 
      page = '1', 
      limit = '20',
      ...filters 
    } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    const validTypes = ['all', 'users', 'groups', 'events', 'knowledge'];
    const searchType = validTypes.includes(type as string) ? type as any : 'all';

    const result = await searchService.search({
      query: q,
      type: searchType,
      filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.json(result);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Search users
 * GET /api/search/users?q=query&page=1&limit=20
 */
router.get('/users', isAuthenticated, async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20', role, department } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    const filters: any = {};
    if (role) filters.users = { role };
    if (department) filters.users = { ...filters.users, department };

    const result = await searchService.search({
      query: q,
      type: 'users',
      filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.json({
      users: result.users || [],
      total: result.total
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ 
      error: 'User search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Search groups
 * GET /api/search/groups?q=query&page=1&limit=20
 */
router.get('/groups', isAuthenticated, async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20', type, privacy } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    const filters: any = {};
    if (type) filters.groups = { type };
    if (privacy) filters.groups = { ...filters.groups, privacy };

    const result = await searchService.search({
      query: q,
      type: 'groups',
      filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.json({
      groups: result.groups || [],
      total: result.total
    });
  } catch (error) {
    console.error('Group search error:', error);
    res.status(500).json({ 
      error: 'Group search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Search events
 * GET /api/search/events?q=query&page=1&limit=20
 */
router.get('/events', isAuthenticated, async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20', category } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    const filters: any = {};
    if (category) filters.events = { category };

    const result = await searchService.search({
      query: q,
      type: 'events',
      filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.json({
      events: result.events || [],
      total: result.total
    });
  } catch (error) {
    console.error('Event search error:', error);
    res.status(500).json({ 
      error: 'Event search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Search knowledge posts
 * GET /api/search/knowledge?q=query&page=1&limit=20
 */
router.get('/knowledge', isAuthenticated, async (req, res) => {
  try {
    const { q = '', page = '1', limit = '20', category, company } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        error: 'Query parameter "q" is required' 
      });
    }

    const filters: any = {};
    if (category) filters.knowledge = { category };
    if (company) filters.knowledge = { ...filters.knowledge, company };

    const result = await searchService.search({
      query: q,
      type: 'knowledge',
      filters,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10)
    });

    res.json({
      posts: result.knowledgePosts || [],
      total: result.total
    });
  } catch (error) {
    console.error('Knowledge search error:', error);
    res.status(500).json({ 
      error: 'Knowledge search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
