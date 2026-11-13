// Placeholder for `/pagefind/pagefind.js`, injected by the spectre integration.
// The real file is written by the `pagefind` postbuild step (which overwrites
// this one); in `astro dev` there is no index, so the search box gets this
// no-op instead of a failed import.
export async function GET() {
	return new Response('export const search = () => { return { results: [] } }', {
		headers: {
			'content-type': 'application/javascript',
		},
	});
}
