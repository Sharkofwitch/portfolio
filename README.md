# Photography Portfolio

A modern, Apple-inspired photography portfolio website built with Next.js, featuring parallax effects, responsive design, and an integrated admin panel for photo management.

![Portfolio Preview](public/camera-favicon.svg)

## Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Apple-Inspired UI**: Modern, clean aesthetic with glass effects and smooth animations
- **Photo Gallery**: Dynamic photo grid with filtering and lightbox viewing
- **Admin Panel**: Secure admin interface for photo management
- **Dark Mode**: Elegant dark mode implementation
- **SEO Optimized**: Built with best practices for search engine visibility
- **Fast Performance**: Optimized for Core Web Vitals
- **Nextcloud Integration**: Store and manage photos using Nextcloud

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
src/
├── app/               # Next.js app router pages
│   ├── about/         # About page
│   ├── admin/         # Admin area (protected)
│   ├── api/           # API routes
│   ├── contact/       # Contact page
│   ├── gallery/       # Photo gallery
│   └── page.tsx       # Homepage
├── components/        # Reusable components
├── lib/               # Utility functions and types
└── data/              # Static data
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

## Admin Panel

To access the admin panel:

1. Create an admin account during the initial setup, or use the default credentials in your `.env.local` file
2. Navigate to `/admin/login` and log in
3. Manage your photos through the admin interface

## Authentication

This project uses NextAuth.js for authentication. You can modify the authentication providers in `src/app/api/auth/[...nextauth]/route.ts`.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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
