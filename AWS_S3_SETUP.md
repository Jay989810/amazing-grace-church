# AWS S3 Setup Guide

## Step 1: Create AWS Account
1. Go to [AWS Console](https://aws.amazon.com/console/)
2. Sign up for an AWS account (free tier available)
3. Complete account verification

## Step 2: Create S3 Bucket
1. Go to S3 service in AWS Console
2. Click "Create bucket"
3. Choose a unique bucket name (e.g., `amazing-grace-church-files`)
4. Select region (e.g., `us-east-1`)
5. **Important**: 
   - Uncheck "Block all public access" and acknowledge
   - **ACLs disabled (recommended)**: Leave "Block all public access" settings as default (which blocks ACLs)
   - We'll use bucket policy instead of ACLs for better security
6. Click "Create bucket"

## Step 3: Configure Bucket Permissions
1. Go to your bucket → Permissions tab
2. Scroll to "Bucket Policy" and add this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name.

## Step 4: Create IAM User
1. Go to IAM service in AWS Console
2. Click "Users" → "Create user"
3. Username: `amazing-grace-s3-user`
4. Attach policies directly → "Create policy"
5. Use this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
        }
    ]
}
```

6. Name the policy: `AmazingGraceS3Policy`
7. Create user and generate access keys

## Step 5: Add Environment Variables

### Local Development (.env.local):
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

### Vercel Deployment:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add all 4 variables above

## Step 6: Test Upload
1. Start your development server: `npm run dev`
2. Go to admin page
3. Try uploading a file
4. Check your S3 bucket - files should appear in `amazing-grace-church/` folder

## Benefits of AWS S3:
- ✅ **99.999999999% (11 9's) durability**
- ✅ **Global CDN** with CloudFront (optional)
- ✅ **Cost effective** - pay only for what you use
- ✅ **Scalable** - handles any amount of data
- ✅ **Industry standard** - used by millions of companies
- ✅ **Advanced features** - versioning, lifecycle policies, etc.

## Pricing (US East):
- Storage: $0.023 per GB per month
- Requests: $0.0004 per 1,000 PUT requests
- Data transfer: First 1GB free, then $0.09 per GB

## Security Best Practices:
1. **Never commit AWS keys to Git**
2. **Use IAM roles** in production (more secure than access keys)
3. **Enable MFA** on your AWS account
4. **Regularly rotate access keys**
5. **Monitor usage** with AWS CloudTrail

## Troubleshooting:
- **403 Forbidden**: Check bucket policy and IAM permissions
- **Access Denied**: Verify access keys are correct
- **Bucket not found**: Check bucket name and region
- **CORS errors**: Add CORS policy to bucket if needed

## Optional: CloudFront CDN
For better performance globally:
1. Go to CloudFront service
2. Create distribution
3. Origin: Your S3 bucket
4. Default cache behavior: Allow all HTTP methods
5. Use the CloudFront URL instead of direct S3 URL
