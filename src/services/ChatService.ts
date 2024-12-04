import { Server } from 'socket.io';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { Conversation } from '../models/Conversation';

export class ChatService {
  private io: Server;
  private connectedUsers: Map<string, string> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('authenticate', async (token: string) => {
        try {
          const userId = await this.verifyToken(token);
          this.connectedUsers.set(socket.id, userId);
          await User.findByIdAndUpdate(userId, { estEnLigne: true });
          
          socket.join(`user:${userId}`);
          this.io.emit('userOnline', userId);
        } catch (error) {
          socket.disconnect();
        }
      });

      socket.on('sendMessage', async (data) => {
        const userId = this.connectedUsers.get(socket.id);
        if (!userId) return;

        try {
          const { conversationId, content, type = 'TEXT' } = data;
          
          const conversation = await Conversation.findById(conversationId);
          if (!conversation) return;

          const message = await Message.create({
            expediteur: userId,
            destinataire: conversation.participants.find(p => p.toString() !== userId),
            contenu: content,
            type,
            conversation: conversationId,
          });

          await Conversation.findByIdAndUpdate(conversationId, {
            dernierMessage: message._id,
            dateDernierMessage: new Date(),
            $inc: { [`nonLus.${conversation.participants.find(p => p.toString() !== userId)}`]: 1 },
          });

          const populatedMessage = await Message.findById(message._id)
            .populate('expediteur', 'nom prenom avatar')
            .populate('destinataire', 'nom prenom avatar');

          conversation.participants.forEach((participantId) => {
            this.io.to(`user:${participantId}`).emit('newMessage', populatedMessage);
          });
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });

      socket.on('disconnect', async () => {
        const userId = this.connectedUsers.get(socket.id);
        if (userId) {
          await User.findByIdAndUpdate(userId, { estEnLigne: false });
          this.connectedUsers.delete(socket.id);
          this.io.emit('userOffline', userId);
        }
      });
    });
  }

  private async verifyToken(token: string): Promise<string> {
    // Implement your JWT verification logic here
    return 'userId';
  }
}