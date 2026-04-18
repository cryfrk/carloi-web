import type { Metadata } from 'next';

import { webEnv } from '@/lib/env';
import { SessionProvider } from '@/providers/session-provider';

import '@/app/globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(webEnv.shareBaseUrl),
  title: {
    default: 'Carloi',
    template: '%s | Carloi',
  },
  description: 'Araç al, sat, analiz et. Carloi web ile sosyal akış, ilanlar, mesajlar ve Loi AI tek yüzeyde.',
  openGraph: {
    title: 'Carloi',
    description: 'Araç al, sat, analiz et.',
    images: ['/carloi.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>
        <SessionProvider initialSnapshot={null}>{children}</SessionProvider>
      </body>
    </html>
  );
}
