import { Server } from 'socket.io';
import { User } from '../models/User';
import { cacheService } from './CacheService';

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async sendNotification(userId: string, notification: {
    type: 'MESSAGE' | 'PROPERTY_INTEREST' | 'ROOMMATE_REQUEST';
    message: string;
    lienAction?: string;
  }) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            notifications: {
              ...notification,
              date: new Date(),
              lu: false,
            },
          },
        },
        { new: true }
      );

      if (user) {
        this.io.to(`user:${userId}`).emit('notification', notification);
        
        // Update cache
        const cacheKey = `user:${userId}:notifications`;
        const cachedNotifications = cacheService.get<any[]>(cacheKey) || [];
        cachedNotifications.unshift(notification);
        cacheService.set(cacheKey, cachedNotifications);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await User.updateOne(
        { _id: userId, 'notifications._id': notificationId },
        { $set: { 'notifications.$.lu': true } }
      );

      // Update cache
      const cacheKey = `user:${userId}:notifications`;
      cacheService.del(cacheKey);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}