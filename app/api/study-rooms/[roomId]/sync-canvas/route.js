import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import StudyRoom from '@/models/StudyRoom';
import { validateObjectId } from '@/utils/validators';

async function createSystemMessage(roomId, content, user) {
  const RoomMessage = (await import('@/models/RoomMessage')).default;
  const senderId = user && user._id ? user._id : null;
  const message = await RoomMessage.create({
    roomId,
    sender: senderId,
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
      sender: { _id: senderId ? senderId.toString() : 'system', name: user?.name || 'System', avatar: user?.avatar || null },
      content: message.content,
      type: message.type,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (e) {
    console.error('[Sync-Canvas System Message Pusher]', e);
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

    const body = await request.json();
    const { snapshot, clear } = body;

    await connectDB();

    const room = await StudyRoom.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const userId = currentUser._id.toString();
    const isParticipant = room.participants.some(
      p => p.toString() === userId
    ) || room.creator.toString() === userId;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not a participant of this room' }, { status: 403 });
    }

    room.canvasSnapshot = snapshot;
    await room.save();
    
    if (clear) {
      await createSystemMessage(roomId, `${currentUser.name} cleared the whiteboard`, currentUser);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[StudyRoom SYNC-CANVAS]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to sync canvas' }, { status: 500 });
  }
}
