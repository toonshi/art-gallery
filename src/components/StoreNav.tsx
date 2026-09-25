'use client';

import {usePathname} from 'next/navigation';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {site} from '@/lib/config';

const links = [
  {href: '/', label: 'Home'},
  {href: '/artworks', label: 'Artworks'},
];

export function StoreNav() {
  const pathname = usePathname();
  return (
    <TopNav
      label="Main"
      heading={<TopNavHeading heading={site.name} headingHref="/" />}
      endContent={links.map(link => (
        <TopNavItem
          key={link.href}
          href={link.href}
          label={link.label}
          isSelected={
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
          }
        />
      ))}
    />
  );
}
