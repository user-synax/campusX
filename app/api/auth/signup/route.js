import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { signToken, setAuthCookie } from '@/lib/auth'
import { notifyAdminNewUser } from '@/lib/admin-notify'
import { applyRateLimit } from '@/lib/redis-rate-limit'
import { signupSchema, validateRequest } from '@/utils/schemas'
import { successResponse, errorResponse, BadRequestError } from '@/lib/api-response'
import { sanitizeText } from '@/lib/sanitize'

export async function POST(request) {
  try {
    const { blocked, response: rateLimitResponse } = await applyRateLimit(
      request,
      'auth_signup',
      3,
      60 * 60 * 1000
    )
    if (blocked) return rateLimitResponse

    let body
    try {
      body = await request.json()
    } catch (e) {
      return errorResponse(new BadRequestError('Invalid request body'))
    }

    const validation = signupSchema.safeParse(body)
    if (!validation.success) {
      return errorResponse(new BadRequestError(
        'Validation failed',
        validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      ))
    }

    const { name, username, email, password, college, course, year, gender } = validation.data

    await connectDB()

    const existingEmail = await User.findOne({ email }).lean()
    if (existingEmail) {
      return errorResponse(new BadRequestError('Email already registered'))
    }

    const existingUsername = await User.findOne({ username }).lean()
    if (existingUsername) {
      return errorResponse(new BadRequestError('Username already taken'))
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    let avatar = ''
    const seed = Math.random().toString(36).substring(7)
    if (gender === 'male') {
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=male`
    } else if (gender === 'female') {
      avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=female`
    } else {
      avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`
    }

    const user = await User.create({
      name: sanitizeText(name),
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      college: sanitizeText(college || ''),
      course: sanitizeText(course || ''),
      year: parseInt(year) || 1,
      gender: gender || 'unspecified',
      avatar
    })

    try {
      const { FOUNDER_USERNAME } = await import('@/lib/founder')
      if (FOUNDER_USERNAME) {
        const founderUser = await User.findOne({ username: FOUNDER_USERNAME }).lean()
        if (founderUser && founderUser._id.toString() !== user._id.toString()) {
          await User.findByIdAndUpdate(user._id, {
            $addToSet: { following: founderUser._id }
          })
          await User.findByIdAndUpdate(founderUser._id, {
            $addToSet: { followers: user._id }
          })
        }
      }
    } catch (err) {
      console.error('Auto-follow founder failed:', err.message)
    }

    const token = signToken({ userId: user._id, username: user.username })
    const response = successResponse(
      { user: { _id: user._id, name: user.name, username: user.username, avatar: user.avatar } },
      { status: 201 }
    )

    await setAuthCookie(response, token)
    notifyAdminNewUser(user).catch(() => {})

    import('@/lib/globalGroup').then(({ autoJoinGlobalGroup }) => {
      autoJoinGlobalGroup(user._id).catch(() => {})
    }).catch(() => {})

    return response
  } catch (error) {
    console.error('Signup error:', error)
    return errorResponse(error)
  }
}
