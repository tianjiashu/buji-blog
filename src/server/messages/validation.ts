import type { CreateMessageInput } from './types.js';
import { PublicApiError } from './errors.js';

export const MESSAGE_LIMITS = {
  authorNameMax: 24,
  contentMin: 2,
  contentMax: 600,
  slugMax: 120,
};

export interface ValidMessageInput {
  articleSlug: string;
  authorName: string;
  content: string;
}

export interface ResonanceInput {
  messageId: string;
}

export function validateArticleSlug(value: unknown): string {
  if (typeof value !== 'string') {
    throw new PublicApiError('缺少文章标识。');
  }

  const articleSlug = value.trim();
  if (!articleSlug || articleSlug.length > MESSAGE_LIMITS.slugMax || !/^[a-z0-9/_-]+$/i.test(articleSlug)) {
    throw new PublicApiError('文章标识无效。');
  }

  return articleSlug;
}

export function validateCreateMessage(input: CreateMessageInput): ValidMessageInput {
  if (input.trap) {
    throw new PublicApiError('留言未通过校验。');
  }

  return {
    articleSlug: validateArticleSlug(input.articleSlug),
    authorName: normalizeAuthorName(input.authorName),
    content: normalizeContent(input.content),
  };
}

export function validateResonanceInput(input: { messageId?: unknown }): ResonanceInput {
  if (typeof input.messageId !== 'string' || !/^\d+$/.test(input.messageId)) {
    throw new PublicApiError('留言标识无效。');
  }

  return {
    messageId: input.messageId,
  };
}

function normalizeAuthorName(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    return '匿名读者';
  }

  const authorName = value.trim();
  if (authorName.length > MESSAGE_LIMITS.authorNameMax) {
    throw new PublicApiError(`署名不能超过 ${MESSAGE_LIMITS.authorNameMax} 个字符。`);
  }

  return authorName;
}

function normalizeContent(value: unknown): string {
  if (typeof value !== 'string') {
    throw new PublicApiError('请写下留言内容。');
  }

  const content = value.trim().replace(/\r\n?/g, '\n');
  if (content.length < MESSAGE_LIMITS.contentMin) {
    throw new PublicApiError(`留言至少需要 ${MESSAGE_LIMITS.contentMin} 个字符。`);
  }

  if (content.length > MESSAGE_LIMITS.contentMax) {
    throw new PublicApiError(`留言不能超过 ${MESSAGE_LIMITS.contentMax} 个字符。`);
  }

  return content;
}
