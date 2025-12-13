import { NextRequest, NextResponse } from 'next/server';

// Instagram oEmbed API to get thumbnail
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shortcode = searchParams.get('shortcode');

  if (!shortcode) {
    return NextResponse.json({ error: 'Missing shortcode' }, { status: 400 });
  }

  try {
    const instagramUrl = `https://www.instagram.com/p/${shortcode}/`;
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(instagramUrl)}&maxwidth=640`;

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ChatBot/1.0)',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch from Instagram');
    }

    const data = await response.json();

    return NextResponse.json({
      thumbnail_url: data.thumbnail_url,
      title: data.title,
      author_name: data.author_name,
    });
  } catch (error) {
    console.error('Instagram oEmbed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Instagram data' },
      { status: 500 }
    );
  }
}
