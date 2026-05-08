import { NextResponse } from 'next/server';
import { getTrendingGifs, formatGifData } from '@/lib/giphy';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset')) || 0;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 25);

    const gifs = await getTrendingGifs(offset, limit);
    const formattedGifs = gifs.map(formatGifData);

    return NextResponse.json({
      gifs: formattedGifs,
      pagination: {
        offset,
        limit,
        total: gifs.length
      }
    });
  } catch (error) {
    console.error('Giphy trending API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending GIFs' },
      { status: 500 }
    );
  }
}
