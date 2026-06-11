import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import LoginHistory from '@/models/LoginHistory';
import { signToken, setAuthCookie } from '@/lib/auth';
import { updateStreak } from '@/lib/gamification';
import { applyRateLimit, rateLimit } from '@/lib/rate-limit';
import { sanitizeUser, sanitizeMongoInput } from '@/lib/sanitize';
import { sendSuspiciousLoginEmail } from '@/lib/email-templates';
import { loginSchema, validateRequest } from '@/utils/schemas';

function parseUserAgent(userAgent = '') {
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? 'Mobile' 
    : /Tablet|iPad/i.test(userAgent) ? 'Tablet' 
    : 'Desktop'
  
  let browser = 'Unknown'
  if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) browser = 'Chrome'
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox'
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari'
  else if (/Edge|Edg/i.test(userAgent)) browser = 'Edge'
  
  return { device, browser }
}

function getClientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown'
}

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

    const validation = await validateRequest(loginSchema)(request);
    if (!validation.valid) {
      return NextResponse.json(
        { message: 'Validation failed', errors: validation.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;



    // Rate limit login by email - 5 attempts per 15 minutes per email
    const emailKey = `login_email_${email?.toString().toLowerCase()}`;
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

    const token = await signToken({ userId: user._id.toString(), username: user.username });

    const response = NextResponse.json({ success: true, user: sanitizeUser(user) });

    await setAuthCookie(response, token);

    // Track login history
    const userAgent = request.headers.get('user-agent') || ''
    const { device, browser } = parseUserAgent(userAgent)
    const ipAddress = getClientIp(request)
    
    // Update streak and handle login history in background
    updateStreak(user._id).catch(err => console.error('Streak update error:', err));
    
    // Check last 5 logins for this user
    const recentLogins = await LoginHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
    
    // Determine if suspicious (new device/browser)
    const isKnownDevice = recentLogins.some(
      login => login.device === device && login.browser === browser
    )
    const isSuspicious = !isKnownDevice && recentLogins.length > 0
    
    // Save login history
    await LoginHistory.create({
      userId: user._id,
      ipAddress,
      userAgent,
      device,
      browser,
      isSuspicious
    })
    
    // Send alert email if suspicious
    if (isSuspicious) {
      sendSuspiciousLoginEmail(user, {
        userAgent,
        ipAddress,
        createdAt: new Date()
      }).catch(err => console.error('Operation failed:', err))
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
