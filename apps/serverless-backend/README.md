# SnapBite Serverless Backend

This Worker stores meal photos in Cloudflare R2.

## Presigned Uploads

The frontend uploads photos with this flow:

1. `POST /upload-url` to this Worker with `{ contentType, size }`.
2. The Worker validates type and size, creates an R2 key, and returns a short-lived signed `PUT` URL.
3. The browser uploads the file directly to R2 with the returned URL and headers.
4. Images are read through `GET /image?key=...`.

Required Worker configuration:

- `MEAL_PHOTOS`: R2 bucket binding.
- `R2_ACCOUNT_ID`: Cloudflare account ID.
- `R2_BUCKET_NAME`: R2 bucket name, currently `snapbite`.
- `R2_ACCESS_KEY_ID`: R2 S3 API access key.
- `R2_SECRET_ACCESS_KEY`: R2 S3 API secret key.

Use Wrangler secrets for the access key values:

```sh
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
```

For browser uploads to the signed R2 URL, configure R2 bucket CORS to allow `PUT` from the frontend origin with `Content-Type`.
