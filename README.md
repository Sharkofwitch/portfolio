# Modern Photography Portfolio

A sleek, Next.js-powered photography portfolio with Apple-inspired design, featuring seamless photo management and stunning visual effects.

![Portfolio Preview](public/camera-favicon.svg)

## ✨ Key Features

- 📱 **Responsive Design** with modern glass effects and smooth animations
- 🖼️ **Dynamic Photo Gallery** with filtering and lightbox viewing
- 🔒 **Secure Admin Panel** for effortless photo management
- 🌗 **Smart Dark Mode** for elegant viewing experience
- ⚡ **Fast Performance** with optimized Core Web Vitals
- ☁️ **Nextcloud Integration** for robust photo storage
- 🔄 **Universal Image Loading** with smart path handling
- 🎯 **SEO Optimized** for maximum visibility

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: PostgreSQL with [Prisma](https://www.prisma.io/)
- **Storage**: [Nextcloud](https://nextcloud.com/)
- **Deployment**: [Vercel](https://vercel.com)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database

### Setup

```bash
# Clone and install
git clone https://github.com/yourusername/photography-portfolio.git
cd photography-portfolio
npm install

# Configure environment
cp .env.example .env.local

# Setup database
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

## 📂 Project Structure

```text
src/
├── app/          # Next.js pages and API routes
├── components/   # Reusable UI components
├── lib/         # Utilities and business logic
└── data/        # Static data and configurations
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Configure env vars
4. Deploy

For other deployment options and troubleshooting, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

## 📖 Documentation

- [Image System](PORTFOLIO_IMAGE_SYSTEM.md)
- [Social Features](SOCIAL_FEATURES.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔑 Admin Access

1. Create admin account or use default credentials
2. Visit `/admin/login`
3. Start managing your photos

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
