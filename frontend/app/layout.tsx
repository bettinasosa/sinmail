import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sinmail | Paid contact for Gmail',
  description: 'Paid contact gateway for Gmail. Unknown senders pay; trusted senders pass for free.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
