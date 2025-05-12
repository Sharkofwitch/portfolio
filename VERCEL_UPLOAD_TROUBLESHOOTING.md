# Vercel Upload Troubleshooting

This document provides information on resolving upload issues in the Vercel environment for the portfolio application.

## Recent Changes

We've made several improvements to the photo upload system to fix issues with Vercel deployments:

1. **Created specialized Vercel upload endpoint**:

   - Direct `/api/vercel-upload` endpoint optimized for serverless environment
   - Automatically used when in the Vercel environment
   - Extended function execution time (60 seconds)
   - Increased memory allocation (1024MB)

2. **Enhanced Nextcloud upload for reliability**:

   - Added file size validation (increased to 50MB limit)
   - Implemented retry logic with exponential backoff (up to 3 attempts)
   - Skip directory existence checks in Vercel to reduce API calls
   - Added conditional verification based on environment
   - Improved error logging with detailed information

3. **Added automatic image resizing** for large uploads:

   - Images over 5MB are automatically resized
   - Maintains aspect ratio while reducing dimensions
   - Reduces image quality if needed to meet size requirements
   - Provides detailed logs of the resizing process

4. **Improved API flexibility**:
   - Added support for both FormData and JSON requests
   - Added special processing for Vercel-optimized workflow
   - Enhanced error handling and reporting

## Testing Your Changes

To test if your changes have fixed the upload issues, follow these steps:

### 1. Test the upload diagnostics script

Run the diagnostic script to test Nextcloud uploads in a simulated Vercel environment:

```bash
# Set required environment variables if not already set
export NEXTCLOUD_URL="your-nextcloud-url"
export NEXTCLOUD_USERNAME="your-username"
export NEXTCLOUD_PASSWORD="your-password"
export NEXTCLOUD_PHOTOS_PATH="/your/photos/path"
export VERCEL=1
export NEXT_PUBLIC_VERCEL=1

# Run the diagnostic tool
node scripts/vercel-upload-diagnostic.js

# Test image processing functionality
node scripts/test-image-processing.js scripts/large-test-image.jpg

# Test the complete upload flow with a deployment URL
./scripts/test-photo-uploads.sh "https://your-vercel-deployment.vercel.app"
```

The script will:

- Verify your Nextcloud connection
- Test uploading a small text file
- Test uploading an image file (if test-image.jpg exists)
- Provide detailed logs of any issues encountered

### 2. Monitor Vercel Logs

After deploying, monitor your Vercel function logs for any upload-related errors:

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Deployments" -> (latest deployment) -> "Functions"
4. Look for logs from the `/api/photos` endpoint

### 3. Check for Common Issues

If uploads are still failing, check for:

- **Environment Variables**: Ensure all required Nextcloud variables are correctly set in Vercel
- **File Size**: Verify your upload is under the 5MB limit
- **Request Timeouts**: Vercel has a 10-second function execution limit on Hobby plans
- **Network Access**: Verify Nextcloud is accessible from Vercel's network

## Debugging Tips

If issues persist:

1. Try uploading a very small file (under 1MB)
2. Check if the issue occurs locally with environment variable `VERCEL=1`
3. Deploy with `DEBUG=webdav:*` environment variable set for detailed WebDAV logs
4. Try manually creating the target directory in Nextcloud before uploads

### Handling "File too large" Errors

If you encounter a "File too large" error:

1. The system will now automatically process images with the following steps:
   - Resize images over 2400×2400px to fit within those dimensions
   - Maintain aspect ratio during resizing
   - Reduce quality gradually if needed to meet size limits
   - Provide detailed logs of the processing steps
2. If auto-processing fails, try manually resizing the image before uploading
3. The absolute maximum file size is now 50MB (increased from 5MB)
4. Consider using image compression tools before uploading very large files
5. For videos or extremely large files, consider using a different upload method directly to Nextcloud

You can test the image processing functionality separately using:

```bash
node scripts/test-image-processing.js path/to/your/image.jpg
```

This will show you how the system would process your image before upload.

## Contact

If you continue experiencing issues after trying these solutions, please file an issue with:

- Full error messages from Vercel logs
- Results of the diagnostic script
- Details of your deployment environment
