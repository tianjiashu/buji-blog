export interface CommentMessage {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  resonanceCount: number;
}

export interface MessageListResult {
  configured: boolean;
  messages: CommentMessage[];
}

export async function fetchMessages(articleSlug: string): Promise<MessageListResult> {
  const response = await fetch(`/api/messages?articleSlug=${encodeURIComponent(articleSlug)}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? '留言暂时无法载入。');
  }

  return {
    configured: Boolean(result.configured),
    messages: Array.isArray(result.messages) ? result.messages : [],
  };
}

export async function submitMessage(articleSlug: string, formData: FormData): Promise<void> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      articleSlug,
      authorName: formData.get('authorName'),
      content: formData.get('content'),
      trap: formData.get('trap'),
    }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? '留言失败。');
  }
}

export async function submitResonance(messageId: string): Promise<number> {
  const response = await fetch('/api/messages/resonate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messageId }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? '共鸣失败。');
  }

  return Number(result.resonanceCount ?? 0);
}
