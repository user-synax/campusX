import { v2 as cloudinary } from 'cloudinary' 
 
 cloudinary.config({ 
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
   api_key: process.env.CLOUDINARY_API_KEY, 
   api_secret: process.env.CLOUDINARY_API_SECRET, 
 }) 
 
 /**
  * Uploads an avatar image to Cloudinary.
  * @param {Buffer} fileBuffer - The image file buffer.
  * @param {string} userId - The user's ID for consistent public_id.
  * @returns {Promise<string>} - The secure URL of the uploaded image.
  */
 export async function uploadAvatar(fileBuffer, userId) {
   const result = await new Promise((resolve, reject) => { 
     cloudinary.uploader.upload_stream( 
       { 
         folder: 'campusx/avatars', 
         public_id: `user_${userId}`, 
         overwrite: true,  // same user always overwrites their old avatar 
         transformation: [ 
           { width: 400, height: 400, crop: 'fill', gravity: 'face' }, 
           { quality: 'auto', fetch_format: 'auto' } 
         ] 
       }, 
       (error, result) => { 
         if (error) reject(error) 
         else resolve(result) 
       } 
     ).end(fileBuffer) 
   }) 
   return result.secure_url 
 }
 
 /**
  * Deletes an avatar from Cloudinary.
  * @param {string} userId - The user's ID to identify the avatar.
  */
 export async function deleteAvatar(userId) {
   try { 
     await cloudinary.uploader.destroy(`campusx/avatars/user_${userId}`) 
   } catch (err) { 
     console.error('Avatar delete failed:', err.message) 
   } 
 }
