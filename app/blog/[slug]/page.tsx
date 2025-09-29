// app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import { fetchPublic } from "@/lib/api";

type AnyPost = Record<string, any>;
const COLLECTION = process.env.NEXT_PUBLIC_CMS_COLLECTION || "posts";

function attrs(p: AnyPost) { return p?.attributes ?? p; } // v4/v5 겸용

export default async function BlogDetail({ params }: { params: { slug: string } }) {
  const s = params.slug;

  // 1) slug로 먼저 조회
  const bySlug = await fetchBySlug(s);
  if (bySlug) return render(bySlug);

  // 2) slug가 아니면 documentId로 조회 (v5 상세 경로)
  const byDocId = await fetchByDocumentId(s);
  if (byDocId) return render(byDocId);

  notFound();
}

async function fetchBySlug(slug: string) {
  try {
    const r = await fetchPublic<{ data: AnyPost[] }>(`/api/${COLLECTION}`, {
      "filters[slug][$eq]": slug,
      populate: "*",
      "pagination[pageSize]": 1
    });
    const item = Array.isArray(r?.data) ? r.data[0] : null;
    return item && attrs(item) ? item : null;
  } catch { return null; }
}

async function fetchByDocumentId(documentId: string) {
  try {
    const r = await fetchPublic<{ data: AnyPost }>(`/api/${COLLECTION}/${documentId}`, { populate: "*" });
    const item = r?.data ?? null;
    return item && attrs(item) ? item : null;
  } catch { return null; }
}

function render(item: AnyPost) {
  const a = attrs(item) || {};
  const title = a.title ?? "(제목 없음)";
  const excerpt = a.excerpt ?? "";
  return (
    <article style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>{title}</h1>
      {excerpt && <p style={{ marginTop: 12, color: "#666" }}>{excerpt}</p>}
    </article>
  );
}
