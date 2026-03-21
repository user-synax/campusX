import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import connectDB from '@/lib/db';

const loginAttempts = new Map();

export function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const attemptData = loginAttempts.get(ip) || { count: 0, firstAttempt: now };

  if (now - attemptData.firstAttempt > windowMs) {
    attemptData.count = 1;
    attemptData.firstAttempt = now;
  } else {
    attemptData.count++;
  }

  loginAttempts.set(ip, attemptData);

  if (attemptData.count > maxAttempts) {
    return false;
  }

  return true;
}

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256', // Be explicit to match jose in middleware
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(response, token) {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || process.env.VERCEL === '1',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  };

  // 1. Set on the response object (for middleware/API compatibility)
  if (response && response.cookies) {
    response.cookies.set('campusx_token', token, options);
  }

  // 2. Also set using the next/headers cookies() helper for redundancy/reliability in App Router
  try {
    const cookieStore = await cookies();
    cookieStore.set('campusx_token', token, options);
  } catch (e) {
    // In some contexts (like middleware), cookies() might be read-only or not available
    // We already set it on the response, so this is fine
  }
}

export async function clearAuthCookie(response) {
  const options = { maxAge: 0, path: '/' };
  
  if (response && response.cookies) {
    response.cookies.set('campusx_token', '', options);
  }

  try {
    const cookieStore = await cookies();
    cookieStore.set('campusx_token', '', options);
  } catch (e) {}
}

export function getTokenFromRequest(request) {
  return request.cookies.get('campusx_token')?.value || null;
}

export async function getCurrentUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();
  const user = await User.findById(decoded.userId).lean();
  if (!user) return null;

  delete user.password;
  return user;
}
