import { createExecutionContext, env, SELF, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;
const allowedOrigin = 'https://snapbite.aravinthan.space';

type UploadResponse = {
	key: string;
	size: number;
	etag: string;
	httpEtag: string;
};

async function fetchWorker(request: Request): Promise<Response> {
	const ctx = createExecutionContext();
	const response = await worker.fetch(request, env, ctx);
	await waitOnExecutionContext(ctx);
	return response;
}

describe('meal photo worker', () => {
	it('returns CORS headers for allowed preflight origins', async () => {
		const response = await fetchWorker(
			new IncomingRequest('http://example.com/upload', {
				method: 'OPTIONS',
				headers: {
					Origin: allowedOrigin,
					'Access-Control-Request-Method': 'POST',
				},
			}),
		);

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
		expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
	});

	it('allows DELETE preflight from allowed origin (regression)', async () => {
		const response = await fetchWorker(
			new IncomingRequest('http://example.com/images', {
				method: 'OPTIONS',
				headers: {
					Origin: allowedOrigin,
					'Access-Control-Request-Method': 'DELETE',
					'Access-Control-Request-Headers': 'content-type,x-user-id,x-debug-id',
				},
			}),
		);

		expect(response.status).toBe(204);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
		const allowMethods = (response.headers.get('Access-Control-Allow-Methods') ?? '')
			.split(',')
			.map((s) => s.trim().toUpperCase());
		const allowHeaders = (response.headers.get('Access-Control-Allow-Headers') ?? '')
			.split(',')
			.map((s) => s.trim());
		expect(allowMethods).toContain('DELETE');
		expect(allowHeaders).toContain('X-Debug-Id');
	});


	it('rejects disallowed preflight origins', async () => {
		const response = await fetchWorker(
			new IncomingRequest('http://example.com/upload', {
				method: 'OPTIONS',
				headers: {
					Origin: 'https://example.net',
					'Access-Control-Request-Method': 'POST',
				},
			}),
		);

		expect(response.status).toBe(403);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
	});

	it('uploads and reads an image through R2', async () => {
		const imageBytes = new Uint8Array([1, 2, 3, 4]);
		const uploadResponse = await fetchWorker(
			new IncomingRequest('http://example.com/upload', {
				method: 'POST',
				headers: {
					'Content-Type': 'image/webp',
					Origin: allowedOrigin,
					'X-User-Id': 'user@example.com',
				},
				body: imageBytes,
			}),
		);

		expect(uploadResponse.status).toBe(201);
		expect(uploadResponse.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);

		const upload = (await uploadResponse.json()) as UploadResponse;
		expect(upload.size).toBe(imageBytes.byteLength);
		expect(upload.key).toMatch(/^users\/user_example_com\/meals\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.webp$/);
		expect(upload.etag).toBeTruthy();
		expect(upload.httpEtag).toBeTruthy();

		const imageResponse = await fetchWorker(
			new IncomingRequest(`http://example.com/image?key=${encodeURIComponent(upload.key)}`, {
				headers: {
					Origin: allowedOrigin,
				},
			}),
		);

		expect(imageResponse.status).toBe(200);
		expect(imageResponse.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
		expect(imageResponse.headers.get('Content-Type')).toBe('image/webp');
		expect(new Uint8Array(await imageResponse.arrayBuffer())).toEqual(imageBytes);
	});

	it('rejects unsupported upload content types', async () => {
		const response = await fetchWorker(
			new IncomingRequest('http://example.com/upload', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/plain',
					Origin: allowedOrigin,
				},
				body: 'not an image',
			}),
		);

		expect(response.status).toBe(415);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
	});

	it('rejects unsafe image keys', async () => {
		const response = await fetchWorker(
			new IncomingRequest('http://example.com/image?key=users/demo-user/secrets.txt', {
				headers: {
					Origin: allowedOrigin,
				},
			}),
		);

		expect(response.status).toBe(400);
	});

	it('routes integration requests through the worker', async () => {
		const response = await SELF.fetch('https://example.com/missing', {
			headers: {
				Origin: allowedOrigin,
			},
		});

		expect(response.status).toBe(404);
		expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
	});
});
