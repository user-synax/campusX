import User from "@/models/User";
import Subscription from "@/models/Subscription";
import { connectDB } from "./db";

/**
 * Checks and updates user's isPro status based on active subscription
 * @param {string} userId - User's ObjectId
 * @returns {Promise<boolean>} - Current isPro status
 */
export async function refreshUserProStatus(userId) {
    await connectDB();

    const subscription = await Subscription.findOne({ userId });
    const now = new Date();
    const isCurrentlyPro =
        subscription && subscription.isActive && subscription.endsAt > now;

    // Update user's isPro if it changed
    await User.findByIdAndUpdate(userId, { isPro: isCurrentlyPro });

    return isCurrentlyPro;
}

/**
 * Checks if a user is currently a Pro user
 * @param {string} userId - User's ObjectId
 * @returns {Promise<boolean>}
 */
export async function isUserPro(userId) {
    return await refreshUserProStatus(userId);
}
