const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const TOKEN_KEY = 'majara_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new Error('ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.');
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    const raw = body.message;
    const message = Array.isArray(raw) ? raw.join('، ') : raw;
    if (response.status === 401) {
      throw new Error('نشست شما معتبر نیست. لطفاً Mini App را دوباره باز کنید.');
    }
    if (response.status === 403) {
      throw new Error('اجازه انجام این عملیات را ندارید.');
    }
    throw new Error(message ?? 'خطای سرور');
  }
  return response.json() as Promise<T>;
}
