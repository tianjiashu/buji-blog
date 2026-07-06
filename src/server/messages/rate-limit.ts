import { createHash } from 'node:crypto';
import type { Redis } from '@upstash/redis';
import { PublicApiError } from './errors.js';

const MESSAGE_WINDOW_SECONDS = 60;
const MESSAGE_WINDOW_LIMIT = 3;
const RESONANCE_WINDOW_SECONDS = 60 * 60 * 24;

export function getClientFingerprint(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-vercel-forwarded-for')?.trim();
  const ip = forwardedFor || forwardedHost || 'unknown';

  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

export async function assertMessageRateLimit(redis: Redis, fingerprint: string): Promise<void> {
  const key = `buji:ratelimit:messages:${fingerprint}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, MESSAGE_WINDOW_SECONDS);
  }

  if (count > MESSAGE_WINDOW_LIMIT) {
    throw new PublicApiError('留言太频繁了，稍等片刻再写吧。', 429);
  }
}

export async function claimResonance(redis: Redis, messageId: string, fingerprint: string): Promise<boolean> {
  const key = `buji:ratelimit:resonance:${messageId}:${fingerprint}`;
  const result = await redis.set(key, '1', {
    ex: RESONANCE_WINDOW_SECONDS,
    nx: true,
  });

  return result === 'OK';
}
