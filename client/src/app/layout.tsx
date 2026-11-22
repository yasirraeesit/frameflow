import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrameFlow — Short-Form Video Repurposing Studio & Multi-Track Editor',
  description: 'Turn long-form videos into high-retention 9:16 shorts with automated speaker tracking, word-level subtitles, and non-destructive timeline editing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0C0C0E] text-[#F4F4F6] antialiased selection:bg-[#F59E0B] selection:text-[#0C0C0E]">
        {children}
      </body>
    </html>
  );
}
