import connectDB from './db';
import Notification from '@/models/Notification';

/**
 * Create a new notification
 * @param {Object} params - Notification details
 * @param {string} params.recipient - User ID of the recipient
 * @param {string} params.sender - User ID of the sender
 * @param {string} params.type - Notification type ('like', 'comment', 'follow', 'event_cancelled', 'reaction')
 * @param {string} [params.reactionType] - Optional reaction type ('like', 'funny', 'wow', 'sad', 'respect', 'fire')
 * @param {string} [params.post] - Optional Post ID
 * @param {string} [params.comment] - Optional Comment ID
 * @param {string} [params.event] - Optional Event ID
 */
export async function createNotification({ recipient, sender, type, reactionType, post, comment, event }) {
  try {
    // Skip if sender is the recipient (no self-notifications)
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    await connectDB();

    // Deduplication for 'like' or 'reaction' notifications
    if (type === 'like' || type === 'reaction') {
      const existing = await Notification.findOne({
        recipient,
        sender,
        type,
        post
      });
      if (existing) {
        // Update reactionType if needed
        if (type === 'reaction' && existing.reactionType !== reactionType) {
          existing.reactionType = reactionType;
          existing.read = false; // Reset read status for new reaction
          await existing.save();
        }
        return existing;
      }
    }

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      reactionType,
      post,
      comment,
      event
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
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
      sender,
      type,
      post
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
    await Notification.deleteMany({ post: postId });
  } catch (error) {
    console.error('Error deleting post notifications:', error);
  }
}
