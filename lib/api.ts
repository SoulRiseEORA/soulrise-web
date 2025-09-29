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
        throw new Error(
            "환경변수 NEXT_PUBLIC_CMS_URL 이 비어있습니다. .env.local 에 설정하세요. 예) NEXT_PUBLIC_CMS_URL=http://localhost:1337"
        );
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
        const e = err as AxiosError<unknown>;
        const status = e.response?.status;
        const detail = typeof e.response?.data === "string" ? e.response?.data : JSON.stringify(e.response?.data);
        throw new Error(
            `fetchPublic 실패: GET ${url} → ${status ?? "NO_STATUS"}\n` +
            (detail ? `응답: ${detail}\n` : "") +
            (e.message ? `메시지: ${e.message}` : "")
        );
    }
}
