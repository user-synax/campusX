import { NextResponse } from 'next/server';

export async function POST(request) {
  return NextResponse.json({ 
    message: 'This endpoint is deprecated. Use /api/posts/react instead.' 
  }, { status: 410 });
}
