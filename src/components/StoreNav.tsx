'use client';

import {usePathname} from 'next/navigation';
import {TopNav, TopNavItem} from '@astryxdesign/core/TopNav';
import {BrandName} from './BrandName';

const links = [
  {href: '/', label: 'Home'},
  {href: '/artworks', label: 'Artworks'},
];

export function StoreNav() {
  const pathname = usePathname();
  return (
    <TopNav
      label="Main"
      heading={<BrandName href="/" />}
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
