const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export interface ApiError extends Error {
  status?: number;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error: ApiError = new Error(body.error || 'Request failed');
    error.status = res.status;
    throw error;
  }

  return res.json() as Promise<T>;
}

// Generic fetcher helper for SWR
export function swrFetcher<T>(url: string) {
  return apiFetch<T>(url);
}
