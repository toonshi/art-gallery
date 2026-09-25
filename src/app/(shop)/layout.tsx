import type {ReactNode} from 'react';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Layout, LayoutContent, LayoutFooter, HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {site} from '@/lib/config';
import {StoreNav} from '@/components/StoreNav';

export default function ShopLayout({children}: {children: ReactNode}) {
  return (
    <AppShell topNav={<StoreNav />} height="auto" variant="section">
      <Layout
        height="auto"
        contentWidth={1200}
        content={<LayoutContent padding={6} isScrollable={false}>{children}</LayoutContent>}
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={4} justify="between" wrap="wrap" padding={6}>
              <Text color="secondary">
                © {new Date().getFullYear()} {site.name}. Originals, delivered across Kenya.
              </Text>
              {site.contactEmail ? (
                <Link href={`mailto:${site.contactEmail}`}>{site.contactEmail}</Link>
              ) : null}
            </HStack>
          </LayoutFooter>
        }
      />
    </AppShell>
  );
}
