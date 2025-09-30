// lib/api.ts
import axios, { AxiosError } from "axios";

function normalizeUrl(base?: string, path: string = "") {
    if (!base) return null; // base 없으면 null 반환
    const b = base.endsWith("/") ? base.slice(0, -1) : base;
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${b}${p}`;
}

const BASE = process.env.NEXT_PUBLIC_CMS_URL; // 예: http://localhost:1337

export async function fetchPublic<T = unknown>(path: string, params: Record<string, unknown> = {}) {
    const url = normalizeUrl(BASE, path);
    if (!url) {
        // CMS가 없으면 더미 데이터 반환
        console.warn("CMS URL이 설정되지 않았습니다. 더미 데이터를 반환합니다.");
        return {
            data: []
        } as T;
    }

    try {
        const res = await axios.get<T>(url, {
            params,
            timeout: 10000,
            // 필요한 경우 인증/헤더 추가
            // headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CMS_TOKEN}` }
        });
        return res.data;
    } catch (err) {
        console.warn("CMS API 호출 실패:", err);
        // 오류가 발생해도 더미 데이터 반환
        return {
            data: []
        } as T;
    }
}
