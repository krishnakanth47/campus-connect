import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campus Connect — Intelligent Ambassador Management Platform',
  description: 'Streamline campus ambassador programs with task management, gamification, GitHub analysis, and real-time analytics. Built for modern organizations.',
  keywords: 'campus ambassador, management platform, gamification, GitHub analyzer, leaderboard, task management',
  authors: [{ name: 'Campus Connect Team' }],
  openGraph: {
    title: 'Campus Connect',
    description: 'Intelligent Ambassador Management & Engagement Platform',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="font-sans bg-dark-950 text-dark-100 antialiased">
        {children}
      </body>
    </html>
  );
}
