import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken, setAuthCookie } from '@/lib/auth';
import { validateEmail, validateUsername, validatePassword } from '@/utils/validators';
import { applyRateLimit } from '@/lib/rate-limit';
import { sanitizeText, sanitizeUsername, sanitizeUser } from '@/lib/sanitize';

export async function POST(request) {
  try {
    // Rate limit signup - 3 requests per hour per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'auth_signup',
      3,
      60 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { name, username, email, password, college, course, year } = body;

    await connectDB();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const sanitizedUsername = sanitizeUsername(username);
    const sanitizedEmail = email.toLowerCase().trim();

    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
    }

    if (!validateUsername(sanitizedUsername)) {
      return NextResponse.json({ message: 'Invalid username format' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ message: passwordValidation.message }, { status: 400 });
    }

    const existingEmail = await User.findOne({ email: sanitizedEmail });
    if (existingEmail) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const existingUsername = await User.findOne({ username: sanitizedUsername });
    if (existingUsername) {
      return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: sanitizeText(name),
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      college: sanitizeText(college),
      course: sanitizeText(course),
      year: parseInt(year) || 1,
    });

    // Auto-follow founder 
    try {
      const { FOUNDER_USERNAME } = await import('@/lib/founder');
      if (FOUNDER_USERNAME) {
        const founderUser = await User.findOne({ username: FOUNDER_USERNAME });
        if (founderUser && founderUser._id.toString() !== user._id.toString()) {
          // Add founder to new user's following 
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { following: founderUser._id }
          });
          // Add new user to founder's followers 
          await User.findByIdAndUpdate(founderUser._id, {
            $addToSet: { followers: user._id }
          });
        }
      }
    } catch (err) {
      // Never block signup if auto-follow fails 
      console.error('Auto-follow founder failed:', err.message);
    }

    const token = signToken({ userId: user._id, username: user.username });

    const response = NextResponse.json(
      { success: true, user: sanitizeUser(user) },
      { status: 201 }
    );

    await setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
