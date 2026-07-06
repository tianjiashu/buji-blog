import type { CollectionEntry } from 'astro:content';

export type WorksEntry = CollectionEntry<'works'>;

export function isPublishedWorks(entry: WorksEntry): boolean {
  return entry.data.draft !== true;
}

export function sortWorksByDate(entries: WorksEntry[]): WorksEntry[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getPublishedWorks(entries: WorksEntry[]): WorksEntry[] {
  return sortWorksByDate(entries.filter(isPublishedWorks));
}

export function getStatusClass(status: string) {
  switch (status) {
    case '进行中':
      return 'works-card__status--active';
    case '已完成':
      return 'works-card__status--done';
    case '归档':
      return 'works-card__status--archived';
    default:
      return 'works-card__status--archived';
  }
}
