export const dynamic = "force-dynamic";

import { fetchPublic } from "@/lib/api";
import Link from "next/link";

type Post = {
    id: number;
    documentId: string;
    title?: string;
    slug?: string;
    excerpt?: string;
};

export default async function BlogList() {
    const res = await fetchPublic<{ data: Post[] }>("/api/posts", {
        "pagination[pageSize]": 20,
        // 필요 시: "fields[0]": "title", "fields[1]": "slug", "fields[2]": "excerpt",
        // "populate": "*" // 이미지/관계 필요할 때만
    });

    const posts = Array.isArray(res?.data) ? res.data : [];
    if (!posts.length) {
        return (
            <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
                <h1 style={{ fontSize: 28, fontWeight: 600 }}>블로그 & 뉴스</h1>
                <div style={{ marginTop: 24, color: "#666" }}>게시글이 없습니다.</div>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
            <h1 style={{ fontSize: 28, fontWeight: 600 }}>블로그 & 뉴스</h1>
            <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
                {posts.map((p, i) => {
                    const link = (p.slug && p.slug.trim()) || p.documentId; // slug 우선, 없으면 documentId
                    return (
                        <Link
                            key={`${link}_${i}`}
                            href={`/blog/${encodeURIComponent(link)}`}
                            style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, display: "block" }}
                        >
                            <div style={{ fontSize: 20, fontWeight: 500 }}>{p.title ?? "(제목 없음)"}</div>
                            <div style={{ marginTop: 8, color: "#666" }}>{p.excerpt ?? ""}</div>
                        </Link>
                    );
                })}
            </div>
        </main>
    );
}
