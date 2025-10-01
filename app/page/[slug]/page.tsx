import { fetchPublic } from "@/lib/api";

async function getPage(slug: string) {
  const data = await fetchPublic("/api/pages", {
    "filters[slug][$eq]": slug,
  });
  return data?.data?.[0];
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  const a = page?.attributes;
  
  if (!a) {
    return (
      <main style={{padding: 40, maxWidth: 900, margin: "0 auto"}}>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>요청하신 페이지가 존재하지 않습니다.</p>
      </main>
    );
  }

  return (
    <main style={{maxWidth: 900, margin: "40px auto", padding: "0 20px"}}>
      <h1 style={{fontSize: 28, fontWeight: 600, marginBottom: 24}}>{a.title}</h1>
      <article
        style={{marginTop: 24, lineHeight: 1.7}}
        dangerouslySetInnerHTML={{ __html: a.content }}
      />
    </main>
  );
}
