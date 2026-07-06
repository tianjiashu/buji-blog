import { createHash } from 'node:crypto';
import { PublicApiError } from './errors.js';

const MESSAGE_WINDOW_MS = 60_000;
const MESSAGE_WINDOW_LIMIT = 3;
const RESONANCE_WINDOW_MS = 24 * 60 * 60 * 1_000;

interface WindowCounter {
  count: number;
  expiresAt: number;
}

const messageWindows = new Map<string, WindowCounter>();
const resonanceClaims = new Map<string, number>();

export function getClientFingerprint(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-vercel-forwarded-for')?.trim();
  const userAgent = request.headers.get('user-agent')?.trim() || 'unknown';
  const ip = forwardedFor || forwardedHost || 'unknown';

  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex').slice(0, 32);
}

export function assertMessageRateLimit(fingerprint: string): void {
  const count = incrementWindow(messageWindows, fingerprint, MESSAGE_WINDOW_MS);

  if (count > MESSAGE_WINDOW_LIMIT) {
    throw new PublicApiError('留言太频繁了，稍等片刻再写吧。', 429);
  }
}

export function claimResonance(messageId: string, fingerprint: string): boolean {
  const key = `${messageId}:${fingerprint}`;
  const now = Date.now();
  const expiresAt = resonanceClaims.get(key);

  if (expiresAt && expiresAt > now) {
    return false;
  }

  resonanceClaims.set(key, now + RESONANCE_WINDOW_MS);
  pruneExpired(resonanceClaims, now);
  return true;
}

export function releaseResonance(messageId: string, fingerprint: string): void {
  resonanceClaims.delete(`${messageId}:${fingerprint}`);
}

function incrementWindow(store: Map<string, WindowCounter>, key: string, windowMs: number): number {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return 1;
  }

  current.count += 1;
  return current.count;
}

function pruneExpired(store: Map<string, number>, now: number): void {
  for (const [key, expiresAt] of store) {
    if (expiresAt <= now) {
      store.delete(key);
    }
  }
}
