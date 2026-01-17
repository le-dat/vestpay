
interface PasskeySession {
  timestamp: number;
  userAddress: string;
  lastAuth: number;
}

const SESSION_DURATION = 5 * 60 * 1000; // 5 minutes
const AUTH_CACHE_KEY = 'passkey_session';

export function setPasskeySession(userAddress: string): void {
  const session: PasskeySession = {
    timestamp: Date.now(),
    userAddress,
    lastAuth: Date.now(),
  };
  sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
}

export function getPasskeySession(): PasskeySession | null {
  const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
  if (!cached) return null;

  try {
    const session: PasskeySession = JSON.parse(cached);
    const now = Date.now();

    // Check if session is still valid
    if (now - session.timestamp > SESSION_DURATION) {
      clearPasskeySession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function updateLastAuth(): void {
  const session = getPasskeySession();
  if (session) {
    session.lastAuth = Date.now();
    sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(session));
  }
}

export function clearPasskeySession(): void {
  sessionStorage.removeItem(AUTH_CACHE_KEY);
}

export function isRecentlyAuthenticated(withinMs: number = 30000): boolean {
  const session = getPasskeySession();
  if (!session) return false;

  const timeSinceLastAuth = Date.now() - session.lastAuth;
  return timeSinceLastAuth < withinMs;
}
