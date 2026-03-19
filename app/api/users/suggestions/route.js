import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const currentUser = await getCurrentUser(request);
    await connectDB();

    const query = currentUser ? { _id: { $ne: currentUser._id } } : {};
    
    // Suggest users (excluding self if logged in, limited to 5)
    const suggestions = await User.find(query)
      .limit(5)
      .select('name username avatar college')
      .lean();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Suggestions API error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
