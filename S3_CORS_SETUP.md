# AWS S3 CORS Configuration Guide

## Problem
When uploading files directly to S3 from the browser, you may encounter CORS errors:
```
Access to fetch at 'https://your-bucket.s3.region.amazonaws.com/...' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

## Solution: Configure S3 Bucket CORS

You need to configure your S3 bucket to allow cross-origin requests from your Vercel domain.

### Step 1: Navigate to Your S3 Bucket

1. Go to AWS Console → S3
2. Click on your bucket (`amazing-grace-church`)
3. Go to the **Permissions** tab
4. Scroll down to **Cross-origin resource sharing (CORS)**

### Step 2: Add CORS Configuration

Click **Edit** and paste the following JSON configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://amazing-graceapp.vercel.app",
            "https://*.vercel.app",
            "http://localhost:3000"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 3: Explanation

- **AllowedOrigins**: Your Vercel domain and localhost for development
- **AllowedMethods**: PUT for uploads, GET for downloads, etc.
- **AllowedHeaders**: Allows all headers (needed for presigned URLs)
- **ExposeHeaders**: Headers the browser can access
- **MaxAgeSeconds**: How long the browser caches the CORS preflight response

### Step 4: Save Changes

Click **Save changes** and wait a few seconds for the configuration to propagate.

### Step 5: Test Upload

After configuring CORS:
1. Clear your browser cache (Ctrl+Shift+R)
2. Try uploading a file again
3. The CORS error should be resolved

## Alternative: More Restrictive CORS (Recommended for Production)

For better security, you can restrict to specific domains:

```json
[
    {
        "AllowedHeaders": [
            "Content-Type",
            "Content-MD5",
            "x-amz-content-sha256",
            "x-amz-date",
            "x-amz-security-token",
            "Authorization"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "https://amazing-graceapp.vercel.app"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

## Troubleshooting

### If CORS errors persist:

1. **Verify the bucket name** matches your environment variable
2. **Check the region** matches your `AWS_REGION` environment variable
3. **Wait a few minutes** - CORS changes can take time to propagate
4. **Clear browser cache** - Browser may cache CORS preflight responses
5. **Check bucket policy** - Ensure bucket allows public/authenticated access

### Verify CORS Configuration

You can test CORS using curl:

```bash
curl -X OPTIONS \
  -H "Origin: https://amazing-graceapp.vercel.app" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  https://your-bucket.s3.region.amazonaws.com/
```

You should see `Access-Control-Allow-Origin` in the response headers.

## Important Notes

- **Security**: Only add domains you trust to `AllowedOrigins`
- **Propagation**: CORS changes can take 1-5 minutes to propagate
- **Browser Cache**: Clear browser cache after changing CORS settings
- **Development**: Add `http://localhost:3000` for local development

## Additional Resources

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [AWS S3 CORS Configuration Examples](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors-configuration-examples.html)
