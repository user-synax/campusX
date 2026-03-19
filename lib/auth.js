import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';

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
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set('campusx_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export function clearAuthCookie(response) {
  response.cookies.set('campusx_token', '', { maxAge: 0 });
}

export function getTokenFromRequest(request) {
  return request.cookies.get('campusx_token')?.value || null;
}

export async function getCurrentUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await User.findById(decoded.userId).lean();
  if (!user) return null;

  delete user.password;
  return user;
}
