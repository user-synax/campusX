import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import StudyRoom from '@/models/StudyRoom';
import { validateObjectId } from '@/utils/validators';

async function createSystemMessage(roomId, content) {
  const RoomMessage = (await import('@/models/RoomMessage')).default;
  const message = await RoomMessage.create({
    roomId,
    sender: 'system',
    content,
    type: 'system',
  });
  
  try {
    const Pusher = require('pusher');
    const pusherInstance = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      useTLS: true,
    });
    pusherInstance.trigger(`private-room-${roomId}`, 'new-room-message', {
      id: message._id.toString(),
      roomId: message.roomId.toString(),
      sender: { _id: 'system', name: 'System' },
      content: message.content,
      type: message.type,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (e) {
    console.error('[Leave System Message Pusher]', e);
  }
  
  return message;
}

export async function POST(request, { params }) {
  const { roomId } = await params;
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!validateObjectId(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    await connectDB();

    const room = await StudyRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const userId = currentUser._id.toString();
    room.participants = room.participants.filter(
      p => p.toString() !== userId
    );
    await room.save();
    await createSystemMessage(roomId, `${currentUser.name} left the room`);

    await room.populate('creator', 'name avatar username');
    await room.populate('participants', 'name avatar username');

    return NextResponse.json({ room });
  } catch (error) {
    console.error('[StudyRoom LEAVE]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
