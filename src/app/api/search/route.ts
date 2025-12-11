import { NextRequest, NextResponse } from 'next/server';
import { products, posts } from '@/data/corrin-data';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('q')?.toLowerCase() || '';

  if (!query) {
    return NextResponse.json({
      products: products.slice(0, 6),
      posts: posts.slice(0, 4),
    });
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
  );

  const filteredPosts = posts.filter(
    (p) =>
      p.caption.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
  );

  return NextResponse.json({
    products: filteredProducts.slice(0, 10),
    posts: filteredPosts.slice(0, 6),
  });
}

