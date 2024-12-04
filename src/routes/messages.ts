import { FastifyInstance } from 'fastify';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';
import { User } from '../models/User';

export async function messageRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Créer ou obtenir une conversation
  fastify.post('/conversations', async (request) => {
    const { destinataireId, propertyId } = request.body as { destinataireId: string; propertyId?: string };
    const expediteurId = request.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [expediteurId, destinataireId] },
      ...(propertyId && { property: propertyId }),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [expediteurId, destinataireId],
        ...(propertyId && { property: propertyId }),
      });
    }

    return conversation.populate([
      { path: 'participants', select: 'nom prenom avatar estEnLigne' },
      { path: 'dernierMessage' },
      { path: 'property', select: 'titre images' },
    ]);
  });

  // Obtenir toutes les conversations
  fastify.get('/conversations', async (request) => {
    const userId = request.user.id;
    
    const conversations = await Conversation.find({
      participants: userId,
    })
    .populate('participants', 'nom prenom avatar estEnLigne')
    .populate('dernierMessage')
    .populate('property', 'titre images')
    .sort({ dateDernierMessage: -1 });

    return conversations;
  });

  // Obtenir les messages d'une conversation
  fastify.get('/conversations/:conversationId/messages', async (request) => {
    const { conversationId } = request.params as { conversationId: string };
    const userId = request.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    // Marquer les messages comme lus
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`nonLus.${userId}`]: 0 },
    });

    const messages = await Message.find({ conversation: conversationId })
      .populate('expediteur', 'nom prenom avatar')
      .populate('destinataire', 'nom prenom avatar')
      .sort({ dateEnvoi: -1 })
      .limit(50);

    return messages;
  });

  // Marquer une conversation comme lue
  fastify.post('/conversations/:conversationId/read', async (request) => {
    const { conversationId } = request.params as { conversationId: string };
    const userId = request.user.id;

    await Conversation.findOneAndUpdate(
      { _id: conversationId, participants: userId },
      { $set: { [`nonLus.${userId}`]: 0 } },
    );

    return { success: true };
  });

  // Rechercher dans les messages
  fastify.get('/messages/search', async (request) => {
    const { query } = request.query as { query: string };
    const userId = request.user.id;

    const messages = await Message.find({
      $and: [
        { $text: { $search: query } },
        {
          $or: [
            { expediteur: userId },
            { destinataire: userId },
          ],
        },
      ],
    })
    .populate('expediteur', 'nom prenom avatar')
    .populate('destinataire', 'nom prenom avatar')
    .populate('conversation')
    .sort({ score: { $meta: 'textScore' } });

    return messages;
  });
}