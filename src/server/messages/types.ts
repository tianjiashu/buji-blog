export interface PublicMessage {
  id: string;
  articleSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
  resonanceCount: number;
}

export interface StoredMessage {
  id: string;
  articleSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
  resonanceCount: number;
}

export interface CreateMessageInput {
  articleSlug: string;
  authorName?: string;
  content: string;
  trap?: string;
}
