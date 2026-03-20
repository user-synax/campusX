import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import User from '@/models/User'
import { getCurrentUser } from '@/lib/auth'
import { uploadAvatar } from '@/lib/cloudinary'

export async function POST(request) {
  try {
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar')

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Only JPG, PNG, and WebP images allowed' }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image must be under 5MB' }, { status: 400 })
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Cloudinary
    let avatarUrl
    try {
      avatarUrl = await uploadAvatar(buffer, currentUser._id)
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError)
      return NextResponse.json({ message: 'Upload failed, please try again' }, { status: 500 })
    }

    await connectDB()
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { avatar: avatarUrl },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Avatar updated successfully',
      avatarUrl 
    })
  } catch (error) {
    console.error('Avatar upload route error:', error)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
