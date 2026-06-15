const MAX_UPLOAD_BYTES = 1_500_000;

const ALLOWED_IMAGE_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png']);

type JsonBody = Record<string, unknown>;

type BodyReadResult = { ok: true; body: Uint8Array } | { ok: false; reason: 'empty' | 'too-large' };

function parseAllowedOrigins(env: Env): string[] {
	return env.ALLOWED_ORIGINS.split(',')
		.map((origin) => origin.trim())
		.filter(Boolean);
}

function getAllowedCorsOrigin(request: Request, env: Env): string | null {
	const requestOrigin = request.headers.get('Origin');

	if (!requestOrigin) {
		return null;
	}

	return parseAllowedOrigins(env).includes(requestOrigin) ? requestOrigin : null;
}

function buildCorsHeaders(origin: string): Headers {
	return new Headers({
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
		'Access-Control-Max-Age': '86400',
		Vary: 'Origin',
	});
}

function json(data: JsonBody, status = 200, corsOrigin?: string): Response {
	const headers = new Headers({
		'Content-Type': 'application/json',
	});

	if (corsOrigin) {
		for (const [key, value] of buildCorsHeaders(corsOrigin)) {
			headers.set(key, value);
		}
	}

	return new Response(JSON.stringify(data), {
		status,
		headers,
	});
}

function safeId(value: string): string {
	return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

function getNormalizedContentType(request: Request): string {
	return request.headers.get('Content-Type')?.split(';')[0]?.trim().toLowerCase() ?? '';
}

function getExtension(contentType: string): string {
	if (contentType === 'image/jpeg') {
		return 'jpg';
	}

	if (contentType === 'image/png') {
		return 'png';
	}

	return 'webp';
}

function isRequestTooLarge(request: Request): boolean {
	const contentLength = request.headers.get('Content-Length');

	if (!contentLength) {
		return false;
	}

	const bytes = Number(contentLength);
	return Number.isFinite(bytes) && bytes > MAX_UPLOAD_BYTES;
}

function isSafeImageKey(key: string): boolean {
	return /^users\/[a-zA-Z0-9_-]+\/meals\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.(webp|jpg|png)$/.test(key);
}

async function readUploadBody(request: Request): Promise<BodyReadResult> {
	if (!request.body) {
		return { ok: false, reason: 'empty' };
	}

	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let totalBytes = 0;

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		totalBytes += value.byteLength;

		if (totalBytes > MAX_UPLOAD_BYTES) {
			await reader.cancel();
			return { ok: false, reason: 'too-large' };
		}

		chunks.push(value);
	}

	if (totalBytes === 0) {
		return { ok: false, reason: 'empty' };
	}

	const body = new Uint8Array(totalBytes);
	let offset = 0;

	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}

	return { ok: true, body };
}

export default {
	async fetch(request, env): Promise<Response> {
		const url = new URL(request.url);
		const corsOrigin = getAllowedCorsOrigin(request, env);

		if (request.method === 'OPTIONS') {
			if (!corsOrigin) {
				return new Response(null, {
					status: 403,
					headers: new Headers({ Vary: 'Origin' }),
				});
			}

			return new Response(null, {
				status: 204,
				headers: buildCorsHeaders(corsOrigin),
			});
		}

		if (request.headers.has('Origin') && !corsOrigin) {
			return json({ error: 'Origin is not allowed' }, 403);
		}

		if (url.pathname === '/upload' && request.method === 'POST') {
			return handleUpload(request, env, corsOrigin ?? undefined);
		}

		if (url.pathname === '/image' && request.method === 'GET') {
			return handleGetImage(request, env, corsOrigin ?? undefined);
		}

		return json({ error: 'Not found' }, 404, corsOrigin ?? undefined);
	},
} satisfies ExportedHandler<Env>;

async function handleUpload(request: Request, env: Env, corsOrigin?: string): Promise<Response> {
	const contentType = getNormalizedContentType(request);

	if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
		return json(
			{
				error: 'Unsupported image type',
				allowed: Array.from(ALLOWED_IMAGE_TYPES),
			},
			415,
			corsOrigin,
		);
	}

	if (isRequestTooLarge(request)) {
		return json(
			{
				error: 'Image is too large. Resize/compress before upload.',
				maxBytes: MAX_UPLOAD_BYTES,
			},
			413,
			corsOrigin,
		);
	}

	const readResult = await readUploadBody(request);

	if (!readResult.ok && readResult.reason === 'empty') {
		return json({ error: 'Image body is required' }, 400, corsOrigin);
	}

	if (!readResult.ok && readResult.reason === 'too-large') {
		return json(
			{
				error: 'Image is too large. Resize/compress before upload.',
				maxBytes: MAX_UPLOAD_BYTES,
			},
			413,
			corsOrigin,
		);
	}

	if (!readResult.ok) {
		return json({ error: 'Upload failed' }, 500, corsOrigin);
	}

	const body = readResult.body;

	const rawUserId = request.headers.get('X-User-Id') || 'demo-user';
	const userId = safeId(rawUserId) || 'demo-user';
	const now = new Date();
	const dateFolder = now.toISOString().slice(0, 10);
	const key = `users/${userId}/meals/${dateFolder}/${crypto.randomUUID()}.${getExtension(contentType)}`;

	const object = await env.MEAL_PHOTOS.put(key, body, {
		httpMetadata: {
			contentType,
			cacheControl: 'private, max-age=31536000',
		},
		customMetadata: {
			uploadedAt: now.toISOString(),
			app: 'snapbite',
		},
	});

	if (!object) {
		return json({ error: 'Upload failed' }, 500, corsOrigin);
	}

	return json(
		{
			key: object.key,
			size: object.size,
			etag: object.etag,
			httpEtag: object.httpEtag,
		},
		201,
		corsOrigin,
	);
}

async function handleGetImage(request: Request, env: Env, corsOrigin?: string): Promise<Response> {
	const url = new URL(request.url);
	const key = url.searchParams.get('key');

	if (!key) {
		return json({ error: 'Missing key' }, 400, corsOrigin);
	}

	if (!isSafeImageKey(key)) {
		return json({ error: 'Invalid image key' }, 400, corsOrigin);
	}

	const object = await env.MEAL_PHOTOS.get(key);

	if (!object) {
		return json({ error: 'Image not found' }, 404, corsOrigin);
	}

	const headers = new Headers({
		'Cache-Control': 'private, max-age=3600',
		ETag: object.httpEtag,
	});

	if (corsOrigin) {
		for (const [header, value] of buildCorsHeaders(corsOrigin)) {
			headers.set(header, value);
		}
	}

	object.writeHttpMetadata(headers);

	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'image/webp');
	}

	return new Response(object.body, { headers });
}
