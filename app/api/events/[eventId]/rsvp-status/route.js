import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';
import { getCurrentUser } from '@/lib/auth';
import { validateObjectId } from '@/utils/validators';

// GET /api/events/[eventId]/rsvp-status - Check if current user has RSVPed
export async function GET(request, { params }) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ rsvped: false });
    }

    const { eventId } = await params;
    if (!validateObjectId(eventId)) {
      return NextResponse.json({ message: 'Invalid Event ID' }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId).select('rsvps').lean();
    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const isRsvped = event.rsvps?.some(id => id.toString() === currentUser._id.toString()) || false;

    return NextResponse.json({ rsvped: isRsvped });
  } catch (error) {
    console.error('RSVP status check error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
