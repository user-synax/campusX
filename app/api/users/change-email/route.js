import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { getCurrentUser } from '@/lib/auth';
import { 
  successResponse, 
  errorResponse, 
  BadRequestError, 
  UnauthorizedError,
  ConflictError
} from '@/lib/api-response';

export async function POST(request) {
  try {
    await connectDB();
    
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(new UnauthorizedError('Please log in to change your email'));
    }

    const body = await request.json();
    const { newEmail, otp } = body;

    if (!newEmail || !otp) {
      return errorResponse(new BadRequestError('New email and OTP are required'));
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // 1. Verify OTP
    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      otp,
      purpose: 'email_change'
    });

    if (!otpDoc) {
      return errorResponse(new BadRequestError('Invalid or expired OTP'));
    }

    // 2. Check if new email is already taken
    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
    if (existingUser) {
      return errorResponse(new ConflictError('Email is already registered with another account'));
    }

    // 3. Update user email
    await User.findByIdAndUpdate(user._id, { email: normalizedEmail });

    // 4. Delete OTP after use
    await Otp.deleteOne({ _id: otpDoc._id });

    return successResponse({ 
      message: 'Email updated successfully',
      email: normalizedEmail
    });
  } catch (error) {
    console.error('[change-email] Error:', error);
    return errorResponse(error);
  }
}
