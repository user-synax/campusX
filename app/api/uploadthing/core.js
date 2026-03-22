import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

const f = createUploadthing();

/**
 * Edge-compatible JWT verification helper.
 */
async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
      { algorithms: ['HS256'] }
    );
    return payload;
  } catch (error) {
    console.error('[UploadThing] JWT Verification Error:', error.message);
    return null;
  }
}

export const ourFileRouter = {
  /**
   * Main resource uploader for student materials.
   * Handles PDFs (16MB) and Images (4MB).
   */
  resourceUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      try {
        // 1. Extract token from cookies (supporting Next.js 15/16 header access patterns)
        let token = req.cookies.get('campusx_token')?.value;
        
        if (!token) {
          const cookieHeader = req.headers.get('cookie');
          if (cookieHeader) {
            const match = cookieHeader.match(/campusx_token=([^;]+)/);
            if (match) token = match[1];
          }
        }
        
        if (!token) {
          throw new UploadThingError({
            code: "UNAUTHORIZED",
            message: "Session required for resource upload."
          });
        }

        // 2. Verify identity
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
          throw new UploadThingError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired session. Please refresh."
          });
        }

        // 3. Ensure user exists in database
        await connectDB();
        const user = await User.findById(decoded.userId).lean();
        if (!user) {
          throw new UploadThingError({
            code: "UNAUTHORIZED",
            message: "User account no longer active."
          });
        }

        return { userId: user._id.toString() };
      } catch (err) {
        if (err instanceof UploadThingError) throw err;
        console.error("[UploadThing Middleware Error]:", err.message);
        throw new UploadThingError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal authentication failure. Please try again."
        });
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Return metadata to client for database persistence in Phase 2
      return {
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: metadata.userId,
      };
    }),
};
