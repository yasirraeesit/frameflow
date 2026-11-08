import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrameFlow - AI-Native Video Creation & Timeline Editing Platform',
  description: 'AI-assisted video editing suite with non-destructive multi-track timeline.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-gray-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

