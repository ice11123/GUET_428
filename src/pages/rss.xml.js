import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { blogPostPath, withBase } from '../lib/urls';

export async function GET(context) {
	const posts = await getCollection('blog');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(withBase('/'), context.site).href,
		items: posts.map((post) => ({
			...post.data,
			link: blogPostPath(post.id),
		})),
	});
}
