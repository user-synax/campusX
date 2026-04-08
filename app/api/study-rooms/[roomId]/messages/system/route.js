import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import RoomMessage from '@/models/RoomMessage';
import { validateObjectId } from '@/utils/validators';

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
    const content = String(body.content || '').trim().slice(0, 500);

    if (!content) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    await connectDB();

    const message = await RoomMessage.create({
      roomId,
      sender: currentUser._id,
      content,
      type: 'system',
    });

    await message.populate('sender', 'name avatar _id');

    const pusher = await import('pusher').then(p => p.default || p.pusher);
    if (pusher) {
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
          sender: {
            _id: message.sender._id.toString(),
            name: message.sender.name,
            avatar: message.sender.avatar,
          },
          content: message.content,
          type: message.type,
          createdAt: message.createdAt.toISOString(),
        });
      } catch (e) {
        console.error('[RoomMessages System Pusher]', e);
      }
    }

    return NextResponse.json({
      id: message._id,
      roomId: message.roomId,
      sender: {
        _id: message.sender._id,
        name: message.sender.name,
        avatar: message.sender.avatar,
      },
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error('[RoomMessages System POST]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to create system message' }, { status: 500 });
  }
}
