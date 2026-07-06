import { Redis } from '@upstash/redis';
import type { PublicMessage, StoredMessage } from './types.js';
import type { ValidMessageInput } from './validation.js';

const MESSAGE_INDEX_PREFIX = 'buji:messages';
const MESSAGE_RECORD_PREFIX = 'buji:message';
const MESSAGE_RESONANCE_PREFIX = 'buji:message-resonance';
const MAX_MESSAGES_PER_ARTICLE = 80;

let cachedRedis: Redis | null | undefined;

export function getRedisClient(): Redis | null {
  if (cachedRedis !== undefined) {
    return cachedRedis;
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    cachedRedis = null;
    return cachedRedis;
  }

  cachedRedis = Redis.fromEnv();
  return cachedRedis;
}

export async function listMessages(redis: Redis, articleSlug: string): Promise<PublicMessage[]> {
  const ids = await redis.zrange<string[]>(messageIndexKey(articleSlug), 0, MAX_MESSAGES_PER_ARTICLE - 1, {
    rev: true,
  });

  if (ids.length === 0) {
    return [];
  }

  const records = await redis.mget<(StoredMessage | string | null)[]>(...ids.map(messageRecordKey));
  const counts = await redis.mget<(number | string | null)[]>(...ids.map(messageResonanceKey));

  return records
    .map((record, index) => toPublicMessage(record, counts[index]))
    .filter((message): message is PublicMessage => message !== null);
}

export async function createMessage(redis: Redis, input: ValidMessageInput): Promise<PublicMessage> {
  const createdAt = new Date().toISOString();
  const message: StoredMessage = {
    id: crypto.randomUUID(),
    articleSlug: input.articleSlug,
    authorName: input.authorName,
    content: input.content,
    createdAt,
  };

  await redis.set(messageRecordKey(message.id), message);
  await redis.zadd(messageIndexKey(message.articleSlug), {
    score: Date.parse(createdAt),
    member: message.id,
  });
  await redis.zremrangebyrank(messageIndexKey(message.articleSlug), 0, -MAX_MESSAGES_PER_ARTICLE - 1);

  return {
    ...message,
    resonanceCount: 0,
  };
}

export async function incrementResonance(redis: Redis, messageId: string): Promise<number> {
  return redis.incr(messageResonanceKey(messageId));
}

function toPublicMessage(record: StoredMessage | string | null, count: number | string | null): PublicMessage | null {
  const message = typeof record === 'string' ? parseStoredMessage(record) : record;

  if (!message) {
    return null;
  }

  return {
    ...message,
    resonanceCount: Number(count ?? 0),
  };
}

function parseStoredMessage(value: string): StoredMessage | null {
  try {
    return JSON.parse(value) as StoredMessage;
  } catch {
    return null;
  }
}

function messageIndexKey(articleSlug: string): string {
  return `${MESSAGE_INDEX_PREFIX}:${articleSlug}`;
}

function messageRecordKey(messageId: string): string {
  return `${MESSAGE_RECORD_PREFIX}:${messageId}`;
}

function messageResonanceKey(messageId: string): string {
  return `${MESSAGE_RESONANCE_PREFIX}:${messageId}`;
}
