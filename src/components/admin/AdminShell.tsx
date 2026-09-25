'use client';

import type {ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {AppShell} from '@astryxdesign/core/AppShell';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Banner} from '@astryxdesign/core/Banner';
import {Icon} from '@astryxdesign/core/Icon';
import {ExternalLink, Frame, LayoutDashboard, LogOut, ReceiptText} from 'lucide-react';
import {BrandName} from '../BrandName';
import {signOut} from '@/lib/admin/actions';

const items = [
  {href: '/admin', label: 'Overview', icon: LayoutDashboard},
  {href: '/admin/artworks', label: 'Artworks', icon: Frame},
  {href: '/admin/orders', label: 'Orders', icon: ReceiptText},
];

export function AdminShell({
  email,
  isDemo,
  toFulfil,
  children,
}: {
  email: string | null;
  isDemo: boolean;
  toFulfil: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AppShell
      banner={
        isDemo ? (
          <Banner
            status="info"
            container="section"
            title="Demo mode"
            description="You're looking at sample data. Add your Supabase keys to .env.local to manage real artworks and orders."
            collapsible={false}
          />
        ) : null
      }
      sideNav={
        <SideNav
          header={
            <VStack gap={0} paddingInline={2} paddingBlockStart={2}>
              <BrandName href="/admin" />
              <Text type="supporting">Studio admin</Text>
            </VStack>
          }
          footer={
            <VStack gap={2} padding={2}>
              {email ? (
                <Text type="supporting" maxLines={1}>
                  {email}
                </Text>
              ) : null}
              <Button
                label="View shop"
                variant="ghost"
                href="/"
                target="_blank"
                icon={<Icon icon={ExternalLink} size="sm" />}
              />
              {!isDemo ? (
                <Button
                  label="Sign out"
                  variant="ghost"
                  icon={<Icon icon={LogOut} size="sm" />}
                  clickAction={() => signOut()}
                />
              ) : null}
            </VStack>
          }>
          <SideNavSection title="Manage" isHeaderHidden>
            {items.map(item => (
              <SideNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isSelected={
                  item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
                }
                endContent={
                  item.href === '/admin/orders' && toFulfil > 0 ? (
                    <Text type="supporting" hasTabularNumbers>
                      {toFulfil}
                    </Text>
                  ) : undefined
                }
              />
            ))}
          </SideNavSection>
        </SideNav>
      }>
      {children}
    </AppShell>
  );
}
