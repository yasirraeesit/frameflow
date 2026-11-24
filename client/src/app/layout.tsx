import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrameFlow — Short-Form Video Repurposing Studio & Multi-Track Editor',
  description: 'Turn long-form videos into high-retention 9:16 shorts with automated speaker tracking, word-level subtitles, and non-destructive timeline editing.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FAF9F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className="min-h-screen bg-[#0C0C0E] text-[#F4F4F6] antialiased selection:bg-[#E84C2B] selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
