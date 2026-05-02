export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
}

export async function getServerJson<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    cache: 'no-store',
    ...init
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}`);
  }

  return (await response.json()) as T;
}
