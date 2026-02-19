import Cookies from 'js-cookie';

export interface SearchItem {
  id: number;
  type: 'keyword' | 'competitor' | 'domain';
  name: string;
  score: number;
  status?: string;
  workspace_id: number;
  workspace_name?: string;
}

export interface SearchResult {
  keywords: SearchItem[];
  competitors: SearchItem[];
  domains: SearchItem[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function clientFetch<T>(endpoint: string): Promise<T> {
  const token = Cookies.get('access_token');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const json = await res.json();
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }
  return json as T;
}

export const searchApi = {
  async search(params: { q: string; types?: string[]; workspace?: number; limit?: number; all_workspaces?: boolean }): Promise<SearchResult> {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q);
    if (params.types) {
      params.types.forEach(t => searchParams.append('types[]', t));
    }
    if (params.workspace) searchParams.set('workspace', String(params.workspace));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.all_workspaces) searchParams.set('all_workspaces', 'true');
    return clientFetch<SearchResult>(`/search?${searchParams.toString()}`);
  },
};
