// app/blog/page.tsx
import Link from "next/link";
import { fetchPublic } from "@/lib/api";

type AnyPost = Record<string, any>;

function pick<T = any>(obj: AnyPost | undefined, ...keys: string[]): T | undefined {
  if (!obj) return undefined;
  for (const k of keys) if (obj[k] != null) return obj[k] as T;
  return undefined;
}

function normalizePost(p: AnyPost) {
  const a = p.attributes ?? p;                 // v4/v5 겸용
  const title =
    pick<string>(a, "title", "Title", "name", "Name", "headline", "Headline") ?? "(제목 없음)";
  const slug = pick<string>(a, "slug", "Slug")?.toString().trim();
  const documentId = pick<string>(p, "documentId") || pick<string>(a, "documentId") || "";
  // 링크 우선순위: slug → documentId
  const linkId = slug || documentId;

  return { title, slug, documentId, linkId };
}

export default async function BlogList() {
  const res = await fetchPublic<{ data: AnyPost[] }>("/api/posts", {
    // 필요시 fields/populate 추가
    "pagination[pageSize]": 50,
    // "populate": "*"
  });
  const raw = Array.isArray(res?.data) ? res.data : [];
  const items = raw.map(normalizePost).filter(x => !!x.linkId);

  return (
    <main style={{maxWidth:900, margin:"40px auto", padding:"0 20px"}}>
      <h1 style={{fontSize:28, fontWeight:600}}>블로그 & 뉴스</h1>
      <div style={{marginTop:24, display:"grid", gap:16}}>
        {items.map((p, i) => (
          <Link
            key={p.linkId + "_" + i}
            href={`/blog/${encodeURIComponent(p.linkId)}`}
            style={{padding:16, border:"1px solid #eee", borderRadius:12, display:"block"}}
          >
            <div style={{fontSize:20, fontWeight:500}}>{p.title}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
