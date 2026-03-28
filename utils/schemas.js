import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
})

export const signupSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  username: z.string()
    .regex(/^[a-zA-Z0-9_]{3,20}$/, 'Username must be 3-20 characters, alphanumeric and underscores only')
    .toLowerCase(),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password cannot exceed 100 characters'),
  college: z.string().max(100).optional().default(''),
  course: z.string().max(100).optional().default(''),
  year: z.number().int().min(1).max(6).optional().default(1),
  gender: z.enum(['male', 'female', 'other', 'unspecified']).optional().default('unspecified')
})

export const objectIdSchema = z.string().refine(
  (val) => /^[a-f\d]{24}$/i.test(val),
  'Invalid ID format'
)

export const followSchema = z.object({
  targetUserId: objectIdSchema
})

export const postCreateSchema = z.object({
  content: z.string()
    .min(1, 'Content is required')
    .max(2000, 'Post cannot exceed 2000 characters')
    .trim(),
  community: z.string().max(50).optional().default(''),
  isAnonymous: z.boolean().optional().default(false),
  poll: z.array(z.string().max(80)).min(2).max(4).optional(),
  linkPreview: z.object({
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    image: z.string().url().optional(),
    url: z.string().url().optional()
  }).optional(),
  images: z.array(z.string().url()).max(6).optional().default([])
})

export const reactionSchema = z.object({
  postId: objectIdSchema,
  reactionType: z.enum(['like', 'funny', 'wow', 'sad', 'respect', 'fire'])
})

export const bookmarkSchema = z.object({
  postId: objectIdSchema
})

export const commentSchema = z.object({
  postId: objectIdSchema,
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(280, 'Comment cannot exceed 280 characters')
    .trim()
})

export const coinGiftSchema = z.object({
  toUserId: objectIdSchema,
  amount: z.number().int().min(1, 'Amount must be at least 1')
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20)
})

export const validateRequest = (schema) => {
  return async (request) => {
    try {
      let body
      const contentType = request.headers.get('content-type')
      
      if (contentType?.includes('application/json')) {
        body = await request.json()
      } else {
        const formData = await request.formData()
        body = Object.fromEntries(formData)
      }

      const result = schema.safeParse(body)
      
      if (!result.success) {
        return {
          valid: false,
          errors: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      }

      return { valid: true, data: result.data }
    } catch (error) {
      return {
        valid: false,
        errors: [{ field: 'body', message: 'Invalid request body' }]
      }
    }
  }
}
