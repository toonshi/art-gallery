'use client';

import type {ReactNode} from 'react';
import NextLink from 'next/link';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {neutralTheme} from '@/themes/neutral/neutralTheme';

export function Providers({children}: {children: ReactNode}) {
  return (
    <Theme theme={neutralTheme}>
      <LinkProvider component={NextLink}>{children}</LinkProvider>
    </Theme>
  );
}
