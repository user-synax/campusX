import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an avatar image to Cloudinary.
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} userId - The user's ID for consistent public_id.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export async function uploadAvatar(fileBuffer, userId) {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "campuszen/avatars",
                    public_id: `user_${userId}`,
                    overwrite: true, // same user always overwrites their old avatar
                    transformation: [
                        {
                            width: 400,
                            height: 400,
                            crop: "fill",
                            gravity: "face",
                        },
                        { quality: "auto", fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            )
            .end(fileBuffer);
    });
    return result.secure_url;
}

/**
 * Deletes an avatar from Cloudinary.
 * @param {string} userId - The user's ID to identify the avatar.
 */
export async function deleteAvatar(userId) {
    try {
        await cloudinary.uploader.destroy(`campuszen/avatars/user_${userId}`);
    } catch (err) {
        console.error("Avatar delete failed:", err.message);
    }
}

/**
 * Uploads a banner image to Cloudinary.
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} userId - The user's ID for consistent public_id.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export async function uploadBanner(fileBuffer, userId) {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "campuszen/banners",
                    public_id: `user_${userId}`,
                    overwrite: true, // same user always overwrites their old banner
                    transformation: [
                        {
                            width: 1500,
                            height: 500,
                            crop: "fill",
                            gravity: "center",
                        },
                        { quality: "auto", fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            )
            .end(fileBuffer);
    });
    return result.secure_url;
}

/**
 * Deletes a banner from Cloudinary.
 * @param {string} userId - The user's ID to identify the banner.
 */
export async function deleteBanner(userId) {
    try {
        await cloudinary.uploader.destroy(`campuszen/banners/user_${userId}`);
    } catch (err) {
        console.error("Banner delete failed:", err.message);
    }
}

/**
 * Uploads a college ID card image to Cloudinary.
 * @param {Buffer} fileBuffer - The image/pdf file buffer.
 * @param {string} userId - The user's ID for a unique public_id.
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
export async function uploadVerificationId(fileBuffer, userId) {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "campuszen/verifications",
                    public_id: `id_${userId}_${Date.now()}`,
                    overwrite: false,
                    resource_type: "auto", // Supports images and PDFs
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            )
            .end(fileBuffer);
    });
    return result.secure_url;
}

/**
 * Uploads a group avatar image to Cloudinary.
 * @param {Buffer} fileBuffer - The image file buffer.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export async function uploadGroupAvatar(fileBuffer) {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "campuszen/groups",
                    public_id: `group_${Date.now()}`,
                    overwrite: true,
                    transformation: [
                        {
                            width: 400,
                            height: 400,
                            crop: "fill",
                            gravity: "center",
                        },
                        { quality: "auto", fetch_format: "auto" },
                    ],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            )
            .end(fileBuffer);
    });
    return result.secure_url;
}

/**
 * Uploads a post image to Cloudinary.
 * @param {Buffer} fileBuffer - The image file buffer.
 * @param {string} userId - The user's ID for tracking.
 * @returns {Promise<string>} - The secure URL of the uploaded image.
 */
export async function uploadPostImage(fileBuffer, userId) {
    const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: "campuszen/posts",
                    public_id: `post_${userId}_${Date.now()}`,
                    overwrite: false,
                    resource_type: "image",
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            )
            .end(fileBuffer);
    });
    return result.secure_url;
}
