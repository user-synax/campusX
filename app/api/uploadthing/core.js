import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/db";
import User from "@/models/User";

const f = createUploadthing();

/** Edge-compatible JWT verification helper. */
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

/** Shared authentication middleware reused by all uploaders. */
async function authenticateRequest(req) {
  let token = null;

  const fromCookie = req.cookies.get('campusx_token')?.value;
  if (fromCookie) {
    token = fromCookie;
  } else {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/campusx_token=([^;]+)/);
      if (match) token = match[1];
    }
  }

  if (!token) {
    throw new UploadThingError({ code: "UNAUTHORIZED", message: "Session required for upload." });
  }

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.userId) {
    throw new UploadThingError({ code: "UNAUTHORIZED", message: "Invalid or expired session. Please refresh." });
  }

  await connectDB();
  const user = await User.findById(decoded.userId).lean();
  if (!user) {
    throw new UploadThingError({ code: "UNAUTHORIZED", message: "User account no longer active." });
  }

  return { userId: user._id.toString() };
}

export const ourFileRouter = {
  /** Main resource uploader for student materials. Handles PDFs (16MB) and Images (4MB). */
  resourceUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => authenticateRequest(req))
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
        key: file.key,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: metadata.userId,
      };
    }),

  /** Post image uploader — up to 6 images per post, 8 MB each. */
  postImageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 6 },
  })
    .middleware(async ({ req }) => authenticateRequest(req))
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.url,
        key: file.key,
        uploadedBy: metadata.userId,
      };
    }),
};
