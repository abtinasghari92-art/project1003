export type AnalyticsChannel = 'TELEGRAM' | 'BALE';

export type AnalyticsEvent = {
  channel: AnalyticsChannel;
  name: string;
  path: string;
  issueId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

const SESSION_KEY = 'majara_analytics_session';

function randomId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getSessionId() {
  if (typeof window === 'undefined') return randomId();
  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = randomId();
  window.localStorage.setItem(SESSION_KEY, created);
  return created;
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  const apiUrl = (window as Window & { __MAJARA_API_URL?: string }).__MAJARA_API_URL ?? 'http://localhost:4000';
  const token = window.localStorage.getItem('majara_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  void fetch(`${apiUrl}/analytics/events`, {
    method: 'POST',
    headers,
    keepalive: true,
    body: JSON.stringify({ ...event, eventId: randomId(), sessionId: getSessionId() }),
  }).catch(() => undefined);
}
