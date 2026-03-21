import Hashtag from '@/models/Hashtag';
import { deleteCachePattern, deleteCache } from '@/lib/cache';

/**
 * Indexes hashtags in the database.
 * @param {string[]} hashtags - An array of unique hashtag strings (without the # symbol).
 */
export async function indexHashtags(hashtags) {
  if (!hashtags || hashtags.length === 0) return;

  try {
    const promises = hashtags.map(tag => {
      return Hashtag.findOneAndUpdate(
        { tag },
        { 
          $inc: { postCount: 1, weeklyCount: 1 }, 
          $set: { lastUsedAt: new Date() } 
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(promises);

    // Invalidate caches
    deleteCachePattern('trending_hashtags');
    deleteCache('search_trending');
  } catch (error) {
    console.error('Error indexing hashtags:', error);
    // Swallow error - hashtag indexing is non-critical for post creation
  }
}

/**
 * Removes hashtags from the database (decrementing postCount).
 * @param {string[]} hashtags - An array of unique hashtag strings (without the # symbol).
 */
export async function removeHashtags(hashtags) {
  if (!hashtags || hashtags.length === 0) return;

  try {
    const promises = hashtags.map(async tag => {
      const updatedHashtag = await Hashtag.findOneAndUpdate(
        { tag },
        { $inc: { postCount: -1 } },
        { new: true }
      );

      // If postCount reaches 0 or less, delete the hashtag
      if (updatedHashtag && updatedHashtag.postCount <= 0) {
        await Hashtag.deleteOne({ tag });
      }
    });

    await Promise.all(promises);

    // Invalidate caches
    deleteCachePattern('trending_hashtags');
    deleteCache('search_trending');
  } catch (error) {
    console.error('Error removing hashtags:', error);
  }
}
