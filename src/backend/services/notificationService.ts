import { ApiError } from '../utils/errors';
import { supabase } from '../../lib/supabase';

export class NotificationService {
  async sendNotificationToUser(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      // Enregistrer la notification dans Supabase
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          content: notification.body,
          data: notification.data || {},
          read: false
        });

      if (error) {
        throw new ApiError(500, 'Failed to save notification');
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to send notification');
    }
  }

  async sendNotificationToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      // Enregistrer la notification de topic dans Supabase
      const { error } = await supabase
        .from('notifications')
        .insert({
          topic,
          title: notification.title,
          content: notification.body,
          data: notification.data || {},
          read: false
        });

      if (error) {
        throw new ApiError(500, 'Failed to save notification');
      }

      return { success: true };
    } catch (error) {
      throw new ApiError(500, 'Failed to send notification to topic');
    }
  }
}