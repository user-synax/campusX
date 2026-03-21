import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { signToken, setAuthCookie } from '@/lib/auth';
import { applyRateLimit, rateLimit } from '@/lib/rate-limit';

export async function POST(request) {
  try {
    // Rate limit login - 10 requests per 15 minutes per IP
    const { blocked, response: rateLimitResponse } = applyRateLimit(
      request,
      'auth_login_ip',
      10,
      15 * 60 * 1000
    );
    if (blocked) return rateLimitResponse;

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const { email, password } = body;

    // Rate limit login by email - 5 attempts per 15 minutes per email
    const emailKey = `login_email_${email?.toLowerCase()}`;
    const emailResult = rateLimit(emailKey, 5, 15 * 60 * 1000);
    if (!emailResult.allowed) {
      return NextResponse.json(
        { message: `Too many login attempts for this account. Try again in ${emailResult.retryAfter} seconds.` },
        { 
          status: 429,
          headers: {
            'Retry-After': String(emailResult.retryAfter)
          }
        }
      );
    }

    await connectDB();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ userId: user._id, username: user.username });

    const response = NextResponse.json({ success: true, user: user.toSafeObject() });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
