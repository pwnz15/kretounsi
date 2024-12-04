import { FastifyInstance } from 'fastify';
import { PropertyService } from '../services/PropertyService';
import { propertySchema } from '../utils/validation';
import { logger } from '../utils/logger';

const propertyService = new PropertyService();

export async function propertyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Swagger documentation for routes
  const propertyTag = { name: 'properties', description: 'Property management endpoints' };

  fastify.post('/', {
    schema: {
      tags: [propertyTag.name],
      description: 'Create a new property listing',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          property: { type: 'string' },
          images: { type: 'array', items: { type: 'string', format: 'binary' } },
        },
        required: ['property', 'images'],
      },
      response: {
        201: {
          description: 'Successfully created property',
          type: 'object',
          properties: {
            _id: { type: 'string' },
            titre: { type: 'string' },
            // Add other property fields
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
  }, async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({ message: 'Images requises' });
      }

      const propertyData = JSON.parse(data.fields.property.value);
      propertySchema.parse(propertyData);

      const property = await propertyService.createProperty(propertyData, [data]);
      
      reply.code(201).send(property);
    } catch (error) {
      logger.error(error, 'Error creating property');
      reply.code(400).send({ message: error.message });
    }
  });

  // Add more routes with similar documentation...
}