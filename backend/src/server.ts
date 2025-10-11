import dotenv from 'dotenv';

// Load environment variables FIRST before any other imports
dotenv.config();

import express, { Application, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Import configurations
import './config/passport';
import './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes, { setSocketIO as setPostSocketIO } from './routes/posts';
import eventRoutes from './routes/events';
import connectionRoutes, { setSocketIO as setConnectionSocketIO } from './routes/connections';
import mentorshipRoutes, { setSocketIO as setMentorshipSocketIO } from './routes/mentorship';
import messageRoutes, { setSocketIO as setMessageSocketIO } from './routes/messages';
import knowledgeRoutes from './routes/knowledge';
import groupRoutes from './routes/groups';
import gamificationRoutes from './routes/gamification';
import notificationRoutes from './routes/notification';
import searchRoutes from './routes/search';
// Career Platform Routes
import jobRoutes from './routes/jobs';
import companyRoutes from './routes/companies';
import applicationRoutes from './routes/applications';
import referralRoutes from './routes/referrals';

// Import services
import { initializeIndices } from './services/elasticsearch';
import { searchService } from './services/searchService';

// Initialize Express App
const app: Application = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

app.use(helmet()); // Security headers
app.use(compression()); // Response compression
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'campusconnect-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect',
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// ============================================================================
// SOCKET.IO CONFIGURATION
// ============================================================================

// Pass Socket.IO to routes that need it
setPostSocketIO(io);
setConnectionSocketIO(io);
setMentorshipSocketIO(io);
setMessageSocketIO(io);

// ============================================================================
// ROUTES
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
// Career Platform Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/referrals', referralRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = process.env.PORT || 5000;

// Initialize Elasticsearch and search service
(async () => {
  await initializeIndices();
  await searchService.initialize();
})();

server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════╗
  ║                                                        ║
  ║         🎓 CAMPUSCONNECT SERVER RUNNING 🎓            ║
  ║                                                        ║
  ║  Server:        http://localhost:${PORT}                 ║
  ║  Environment:   ${process.env.NODE_ENV || 'development'}              ║
  ║  Database:      Connected to MongoDB                   ║
  ║  Socket.IO:     Real-time communication enabled        ║
  ║                                                        ║
  ╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    mongoose.connection.close();
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, io };