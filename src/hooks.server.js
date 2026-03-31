import { redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase';

// Route yang BOLEH diakses tanpa login
const PUBLIC_ROUTES = [
	'/login',
	'/registration',
	'/live-scores',
];

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const pathname = event.url.pathname;

	// Biarkan public routes lewat tanpa cek auth
	const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));

	// Semua API routes dihandle sendiri oleh backend, skip
	const isApiRoute = pathname.startsWith('/api/');

	if (isPublic || isApiRoute) {
		return resolve(event);
	}

	// Check auth using Supabase session
	const { data: { session } } = await supabase.auth.getSession();

	if (!session) {
		// Not authenticated - redirect to login
		redirect(302, `/login?redirect=${encodeURIComponent(pathname)}`);
	}

	// Authenticated - set security headers
	const response = await resolve(event);
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	return response;
}
