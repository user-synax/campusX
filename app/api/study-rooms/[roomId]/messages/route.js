import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import connectDB from '@/lib/db';
import RoomMessage from '@/models/RoomMessage';
import User from '@/models/User';
import { validateObjectId } from '@/utils/validators';

async function sanitize(content) {
  return String(content).replace(/<[^>]*>/g, '').trim();
}

export async function GET(request, { params }) {
  const { roomId } = await params;
  
  try {
    if (!validateObjectId(roomId)) {
      return NextResponse.json({ error: 'Invalid room ID' }, { status: 400 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');

    let query = RoomMessage.find({ roomId }).sort({ createdAt: 1 }).limit(50).lean();
    
    if (before) {
      query = RoomMessage.find({ roomId, _id: { $lt: before } })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();
    }

    const messages = await query;

    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.sender).select('name avatar _id').lean();
        return {
          id: msg._id,
          roomId: msg.roomId,
          sender: sender ? { _id: sender._id, name: sender.name, avatar: sender.avatar } : null,
          content: msg.content,
          type: msg.type,
          createdAt: msg.createdAt,
        };
      })
    );

    return NextResponse.json(populatedMessages);
  } catch (error) {
    console.error('[RoomMessages GET]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
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
    const content = await sanitize((body.content || '').trim());

    if (!content) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 });
    }

    await connectDB();

    const message = await RoomMessage.create({
      roomId,
      sender: currentUser._id,
      content,
      type: 'text',
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
        console.error('[RoomMessages Pusher]', e);
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
    console.error('[RoomMessages POST]', error.stack || error.message);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
