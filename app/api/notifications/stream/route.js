import { verifyToken } from '@/lib/auth';
import { addSubscriber, removeSubscriber } from '@/lib/notificationStream';

export async function GET(request) { 
  const token = request.cookies.get('campusx_token')?.value;
  if (!token) return new Response('Unauthorized', { status: 401 });

  const decoded = verifyToken(token);
  if (!decoded) return new Response('Invalid token', { status: 401 });

  const userId = decoded.userId;

  let cleanup;
  const stream = new ReadableStream({ 
    start(controller) { 
      // Register subscriber 
      addSubscriber(userId, controller);

      // Send initial ping to confirm connection 
      const ping = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(new TextEncoder().encode(ping));

      // Keep-alive ping every 25 seconds (prevent timeout) 
      const keepAlive = setInterval(() => { 
        try { 
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch { 
          clearInterval(keepAlive);
        } 
      }, 25000);

      cleanup = () => { 
        clearInterval(keepAlive);
        removeSubscriber(userId);
      };
    }, 
    cancel() { 
      cleanup?.();
    } 
  });

  // Handle client disconnect 
  request.signal.addEventListener('abort', () => cleanup?.());

  return new Response(stream, { 
    headers: { 
      'Content-Type': 'text/event-stream', 
      'Cache-Control': 'no-cache, no-transform', 
      'Connection': 'keep-alive', 
      'X-Accel-Buffering': 'no'  // Disable Nginx buffering 
    } 
  });
}
