import Post from '@/models/Post';
import AnonymousPost from '@/models/AnonymousPost';

/**
 * Finds a post by ID in either the Post or AnonymousPost collection.
 * 
 * @param {string} postId - The ID of the post to find
 * @returns {Promise<{post: any, model: any}>}
 */
export async function findPostById(postId) {
  // Check regular posts first
  let post = await Post.findById(postId);
  if (post) return { post, model: Post };

  // Then check anonymous posts
  post = await AnonymousPost.findById(postId);
  if (post) return { post, model: AnonymousPost };

  return { post: null, model: null };
}

/**
 * Checks if a post exists and returns its model.
 * Useful for findOneAndUpdate operations.
 */
export async function getModelForPost(postId) {
  const { model } = await findPostById(postId);
  return model;
}
