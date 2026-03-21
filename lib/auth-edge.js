import { jwtVerify } from 'jose';

export async function verifyToken(token) {
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
      {
        algorithms: ['HS256'],
      }
    );
    return payload;
  } catch (error) {
    // Log auth failure reasons for debugging production logout issues
    console.error('JWT Verification failed:', error.message);
    return null;
  }
}
