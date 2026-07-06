import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPublishedBlog } from '@/lib/content';
import { SITE } from '@/lib/site';

export async function GET(context: { site: URL }) {
  const articles = getPublishedBlog(await getCollection('blog'));

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: article.data.date,
      link: `/writing/${article.id}`,
    })),
  });
}
