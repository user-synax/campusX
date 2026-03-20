export const REACTIONS = { 
  like: '❤️', 
  funny: '😂', 
  wow: '😮', 
  sad: '😢', 
  respect: '👏', 
  fire: '🔥' 
}

export const REACTION_KEYS = Object.keys(REACTIONS);

export function computeReactionSummary(reactions, likes = []) {
  const summary = {
    total: 0,
    byType: {},
    topEmojis: []
  };

  // Initialize counts for all keys
  REACTION_KEYS.forEach(key => {
    summary.byType[key] = 0;
  });

  // Track users who already have a reaction to avoid double counting from likes array
  const usersWithReaction = new Set();

  // Process reactions
  if (Array.isArray(reactions)) {
    reactions.forEach(r => {
      if (REACTIONS[r.type]) {
        summary.byType[r.type]++;
        summary.total++;
        usersWithReaction.add(r.user.toString());
      }
    });
  }

  // Backward compatibility: Process likes as 'like' reactions if user hasn't reacted yet
  if (Array.isArray(likes)) {
    likes.forEach(userId => {
      const userIdStr = userId.toString();
      if (!usersWithReaction.has(userIdStr)) {
        summary.byType['like']++;
        summary.total++;
        usersWithReaction.add(userIdStr);
      }
    });
  }

  // Calculate topEmojis (top 3 by count)
  const sortedTypes = REACTION_KEYS
    .filter(key => summary.byType[key] > 0)
    .sort((a, b) => summary.byType[b] - summary.byType[a])
    .slice(0, 3);

  summary.topEmojis = sortedTypes.map(key => REACTIONS[key]);

  return summary;
}

export function getUserReaction(reactions, userId, likes = []) {
  if (!userId) return null;
  const userIdStr = userId.toString();

  // Check reactions array first
  if (Array.isArray(reactions)) {
    const found = reactions.find(r => r.user.toString() === userIdStr);
    if (found) return found.type;
  }

  // Check likes array for backward compatibility
  if (Array.isArray(likes)) {
    if (likes.some(uId => uId.toString() === userIdStr)) {
      return 'like';
    }
  }

  return null;
}
