# Photography Portfolio

A modern, Apple-inspired photography portfolio website built with Next.js, featuring parallax effects, responsive design, and an integrated admin panel for photo management.

![Portfolio Preview](public/camera-favicon.svg)

## Recent Updates

- **Universal Image Loading**: Added robust system to handle various image paths and formats
- **Path Consistency**: Implemented solution for timestamp-prefixed images and path inconsistencies
- **Comprehensive Testing**: Created verification scripts for database consistency and image loading
- **Documentation**: Added detailed documentation on the image system architecture
- **Database Tools**: Created utilities to maintain consistent database records

## Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Apple-Inspired UI**: Modern, clean aesthetic with glass effects and smooth animations
- **Photo Gallery**: Dynamic photo grid with filtering and lightbox viewing
- **Admin Panel**: Secure admin interface for photo management
- **Dark Mode**: Elegant dark mode implementation
- **SEO Optimized**: Built with best practices for search engine visibility
- **Fast Performance**: Optimized for Core Web Vitals
- **Nextcloud Integration**: Store and manage photos using Nextcloud
- **Universal Image Loading**: Robust solution for handling various image paths and formats
- **Automatic Path Correction**: Intelligently handles timestamp-prefixed images and path inconsistencies

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/)
- **Storage**: [Nextcloud](https://nextcloud.com/) for photo management
- **Deployment**: [Vercel](https://vercel.com)
- **Deployment**: [Vercel](https://vercel.com)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Installation

1. Clone this repository

```bash
git clone https://github.com/yourusername/photography-portfolio.git
cd photography-portfolio
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials and other environment variables.

4. Set up the database

```bash
npx prisma migrate dev
```

5. Start the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── src/
│   ├── app/               # Next.js app router pages
│   │   ├── about/         # About page
│   │   ├── admin/         # Admin area (protected)
│   │   ├── api/           # API routes
│   │   │   ├── photos/    # Universal image loading API
│   │   │   └── ...
│   │   ├── contact/       # Contact page
│   │   ├── gallery/       # Photo gallery
│   │   └── page.tsx       # Homepage
│   ├── components/        # Reusable components
│   ├── lib/               # Utility functions and types
│   │   ├── nextcloud.ts   # Nextcloud integration
│   │   └── ...
│   └── data/              # Static data
│
├── scripts/               # Utility scripts
│   ├── verify-universal-solution.js  # Test image loading solution
│   ├── verify-database-consistency.js # Database path verification
│   ├── refresh-database.js # Ensure consistent database records
│   └── ...
│
└── public/                # Static assets
    └── photos/            # Local photo storage
```

## Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

### Other Hosting Options

You can also deploy this project on any hosting service that supports Next.js, such as:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted with Docker

## Universal Image Loading Solution

This project implements a robust universal image loading system that handles various path formats and filename patterns:

- **Multi-Strategy Approach**: Images are searched in the public directory, database records, and Nextcloud storage
- **Path Pattern Recognition**: Handles timestamp-prefixed filenames (e.g., "1747175977747-playground-poise.jpeg")
- **Automatic Path Generation**: Creates various path combinations to find images regardless of path inconsistencies
- **Fallback Mechanism**: Gracefully falls back to placeholder images when needed

For more details on the implementation, check the [PORTFOLIO_IMAGE_SYSTEM.md](PORTFOLIO_IMAGE_SYSTEM.md) document.

## Admin Panel

To access the admin panel:

1. Create an admin account during the initial setup, or use the default credentials in your `.env.local` file
2. Navigate to `/admin/login` and log in
3. Manage your photos through the admin interface

## Authentication

This project uses NextAuth.js for authentication. You can modify the authentication providers in `src/app/api/auth/[...nextauth]/route.ts`.

## Nextcloud Integration and Image System

This project integrates with Nextcloud for storing and managing photos. The system includes:

1. **API Route**: Photos are served through the `/api/photos/[filename]` route
2. **Universal Loading**: The system implements a multi-strategy approach to find images:

   - Tries the local public directory first
   - Checks database records for path information
   - Generates and tries multiple path variations based on patterns
   - Falls back to placeholder images when needed

3. **Database Consistency**: All database records use standardized paths in the format `/api/photos/[filename]`

To configure your Nextcloud connection:

1. Update your environment variables with Nextcloud credentials
2. Run initial synchronization: `node scripts/sync-db-with-nextcloud.js`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Image Loading Issues

If you encounter issues with images not loading properly:

1. **Verify database paths**: Run the database verification script to ensure all paths are consistent:

   ```bash
   node scripts/verify-database-consistency.js
   ```

2. **Refresh database**: If inconsistencies are found, run the refresh script:

   ```bash
   node scripts/refresh-database.js
   ```

3. **Validate solution**: Test the universal image loading solution:

   ```bash
   node scripts/verify-universal-solution.js
   ```

4. **Check logs**: The API routes provide detailed logging about image loading attempts and paths tried.

### Common Image Issues

- **Timestamp-Prefixed Images**: The system automatically handles files with timestamps (e.g., "1747175977747-playground-poise.jpeg")
- **Path Inconsistencies**: Images can be found regardless of capitalization or folder structure variations
- **Missing Images**: All missing images will gracefully fall back to a placeholder

For deployment-related issues, check the [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) document.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - For styling
- [Framer Motion](https://www.framer.com/motion/) - For animations
- [NextAuth.js](https://next-auth.js.org/) - For authentication

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
