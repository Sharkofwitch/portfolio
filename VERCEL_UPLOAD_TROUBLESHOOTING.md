# Vercel Upload Troubleshooting

This document provides information on resolving upload issues in the Vercel environment for the portfolio application.

## Recent Changes

We've made several improvements to the photo upload system to fix issues with Vercel deployments:

1. **Fixed undefined `client` variable** in the `photos` API route
2. **Enhanced the Nextcloud upload function** with Vercel-specific optimizations:
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

# Run the diagnostic tool
node scripts/vercel-upload-diagnostic.js
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

1. The system will now automatically try to resize images over 5MB
2. If auto-resizing fails, try manually resizing the image before uploading
3. The absolute maximum file size is now 50MB (increased from 5MB)
4. Consider using image compression tools before uploading very large files
5. For videos or extremely large files, consider using a different upload method directly to Nextcloud

## Contact

If you continue experiencing issues after trying these solutions, please file an issue with:

- Full error messages from Vercel logs
- Results of the diagnostic script
- Details of your deployment environment
