# Vercel Deployment Checklist

This document outlines the steps needed to ensure a successful deployment of the portfolio website on Vercel, with a focus on making sure the Nextcloud-connected photo gallery works correctly.

## Prerequisites

1. A Vercel account
2. Access to the Nextcloud server
3. All required environment variables (see below)

## Required Environment Variables

Make sure to add these in the Vercel project settings under "Environment Variables":

| Variable                | Description                           | Example                                                     |
| ----------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`          | Connection URL to the Prisma database | `prisma+postgres://accelerate.prisma-data.net/?api_key=...` |
| `NEXTAUTH_URL`          | The URL of your deployed app          | `https://your-portfolio-domain.vercel.app`                  |
| `NEXTAUTH_SECRET`       | Secret for NextAuth session           | `random-secret-string`                                      |
| `NEXTCLOUD_URL`         | URL of your Nextcloud instance        | `https://cloud.szark.org`                                   |
| `NEXTCLOUD_USERNAME`    | Username for Nextcloud                | `admin`                                                     |
| `NEXTCLOUD_PASSWORD`    | Password for Nextcloud                | `password`                                                  |
| `NEXTCLOUD_PHOTOS_PATH` | Path where photos are stored          | `/Photos/Portfolio`                                         |
| `ADMIN_PASSWORD`        | Password for admin access             | `admin-password`                                            |

## Deployment Steps

1. **Connect your repository to Vercel**

   - Import your GitHub/GitLab/Bitbucket repository in the Vercel dashboard

2. **Configure the project**

   - Set the framework preset to "Next.js"
   - Set the build command to our custom command: `node scripts/verify-vercel-env.js && npx prisma generate && npx prisma db push && npm run build`

3. **Add all environment variables**

   - Copy values from your local `.env` file
   - Make sure to update `NEXTAUTH_URL` to your Vercel deployment URL

4. **Deploy**
   - Click "Deploy" and wait for the build to complete
   - The `verify-vercel-env.js` script will validate environment variables during build

## Troubleshooting

### Photo Gallery Issues

If photos aren't loading in the gallery:

1. **Check environment variables**: Ensure `NEXTCLOUD_URL`, `NEXTCLOUD_USERNAME`, `NEXTCLOUD_PASSWORD`, and `NEXTCLOUD_PHOTOS_PATH` are correctly set.

2. **Verify Nextcloud connection**: Run the verification script locally with Vercel environment variables:

   ```
   NEXTCLOUD_URL=your_value NEXTCLOUD_USERNAME=your_value NEXTCLOUD_PASSWORD=your_value node scripts/verify-vercel-env.js
   ```

3. **Check photos in Nextcloud**: Ensure photos are actually present in the specified path in Nextcloud.

4. **Inspect server logs**: Check Vercel function logs for any errors related to Nextcloud connection or photo retrieval.

### Database Issues

1. **Check Prisma connection**: Verify that `DATABASE_URL` is correctly set and database is accessible from Vercel's network.

2. **Run database migration**: If schema changes have been made, ensure migrations are applied.

### Authentication Issues

1. **Verify `NEXTAUTH_URL`**: Make sure it matches your actual Vercel deployment URL.
2. **Check `NEXTAUTH_SECRET`**: Ensure it's properly set.

## Performance Optimizations

- The app uses optimized Nextcloud connection handling for serverless environments
- Photos are cached with aggressive caching headers
- Missing photos are gracefully handled with placeholders instead of errors
- API routes use dynamic imports to reduce cold start time

## Testing the Deployment

After deployment, check:

1. Homepage loads correctly
2. Gallery shows all photos
3. Photo details are displayed when clicking on photos
4. Admin login works
5. Admin can add and edit photos

## Additional Notes

- The first request might be slower due to serverless cold start
- Photo upload functionality requires a stable connection to Nextcloud
- Large galleries might require pagination for optimal performance
