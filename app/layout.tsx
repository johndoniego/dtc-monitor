import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DTC Tuguegarao - Attendance System',
  description: 'Digital Transformation Center Tuguegarao Attendance Monitoring System',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
