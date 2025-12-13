import { NextRequest, NextResponse } from 'next/server';

// Get Instagram image URL from shortcode
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shortcode = searchParams.get('shortcode');

  if (!shortcode) {
    return NextResponse.json({ error: 'Missing shortcode' }, { status: 400 });
  }

  try {
    // Try Instagram oEmbed first (official API)
    const instagramUrl = `https://www.instagram.com/p/${shortcode}/`;
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(instagramUrl)}&maxwidth=640`;

    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (response.ok) {
      const data = await response.json();
      if (data.thumbnail_url) {
        return NextResponse.json({
          thumbnail_url: data.thumbnail_url,
          title: data.title,
          author_name: data.author_name,
        });
      }
    }

    // Fallback: return Instagram embed URL (works for public posts)
    // The frontend will use this as an iframe or direct link
    return NextResponse.json({
      thumbnail_url: null,
      embed_url: `https://www.instagram.com/p/${shortcode}/embed`,
      post_url: instagramUrl,
    });
  } catch (error) {
    console.error('Instagram API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Instagram data',
        post_url: `https://www.instagram.com/p/${shortcode}/`
      },
      { status: 500 }
    );
  }
}
