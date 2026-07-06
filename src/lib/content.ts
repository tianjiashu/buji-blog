import type { CollectionEntry } from 'astro:content';

export type BlogEntry = CollectionEntry<'blog'>;

export const BLOG_CATEGORIES = ['全部', '深耕', '随想', '碎片'] as const;

export function isPublishedBlog(entry: BlogEntry) {
  return entry.data.draft !== true;
}

export function sortBlogByDate(entries: BlogEntry[]) {
  return [...entries].sort((left, right) => {
    return right.data.date.getTime() - left.data.date.getTime();
  });
}

export function getPublishedBlog(entries: BlogEntry[]) {
  return sortBlogByDate(entries.filter(isPublishedBlog));
}

export function getAdjacentBlog(entries: BlogEntry[], currentId: string) {
  const index = entries.findIndex((entry) => entry.id === currentId);

  return {
    previous: index > 0 ? entries[index - 1] : undefined,
    next: index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined,
  };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatTimelineDate(date: Date) {
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function getReadingMinutes(body: string) {
  const chineseCharacters = body.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latinWords = body.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g)?.length ?? 0;
  const minutes = chineseCharacters / 400 + latinWords / 220;

  return Math.max(1, Math.ceil(minutes));
}

export function getYearDistance(date: Date, now = new Date()) {
  return Math.floor((now.getTime() - date.getTime()) / (365 * 24 * 60 * 60 * 1000));
}
