import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

// Route yang BOLEH diakses tanpa login
const PUBLIC_ROUTES = [
	'/login',
	'/register',
	'/registration',
	'/live-scores',
];

const JWT_SECRET = process.env.JWT_SECRET || 'yadika-cup-secret-key-2025';

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

	// Untuk semua route lain (admin dashboard), wajib ada valid JWT
	// Token dikirim via cookie (kalau ada) atau kita fallback ke redirect
	const authCookie = event.cookies.get('auth_token');

	if (authCookie) {
		try {
			jwt.verify(authCookie, JWT_SECRET);
			// Token valid, lanjut
			return resolve(event);
		} catch {
			// Token invalid/expired, hapus cookie dan redirect ke login
			event.cookies.delete('auth_token', { path: '/' });
			redirect(302, `/login?redirect=${encodeURIComponent(pathname)}`);
		}
	}

	// Tidak ada cookie — cek apakah ini SSR request atau client navigation
	// Karena auth pakai localStorage (client-only), kita tidak bisa verify di server
	// saat first load. Biarkan client-side guard di layout.svelte yang handle.
	// TAPI: kita set header untuk disable caching supaya gak bisa di-cache bypass.
	const response = await resolve(event);
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	return response;
}
