import { AwsClient } from 'aws4fetch';

const MAX_UPLOAD_BYTES = 1_500_000;
const PRESIGNED_UPLOAD_EXPIRES_SECONDS = 300;

const ALLOWED_IMAGE_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png']);

type JsonBody = Record<string, unknown>;

type R2SigningEnv = Env & {
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_BUCKET_NAME: string;
	R2_SECRET_ACCESS_KEY: string;
};

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
		'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Debug-Id',
		'Access-Control-Expose-Headers': 'ETag',
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

function getExtension(contentType: string): string {
	if (contentType === 'image/jpeg') {
		return 'jpg';
	}

	if (contentType === 'image/png') {
		return 'png';
	}

	return 'webp';
}

function getR2SigningEnv(env: Env): R2SigningEnv {
	return env as R2SigningEnv;
}

function hasR2SigningConfig(env: Env): env is R2SigningEnv {
	const signingEnv = getR2SigningEnv(env);
	return Boolean(
		signingEnv.R2_ACCOUNT_ID &&
			signingEnv.R2_ACCESS_KEY_ID &&
			signingEnv.R2_BUCKET_NAME &&
			signingEnv.R2_SECRET_ACCESS_KEY,
	);
}

function getR2S3Url(env: R2SigningEnv, key: string): string {
	const accountId = encodeURIComponent(env.R2_ACCOUNT_ID);
	const bucketName = encodeURIComponent(env.R2_BUCKET_NAME);
	const encodedKey = key
		.split('/')
		.map((part) => encodeURIComponent(part))
		.join('/');

	return `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${encodedKey}`;
}

function isSafeImageKey(key: string): boolean {
	return /^users\/[a-zA-Z0-9_-]+\/meals\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.(webp|jpg|png)$/.test(key);
}

function serializeError(error: unknown): JsonBody {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack,
		};
	}

	return {
		message: String(error),
	};
}

function logDelete(level: 'info' | 'warn' | 'error', event: string, data: JsonBody): void {
	const payload = {
		source: 'snapbite.worker',
		operation: 'delete-images',
		event,
		...data,
	};

	if (level === 'error') {
		console.error(payload);
	} else if (level === 'warn') {
		console.warn(payload);
	} else {
		console.log(payload);
	}
}

async function readJsonBody(request: Request): Promise<JsonBody | null> {
	try {
		const body = await request.json();
		return body && typeof body === 'object' && !Array.isArray(body) ? (body as JsonBody) : null;
	} catch {
		return null;
	}
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

		if (url.pathname === '/upload-url' && request.method === 'POST') {
			return handleCreateUploadUrl(request, env, corsOrigin ?? undefined);
		}

		if (url.pathname === '/upload' && request.method === 'PUT') {
			return handleUpload(request, env, corsOrigin ?? undefined);
		}

		if (url.pathname === '/image' && request.method === 'GET') {
			return handleGetImage(request, env, corsOrigin ?? undefined);
		}

		if (url.pathname === '/images' && request.method === 'DELETE') {
			return handleDeleteImages(request, env, corsOrigin ?? undefined);
		}

		return json({ error: 'Not found' }, 404, corsOrigin ?? undefined);
	},
} satisfies ExportedHandler<Env>;

async function handleCreateUploadUrl(request: Request, env: Env, corsOrigin?: string): Promise<Response> {
	const requestBody = await readJsonBody(request);

	if (!requestBody) {
		return json({ error: 'JSON body is required' }, 400, corsOrigin);
	}

	const contentType = typeof requestBody.contentType === 'string' ? requestBody.contentType.toLowerCase() : '';
	const size = typeof requestBody.size === 'number' ? requestBody.size : Number(requestBody.size);

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

	if (!Number.isFinite(size) || size <= 0) {
		return json({ error: 'Image size is required' }, 400, corsOrigin);
	}

	if (size > MAX_UPLOAD_BYTES) {
		return json(
			{
				error: 'Image is too large. Resize/compress before upload.',
				maxBytes: MAX_UPLOAD_BYTES,
			},
			413,
			corsOrigin,
		);
	}

	const rawUserId = request.headers.get('X-User-Id') || 'demo-user';
	const userId = safeId(rawUserId) || 'demo-user';
	const now = new Date();
	const dateFolder = now.toISOString().slice(0, 10);
	const key = `users/${userId}/meals/${dateFolder}/${crypto.randomUUID()}.${getExtension(contentType)}`;

	if (!hasR2SigningConfig(env)) {
		const directUploadUrl = new URL(request.url);
		directUploadUrl.pathname = '/upload';
		directUploadUrl.search = new URLSearchParams({ key }).toString();

		return json(
			{
				key,
				uploadUrl: directUploadUrl.toString(),
				method: 'PUT',
				headers: {
					'Content-Type': contentType,
				},
				expiresIn: PRESIGNED_UPLOAD_EXPIRES_SECONDS,
				maxBytes: MAX_UPLOAD_BYTES,
			},
			201,
			corsOrigin,
		);
	}

	const signingEnv = getR2SigningEnv(env);
	const uploadUrl = getR2S3Url(signingEnv, key);
	const signer = new AwsClient({
		accessKeyId: signingEnv.R2_ACCESS_KEY_ID,
		secretAccessKey: signingEnv.R2_SECRET_ACCESS_KEY,
		service: 's3',
		region: 'auto',
	});
	const signedRequest = await signer.sign(
		new Request(`${uploadUrl}?X-Amz-Expires=${PRESIGNED_UPLOAD_EXPIRES_SECONDS}`, {
			method: 'PUT',
			headers: {
				'Content-Type': contentType,
			},
		}),
		{ aws: { allHeaders: true, signQuery: true } },
	);

	return json(
		{
			key,
			uploadUrl: signedRequest.url,
			method: 'PUT',
			headers: {
				'Content-Type': contentType,
			},
			expiresIn: PRESIGNED_UPLOAD_EXPIRES_SECONDS,
			maxBytes: MAX_UPLOAD_BYTES,
		},
		201,
		corsOrigin,
	);
}

