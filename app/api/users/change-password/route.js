import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { 
  successResponse, 
  errorResponse, 
  BadRequestError, 
  UnauthorizedError 
} from '@/lib/api-response';
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Rate limit password changes - 3 attempts per hour per user
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'change_password',
      3,
      60 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    await connectDB();
    
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(new UnauthorizedError('Please log in to change your password'));
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return errorResponse(new BadRequestError('Old and new passwords are required'));
    }

    // Find user with password field
    const dbUser = await User.findById(user._id).select('+password');
    if (!dbUser) {
      return errorResponse(new BadRequestError('User not found'));
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, dbUser.password);
    if (!isMatch) {
      return errorResponse(new BadRequestError('Current password is incorrect'));
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    dbUser.password = hashedPassword;
    // Increment tokenVersion to invalidate other sessions if desired
    dbUser.tokenVersion = (dbUser.tokenVersion || 0) + 1;
    await dbUser.save();

    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[change-password] Error:', error);
    return errorResponse(error);
  }
}
