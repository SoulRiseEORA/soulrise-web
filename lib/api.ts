// lib/api.ts
import axios, { AxiosError } from "axios";

function normalizeUrl(base?: string, path: string = "") {
    if (!base) return null; // base 없으면 null 반환
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
}

const BASE = process.env.NEXT_PUBLIC_CMS_URL || ''; // 로컬 API 사용

export async function fetchPublic<T = unknown>(path: string, params: Record<string, unknown> = {}) {
    // 로컬 API 사용 (자체 Next.js API 라우트)
    const baseUrl = BASE || (typeof window !== 'undefined' ? window.location.origin : '');
    const url = normalizeUrl(baseUrl, path);
    
    if (!url) {
        console.warn("API URL을 생성할 수 없습니다.");
        return { data: [] } as T;
    }

    try {
        const res = await axios.get<T>(url, {
            params,
            timeout: 10000,
        });
        return res.data;
    } catch (err) {
        console.warn("API 호출 실패:", err);
        return { data: [] } as T;
    }
}