async function handleUpload(request: Request, env: Env, corsOrigin?: string): Promise<Response> {
	const url = new URL(request.url);
	const key = url.searchParams.get('key');
	const contentType = request.headers.get('Content-Type')?.toLowerCase() ?? '';
	const contentLength = Number(request.headers.get('Content-Length') ?? 0);

	if (!key) {
		return json({ error: 'Missing key' }, 400, corsOrigin);
	}

	if (!isSafeImageKey(key)) {
		return json({ error: 'Invalid image key' }, 400, corsOrigin);
	}

	if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
		return json({ error: 'Unsupported image type' }, 415, corsOrigin);
	}

	if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES) {
		return json(
			{
				error: 'Image is too large. Resize/compress before upload.',
				maxBytes: MAX_UPLOAD_BYTES,
			},
			413,
			corsOrigin,
		);
	}

	if (!request.body) {
		return json({ error: 'Image body is required' }, 400, corsOrigin);
	}

	const object = await env.MEAL_PHOTOS.put(key, request.body, {
		httpMetadata: {
			contentType,
		},
	});
	const headers = new Headers({
		ETag: object.httpEtag,
	});

	if (corsOrigin) {
		for (const [header, value] of buildCorsHeaders(corsOrigin)) {
			headers.set(header, value);
		}
	}

	return new Response(null, { status: 201, headers });
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
		'Cache-Control': 'private, max-age=31536000, immutable',
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

async function handleDeleteImages(request: Request, env: Env, corsOrigin?: string): Promise<Response> {
	const debugId = request.headers.get('X-Debug-Id') ?? crypto.randomUUID();
	const requestBody = await readJsonBody(request);

	if (!requestBody) {
		logDelete('warn', 'invalid-json-body', {
			debugId,
			hasCorsOrigin: Boolean(corsOrigin),
		});
		return json({ error: 'JSON body is required' }, 400, corsOrigin);
	}

	const keys = Array.isArray(requestBody.keys)
		? requestBody.keys
				.filter((key): key is string => typeof key === 'string')
				.map((key) => key.trim())
				.filter(Boolean)
		: [];
	const uniqueKeys = Array.from(new Set(keys));
	const rawUserId = request.headers.get('X-User-Id') || 'demo-user';
	const userId = safeId(rawUserId) || 'demo-user';

	logDelete('info', 'request-received', {
		debugId,
		rawKeyCount: keys.length,
		uniqueKeyCount: uniqueKeys.length,
		userId,
		keys: uniqueKeys,
	});

	if (uniqueKeys.length === 0) {
		logDelete('warn', 'no-keys', {
			debugId,
			userId,
		});
		return json({ error: 'At least one image key is required' }, 400, corsOrigin);
	}

	const invalidKey = uniqueKeys.find((key) => !isSafeImageKey(key));

	if (invalidKey) {
		logDelete('warn', 'invalid-key', {
			debugId,
			userId,
			invalidKey,
			keys: uniqueKeys,
		});
		return json({ error: 'Invalid image key' }, 400, corsOrigin);
	}

	const userPrefix = `users/${userId}/`;
	const unauthorizedKey = uniqueKeys.find((key) => !key.startsWith(userPrefix));

	if (unauthorizedKey) {
		logDelete('warn', 'unauthorized-key', {
			debugId,
			userId,
			userPrefix,
			unauthorizedKey,
			keys: uniqueKeys,
		});
		return json({ error: 'Image key is not owned by this user' }, 403, corsOrigin);
	}

	try {
		logDelete('info', 'r2-delete-started', {
			debugId,
			userId,
			keyCount: uniqueKeys.length,
			keys: uniqueKeys,
		});
		await env.MEAL_PHOTOS.delete(uniqueKeys);
		logDelete('info', 'r2-delete-complete', {
			debugId,
			userId,
			keyCount: uniqueKeys.length,
			keys: uniqueKeys,
		});
	} catch (error) {
		logDelete('error', 'r2-delete-failed', {
			debugId,
			userId,
			keyCount: uniqueKeys.length,
			keys: uniqueKeys,
			error: serializeError(error),
		});
		return json({ error: 'Failed to delete images' }, 500, corsOrigin);
	}

	return json({ deleted: uniqueKeys.length }, 200, corsOrigin);
}
