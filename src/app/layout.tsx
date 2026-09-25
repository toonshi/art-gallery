import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import {site} from '@/lib/config';
import {Providers} from './providers';

export const metadata: Metadata = {
  title: {default: site.name, template: `%s · ${site.name}`},
  description: site.intro,
};

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
