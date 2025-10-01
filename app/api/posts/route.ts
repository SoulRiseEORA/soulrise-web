import { NextResponse } from 'next/server';
import postsData from '../../../data/posts.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('filters[slug][$eq]');
    const populate = searchParams.get('populate');

    if (slug) {
      // 특정 슬러그의 포스트 찾기
      const post = postsData.find(p => p.slug === slug);
      if (post) {
        return NextResponse.json({
          data: [{
            id: post.id,
            attributes: {
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              publishedAt: post.publishedAt,
              featured: post.featured
            }
          }]
        });
      } else {
        return NextResponse.json({ data: [] });
      }
    }

    // 모든 포스트 반환
    const posts = postsData.map(post => ({
      id: post.id,
      attributes: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        publishedAt: post.publishedAt,
        featured: post.featured
      }
    }));

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Posts API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
