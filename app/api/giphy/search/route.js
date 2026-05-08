import { NextResponse } from 'next/server';
import { searchGifs, formatGifData } from '@/lib/giphy';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const offset = parseInt(searchParams.get('offset')) || 0;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 25);

    if (!query.trim()) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const gifs = await searchGifs(query, offset, limit);
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
    console.error('Giphy search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search GIFs' },
      { status: 500 }
    );
  }
}
