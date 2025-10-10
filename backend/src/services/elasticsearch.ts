import { Client } from '@elastic/elasticsearch';

// Elasticsearch client configuration
const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_API_KEY
    ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
    : undefined,
  // For local development without authentication
  ...((!process.env.ELASTICSEARCH_API_KEY && process.env.NODE_ENV === 'development') && {
    tls: {
      rejectUnauthorized: false
    }
  })
});

// Index names
export const INDICES = {
  USERS: 'campusconnect_users',
  GROUPS: 'campusconnect_groups',
  EVENTS: 'campusconnect_events',
  KNOWLEDGE_POSTS: 'campusconnect_knowledge_posts',
  POSTS: 'campusconnect_posts'
};

// Initialize indices with mappings
export async function initializeIndices() {
  try {
    // Check if Elasticsearch is available
    const isHealthy = await esClient.ping();
    if (!isHealthy) {
      console.warn('Elasticsearch is not available. Search will fall back to MongoDB.');
      return false;
    }

    // Create users index
    const usersExists = await esClient.indices.exists({ index: INDICES.USERS });
    if (!usersExists) {
      await esClient.indices.create({
        index: INDICES.USERS,
        mappings: {
          properties: {
            userId: { type: 'keyword' },
            name: { type: 'text', analyzer: 'standard' },
            email: { type: 'keyword' },
            role: { type: 'keyword' },
            bio: { type: 'text' },
            company: { type: 'text' },
            position: { type: 'text' },
            department: { type: 'keyword' },
            skills: { type: 'text' },
            interests: { type: 'text' },
            industry: { type: 'keyword' },
            graduationYear: { type: 'integer' },
            createdAt: { type: 'date' }
          }
        }
      } as any);
      console.log(`Created index: ${INDICES.USERS}`);
    }

    // Create groups index
    const groupsExists = await esClient.indices.exists({ index: INDICES.GROUPS });
    if (!groupsExists) {
      await esClient.indices.create({
        index: INDICES.GROUPS,
        mappings: {
          properties: {
            groupId: { type: 'keyword' },
            name: { type: 'text', analyzer: 'standard' },
            description: { type: 'text' },
            type: { type: 'keyword' },
            privacy: { type: 'keyword' },
            tags: { type: 'text' },
            memberCount: { type: 'integer' },
            createdAt: { type: 'date' }
          }
        }
      } as any);
      console.log(`Created index: ${INDICES.GROUPS}`);
    }

    // Create events index
    const eventsExists = await esClient.indices.exists({ index: INDICES.EVENTS });
    if (!eventsExists) {
      await esClient.indices.create({
        index: INDICES.EVENTS,
        mappings: {
          properties: {
            eventId: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            description: { type: 'text' },
            category: { type: 'keyword' },
            location: { type: 'text' },
            startDate: { type: 'date' },
            endDate: { type: 'date' },
            tags: { type: 'text' },
            attendeeCount: { type: 'integer' },
            createdAt: { type: 'date' }
          }
        }
      } as any);
      console.log(`Created index: ${INDICES.EVENTS}`);
    }

    // Create knowledge posts index
    const knowledgeExists = await esClient.indices.exists({ index: INDICES.KNOWLEDGE_POSTS });
    if (!knowledgeExists) {
      await esClient.indices.create({
        index: INDICES.KNOWLEDGE_POSTS,
        mappings: {
          properties: {
            postId: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            body: { type: 'text' },
            category: { type: 'keyword' },
            company: { type: 'text' },
            industry: { type: 'keyword' },
            tags: { type: 'text' },
            relatedSkills: { type: 'text' },
            courseCodes: { type: 'text' },
            authorName: { type: 'text' },
            authorRole: { type: 'keyword' },
            voteScore: { type: 'integer' },
            views: { type: 'integer' },
            helpfulCount: { type: 'integer' },
            createdAt: { type: 'date' }
          }
        }
      } as any);
      console.log(`Created index: ${INDICES.KNOWLEDGE_POSTS}`);
    }

    console.log('Elasticsearch indices initialized successfully');
    return true;
  } catch (error) {
    console.warn('Failed to initialize Elasticsearch indices:', error);
    return false;
  }
}

// Index a document
export async function indexDocument(index: string, id: string, document: any) {
  try {
    await esClient.index({
      index,
      id,
      document,
      refresh: 'wait_for' // Make the document searchable immediately
    });
  } catch (error) {
    console.error(`Failed to index document in ${index}:`, error);
  }
}

// Update a document
export async function updateDocument(index: string, id: string, document: any) {
  try {
    await esClient.update({
      index,
      id,
      doc: document,
      refresh: 'wait_for'
    });
  } catch (error) {
    console.error(`Failed to update document in ${index}:`, error);
  }
}

// Delete a document
export async function deleteDocument(index: string, id: string) {
  try {
    await esClient.delete({
      index,
      id,
      refresh: 'wait_for'
    });
  } catch (error) {
    console.error(`Failed to delete document from ${index}:`, error);
  }
}

// Search with multi-field query
export async function search(params: {
  index: string;
  query: string;
  filters?: any;
  from?: number;
  size?: number;
  sort?: any;
}) {
  try {
    const { index, query, filters = {}, from = 0, size = 20, sort } = params;

    const must: any[] = [];

    // Add text search query
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['*'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Add filters
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        must.push({ term: { [field]: value } });
      }
    });

    const body: any = {
      query: must.length > 0 ? { bool: { must } } : { match_all: {} },
      from,
      size
    };

    if (sort) {
      body.sort = sort;
    }

    const response = await esClient.search({
      index,
      body
    });

    return {
      hits: response.hits.hits.map((hit: any) => ({
        id: hit._id,
        score: hit._score,
        ...hit._source
      })),
      total: typeof response.hits.total === 'number' 
        ? response.hits.total 
        : response.hits.total?.value || 0
    };
  } catch (error) {
    console.error('Elasticsearch search failed:', error);
    throw error;
  }
}

// Bulk index documents
export async function bulkIndex(index: string, documents: Array<{ id: string; doc: any }>) {
  try {
    const body = documents.flatMap((item) => [
      { index: { _index: index, _id: item.id } },
      item.doc
    ]);

    await esClient.bulk({
      body,
      refresh: 'wait_for'
    });
  } catch (error) {
    console.error(`Bulk index failed for ${index}:`, error);
  }
}

// Check if Elasticsearch is available
export async function isElasticsearchAvailable(): Promise<boolean> {
  try {
    await esClient.ping();
    return true;
  } catch (error) {
    return false;
  }
}

export default esClient;
