import { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';

export async function setupRateLimiter(fastify: FastifyInstance) {
  await fastify.register(rateLimit, {
    max: 100, // Max requests per window
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'], // IPs to whitelist
    redis: undefined, // Use memory store (for production, consider using Redis)
  });
}