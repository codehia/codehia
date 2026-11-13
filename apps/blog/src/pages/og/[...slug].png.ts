import { getCollection } from 'astro:content';
import { ogResponse } from '@codehia/ui/og';
import type { APIRoute, GetStaticPaths } from 'astro';

export const getStaticPaths = (async () => {
	const posts = await getCollection('posts', (post) => post.data.draft !== true);
	return posts.map((post) => ({ params: { slug: post.id }, props: { data: post.data } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	ogResponse({
		title: props.data.title,
		date: props.data.createdAt,
		tags: props.data.tags?.map((tag: { id: string }) => tag.id),
	});
