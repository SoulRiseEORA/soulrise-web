export const dynamic = "force-dynamic";

import { fetchPublic } from "@/lib/api";
import { notFound } from "next/navigation";

type Post = {
    documentId: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: unknown;
};

const COLLECTION = process.env.NEXT_PUBLIC_CMS_COLLECTION || "posts"; // 필요 시 articles 등

export default async function BlogDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const s = slug;

    // 1) slug로 조회
    const bySlug = await fetchBySlug(s);
    if (bySlug) return render(bySlug);

    // 2) documentId로 조회 (v5 상세 경로)
    const byDoc = await fetchByDocumentId(s);
    if (byDoc) return render(byDoc);

    notFound();
}

async function fetchBySlug(slug: string) {
    try {
        const r = await fetchPublic<{ data: Post[] }>(`/api/${COLLECTION}`, {
            "filters[slug][$eq]": slug,
            populate: "*",
            "pagination[pageSize]": 1,
        });
        return Array.isArray(r?.data) ? r.data[0] ?? null : null;
    } catch { return null; }
}

async function fetchByDocumentId(documentId: string) {
    try {
        const r = await fetchPublic<{ data: Post }>(`/api/${COLLECTION}/${documentId}`, { populate: "*" });
        return r?.data ?? null;
    } catch { return null; }
}

function render(post: Post) {
    const title = post.title ?? "(제목 없음)";
    const excerpt = post.excerpt ?? "";
    return (
        <article style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            <h1 style={{ fontSize: 32, fontWeight: 700 }}>{title}</h1>
            {excerpt && <p style={{ marginTop: 12, color: "#666" }}>{excerpt}</p>}
            {/* content가 RichText(JSON)라면 이후 렌더러를 붙이세요 */}
        </article>
    );
}
