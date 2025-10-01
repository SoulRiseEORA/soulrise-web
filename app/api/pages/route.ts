import { NextResponse } from 'next/server';
import pagesData from '../../../data/pages.json';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('filters[slug][$eq]');

    if (slug) {
      // 특정 슬러그의 페이지 찾기
      const page = pagesData.find(p => p.slug === slug);
      if (page) {
        return NextResponse.json({
          data: [{
            id: page.id,
            attributes: {
              title: page.title,
              slug: page.slug,
              content: page.content
            }
          }]
        });
      } else {
        return NextResponse.json({ data: [] });
      }
    }

    // 모든 페이지 반환
    const pages = pagesData.map(page => ({
      id: page.id,
      attributes: {
        title: page.title,
        slug: page.slug,
        content: page.content
      }
    }));

    return NextResponse.json({ data: pages });
  } catch (error) {
    console.error('Pages API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
