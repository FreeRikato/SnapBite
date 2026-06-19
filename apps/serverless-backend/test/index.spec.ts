import { createExecutionContext, env, SELF, waitOnExecutionContext } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import worker from '../src/index';

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;
const allowedOrigin = 'https://snapbite.aravinthan.space';

type UploadUrlResponse = {
key: string;
uploadUrl: string;
method: 'PUT';
headers: {
'Content-Type': string;
};
expiresIn: number;
maxBytes: number;
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

const uploadUrlResponse = await fetchWorker(
new IncomingRequest('http://example.com/upload-url', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Origin: allowedOrigin,
'X-User-Id': 'user@example.com',
},
body: JSON.stringify({
contentType: 'image/webp',
size: imageBytes.byteLength,
}),
}),
);

expect(uploadUrlResponse.status).toBe(201);
expect(uploadUrlResponse.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);

const upload = (await uploadUrlResponse.json()) as UploadUrlResponse;
expect(upload.key).toMatch(/^users\/user_example_com\/meals\/\d{4}-\d{2}-\d{2}\/[a-f0-9-]+\.webp$/);
expect(upload.method).toBe('PUT');
expect(upload.headers['Content-Type']).toBe('image/webp');
expect(upload.expiresIn).toBeGreaterThan(0);
expect(upload.maxBytes).toBeGreaterThanOrEqual(imageBytes.byteLength);

const putResponse = await SELF.fetch(upload.uploadUrl, {
method: 'PUT',
headers: upload.headers,
body: imageBytes,
});

expect(putResponse.status).toBe(201);
const httpEtag = putResponse.headers.get('ETag');
expect(httpEtag).toBeTruthy();

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
expect(imageResponse.headers.get('ETag')).toBe(httpEtag);
expect(new Uint8Array(await imageResponse.arrayBuffer())).toEqual(imageBytes);
});

it('rejects unsupported upload content types', async () => {
const response = await fetchWorker(
new IncomingRequest('http://example.com/upload-url', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
Origin: allowedOrigin,
},
body: JSON.stringify({
contentType: 'text/plain',
size: 11,
}),
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
