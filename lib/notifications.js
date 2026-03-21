import connectDB from './db';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Post from '@/models/Post';
import Event from '@/models/Event';
import Resource from '@/models/Resource';
import { pushNotification } from './notificationStream';

/**
 * Create a new notification
 * @param {Object} params - Notification details
 * @param {string} params.recipient - User ID of the recipient
 * @param {string} params.sender - User ID of the sender
 * @param {string} params.type - Notification type ('like', 'comment', 'follow', 'mention', 'event_reminder', 'resource_approved', 'resource_rejected', 'level_up')
 * @param {string} [params.postId] - Optional Post ID
 * @param {string} [params.eventId] - Optional Event ID
 * @param {string} [params.resourceId] - Optional Resource ID
 */
export async function createNotification({ recipient, sender, type, postId, eventId, resourceId }) {
  // Never notify yourself unless it's a system notification like level_up
  if (recipient?.toString() === sender?.toString() && type !== 'level_up') return null;

  try {
    await connectDB();

    // Deduplication for 'like' notifications
    if (type === 'like') {
      const existing = await Notification.findOne({
        recipient,
        actor: sender,
        type,
        postId
      });
      if (existing) return existing;
    }

    const notification = await Notification.create({
      recipient, 
      actor: sender, 
      type, 
      postId, 
      eventId, 
      resourceId 
    });

    // Populate for SSE push 
    const populated = await Notification.findById(notification._id)
      .populate('actor', 'name username avatar')
      .lean();

    // Push via SSE if user is connected 
    pushNotification(recipient, populated);

    return notification;
  } catch (error) {
    // Notification failure NEVER blocks main action 
    console.error('Notification creation failed:', error.message);
    return null;
  }
}

/**
 * Delete a specific notification (e.g., when unliking)
 * @param {Object} params - Criteria to find the notification
 */
export async function deleteNotification({ sender, type, post }) {
  try {
    await connectDB();
    const result = await Notification.deleteOne({
      actor: sender,
      type,
      postId: post
    });
    return { deleted: result.deletedCount > 0 };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { deleted: false };
  }
}

/**
 * Delete all notifications associated with a post (e.g., when post is deleted)
 * @param {string} postId - The Post ID
 */
export async function deletePostNotifications(postId) {
  try {
    await connectDB();
    await Notification.deleteMany({ postId });
  } catch (error) {
    console.error('Error deleting post notifications:', error);
  }
}
