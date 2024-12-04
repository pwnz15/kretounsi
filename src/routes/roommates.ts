import { FastifyInstance } from 'fastify';
import { RoommatePost } from '../models/RoommatePost';

export async function roommateRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });

  // Créer une annonce de colocation
  fastify.post('/', async (request) => {
    const roommatePost = new RoommatePost({
      ...request.body,
      etudiant: request.user.id,
    });
    
    await roommatePost.save();
    return roommatePost;
  });

  // Obtenir toutes les annonces de colocation
  fastify.get('/', async () => {
    return RoommatePost.find()
      .populate('etudiant', 'nom prenom telephone')
      .sort({ datePublication: -1 });
  });

  // Obtenir une annonce spécifique
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const post = await RoommatePost.findById(id)
      .populate('etudiant', 'nom prenom telephone');
    
    if (!post) {
      return reply.code(404).send({ message: 'Annonce non trouvée' });
    }
    
    return post;
  });
}