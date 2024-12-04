import { FastifyInstance } from 'fastify';
import { User, UserRole } from '../models/User';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nom: z.string(),
  prenom: z.string(),
  telephone: z.string(),
  role: z.enum([UserRole.PROPRIETAIRE, UserRole.ETUDIANT]),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return reply.code(400).send({ message: 'Cet email est déjà utilisé' });
    }

    const user = new User(body);
    await user.save();

    const token = fastify.jwt.sign({ id: user._id });
    return { token };
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };
    
    const user = await User.findOne({ email });
    if (!user) {
      return reply.code(401).send({ message: 'Email ou mot de passe incorrect' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return reply.code(401).send({ message: 'Email ou mot de passe incorrect' });
    }

    const token = fastify.jwt.sign({ id: user._id });
    return { token };
  });
}