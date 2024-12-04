import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { env } from './config/env';
import { authRoutes } from './routes/auth';
import { propertyRoutes } from './routes/properties';
import { roommateRoutes } from './routes/roommates';
import { messageRoutes } from './routes/messages';
import { ChatService } from './services/ChatService';
import { NotificationService } from './services/NotificationService';
import { setupRateLimiter } from './middleware/rateLimiter';

const fastify = Fastify({
  logger: true,
});

// HTTP server for Socket.IO
const server = createServer(fastify.server);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize services
const chatService = new ChatService(io);
const notificationService = new NotificationService(io);

// Plugins
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : true,
  credentials: true
});
await fastify.register(multipart);
await fastify.register(jwt, {
  secret: env.JWT_SECRET,
});

// Rate limiting
await setupRateLimiter(fastify);

// Swagger documentation
await fastify.register(swagger, {
  swagger: {
    info: {
      title: 'DarTaleb API',
      description: 'API pour la plateforme de logement étudiant DarTaleb',
      version: '1.0.0',
    },
    tags: [
      { name: 'auth', description: 'Authentication endpoints' },
      { name: 'properties', description: 'Property management endpoints' },
      { name: 'roommates', description: 'Roommate search endpoints' },
      { name: 'messages', description: 'Messaging endpoints' },
    ],
  },
});
await fastify.register(swaggerUi);

// Routes
await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(propertyRoutes, { prefix: '/api/properties' });
await fastify.register(roommateRoutes, { prefix: '/api/roommates' });
await fastify.register(messageRoutes, { prefix: '/api/messages' });

// Add this near other routes
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Add security headers
fastify.addHook('onRequest', async (request, reply) => {
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode || 500).send({
    error: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
  });
});

// Database connection
try {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connecté à MongoDB avec succès');
} catch (error) {
  console.error('Erreur de connexion à MongoDB:', error);
  process.exit(1);
}

// Start server
try {
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  const port = parseInt(env.PORT);
  
  server.listen({ port, host }, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}