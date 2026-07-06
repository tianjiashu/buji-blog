import type { StoredMessage } from './types.js';

const METADATA_PREFIX = '<!-- buji-comment:';
const METADATA_SUFFIX = '-->';

interface CommentMetadata {
  articleSlug: string;
  authorName: string;
  createdAt: string;
  resonanceCount?: number;
  status?: string;
}

export function formatCommentBody(message: StoredMessage): string {
  const metadata: CommentMetadata = {
    articleSlug: message.articleSlug,
    authorName: message.authorName,
    createdAt: message.createdAt,
    resonanceCount: message.resonanceCount,
    status: 'visible',
  };

  return `${METADATA_PREFIX} ${JSON.stringify(metadata)} ${METADATA_SUFFIX}\n\n${message.content}`;
}

export function parseCommentBody(commentId: number, body: string | null): StoredMessage | null {
  if (!body?.startsWith(METADATA_PREFIX)) {
    return null;
  }

  const metadataEnd = body.indexOf(METADATA_SUFFIX);
  if (metadataEnd === -1) {
    return null;
  }

  const metadataText = body.slice(METADATA_PREFIX.length, metadataEnd).trim();
  const content = body.slice(metadataEnd + METADATA_SUFFIX.length).trim();

  try {
    const metadata = JSON.parse(metadataText) as CommentMetadata;
    if (metadata.status !== 'visible') {
      return null;
    }

    return {
      id: String(commentId),
      articleSlug: metadata.articleSlug,
      authorName: metadata.authorName,
      content,
      createdAt: metadata.createdAt,
      resonanceCount: Number(metadata.resonanceCount ?? 0),
    };
  } catch {
    return null;
  }
}
