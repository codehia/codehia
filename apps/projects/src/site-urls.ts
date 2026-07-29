/**
 * Cross-app URLs, environment-aware.
 *
 * Unset env vars fall back to local dev ports (main 4321, blog 4322,
 * projects 4323, notes 4324). Real values are injected per environment
 * via Cloudflare Pages env vars (Production vs Preview scopes) —
 * never hardcode production URLs here.
 */
export const siteUrls = {
	main: import.meta.env.PUBLIC_URL_MAIN ?? 'http://localhost:4321',
	blog: import.meta.env.PUBLIC_URL_BLOG ?? 'http://localhost:4322',
	projects: import.meta.env.PUBLIC_URL_PROJECTS ?? 'http://localhost:4323',
	notes: import.meta.env.PUBLIC_URL_NOTES ?? 'http://localhost:4324',
};
