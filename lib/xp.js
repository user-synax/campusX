import User from '@/models/User';

/**
 * Awards XP to a user and handles leveling up.
 * 
 * @param {string} userId - The ID of the user to award XP to
 * @param {string} type - The action type (post, follow, like, etc.)
 * @returns {Promise<{xpAwarded: boolean, newXP: number, newLevel: number, leveledUp: boolean}>}
 */
export async function awardXP(userId, type) {
  try {
    const XP_VALUES = {
      post: 20,
      follow: 10,
      like: 5,
      comment: 10,
      daily_login: 50
    };

    const amount = XP_VALUES[type] || 0;
    if (amount === 0) return { xpAwarded: false };

    const user = await User.findById(userId);
    if (!user) return { xpAwarded: false };

    const oldLevel = user.level || 1;
    const currentXP = user.xp || 0;
    const newXP = currentXP + amount;

    // Simple leveling logic: level = floor(newXP / 1000) + 1
    const newLevel = Math.floor(newXP / 1000) + 1;
    const leveledUp = newLevel > oldLevel;

    user.xp = newXP;
    user.level = newLevel;
    await user.save();

    return {
      xpAwarded: true,
      amount,
      newXP,
      newLevel,
      leveledUp
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { xpAwarded: false };
  }
}
