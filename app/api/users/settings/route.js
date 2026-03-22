import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { sanitizeMongoInput } from '@/lib/sanitize';

export async function PATCH(request) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = sanitizeMongoInput(body);

    if (!settings) {
      return NextResponse.json({ error: 'Settings data required' }, { status: 400 });
    }

    await connectDB();

    // In a real app, we might have a dedicated settings field in User model.
    // For now, we'll store them in a 'settings' field if it exists, or handle specific ones.
    // Since our User model doesn't have a 'settings' object yet, let's add it dynamically or update specific fields.
    
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: { settings: settings } },
      { new: true, runValidators: true, upsert: false }
    ).lean();

    return NextResponse.json({ 
      success: true, 
      settings: updatedUser.settings || settings 
    });

  } catch (error) {
    console.error('[Settings PATCH Error]', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
