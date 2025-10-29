# Testing Guide for Amazing Grace Church Website

## Pre-Testing Setup

1. **Environment Variables**: Ensure all required environment variables are set:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_S3_BUCKET`
   - `AWS_REGION`

2. **Database Setup**: Run the admin user creation script:
   ```bash
   npm run create-admin
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## Test Cases

### 1. Admin Image Management ✅

**Test Steps:**
1. Navigate to `/admin`
2. Login with admin credentials (admin@amazinggracechurch.org / grace1234)
3. Go to Gallery tab
4. Upload a test image with category "Test Category"
5. Verify image appears in both "Gallery Images" and "Uploaded Files" sections
6. Click the delete button on an image
7. Confirm deletion dialog appears
8. Confirm deletion
9. Verify image is removed from both sections

**Expected Results:**
- Images upload successfully
- Images display with proper names (not raw folder paths)
- Delete confirmation dialog works
- Images are removed from both database and S3 storage
- Real-time updates work

### 2. Gallery Display Fix ✅

**Test Steps:**
1. Navigate to `/gallery`
2. Verify images display properly with clean names
3. Check that no raw folder names are visible
4. Test category filtering
5. Test search functionality
6. Click on images to open modal view

**Expected Results:**
- Images display with user-friendly names
- No raw file paths visible
- Proper spacing and alignment
- Responsive design works on mobile
- Modal view works correctly

### 3. Sermon Page Debugging ✅

**Test Steps:**
1. Navigate to `/sermons`
2. Check that sermons display with proper buttons:
   - Audio sermons: "Play" and "Download" buttons
   - Video sermons: "Watch" and "Download" buttons
   - Notes only: "Download Notes" button
3. Test button functionality

**Expected Results:**
- Correct buttons appear based on content type
- Buttons match main page behavior
- All buttons are functional

### 4. Audio & Video Playback ✅

**Test Steps:**
1. Upload a test audio file (MP3) via admin
2. Upload a test video file (MP4) via admin
3. Navigate to sermons page
4. Click "Play" on audio sermon
5. Click "Watch" on video sermon
6. Test controls (play, pause, seek, volume)
7. Test error handling with invalid URLs

**Expected Results:**
- Audio plays with HTML5 audio controls
- Video plays with HTML5 video controls
- Error handling shows user-friendly messages
- Controls work properly
- Files stream without errors

### 5. Download Functionality ✅

**Test Steps:**
1. Navigate to sermons page
2. Click "Download" button on various sermon types
3. Test with different file formats (MP3, MP4, PDF)
4. Test error handling with missing files

**Expected Results:**
- Downloads trigger properly
- Files download with correct names
- Proper file extensions are applied
- Error handling works for missing files
- No "No downloadable file available" errors for valid files

### 6. General Debugging ✅

**Test Steps:**
1. Check browser console for errors
2. Check server logs for detailed error information
3. Test API endpoints directly
4. Verify environment variables are loaded
5. Test file upload with various formats

**Expected Results:**
- No console errors
- Detailed error logging in server
- API endpoints return proper responses
- All environment variables loaded correctly
- File uploads work with supported formats

## API Endpoint Testing

### Test Upload API
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg" \
  -F "type=gallery" \
  -F "metadata={\"title\":\"Test Image\",\"album\":\"Test Category\"}"
```

### Test Gallery API
```bash
curl http://localhost:3000/api/gallery
```

### Test Sermons API
```bash
curl http://localhost:3000/api/sermons
```

### Test Delete API
```bash
curl -X DELETE "http://localhost:3000/api/upload?id=FILE_ID"
```

## Performance Testing

1. **Upload Performance**: Test with large files (up to 100MB)
2. **Gallery Loading**: Test with many images
3. **Sermon Playback**: Test with large audio/video files
4. **Mobile Responsiveness**: Test on various screen sizes

## Error Scenarios

1. **Network Issues**: Test with poor connectivity
2. **Invalid Files**: Test with unsupported file types
3. **Missing Files**: Test with broken URLs
4. **Database Issues**: Test with database connection problems
5. **S3 Issues**: Test with S3 access problems

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Testing

1. **Authentication**: Test admin access controls
2. **File Upload**: Test malicious file uploads
3. **API Security**: Test unauthorized API access
4. **XSS Prevention**: Test input sanitization

## Deployment Testing

1. **Vercel Deployment**: Test on production environment
2. **Environment Variables**: Verify all env vars are set
3. **Database Connection**: Test production database
4. **S3 Integration**: Test production S3 bucket
5. **CDN**: Test file serving through CDN

## Success Criteria

- ✅ All images display with clean names
- ✅ Admin can manage images with delete functionality
- ✅ Sermon pages show correct buttons
- ✅ Audio/video playback works with error handling
- ✅ Download functionality works for all file types
- ✅ No console errors or broken functionality
- ✅ Responsive design works on all devices
- ✅ Real-time updates work after deletions
- ✅ Error logging provides useful debugging information
- ✅ All API endpoints work correctly

## Troubleshooting

### Common Issues:

1. **Upload Fails**: Check AWS credentials and S3 bucket permissions
2. **Images Not Displaying**: Check S3 bucket public access policy
3. **Database Errors**: Check MongoDB connection string
4. **Authentication Issues**: Check NextAuth configuration
5. **File Not Found**: Check file URLs and S3 key generation

### Debug Commands:

```bash
# Check environment variables
npm run env:check

# Test database connection
npm run test:db

# Test S3 connection
npm run test:s3

# Check build
npm run build
```
