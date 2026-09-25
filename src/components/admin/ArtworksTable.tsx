'use client';

import {Table, pixel, proportional, type TableColumn} from '@astryxdesign/core/Table';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {Token} from '@astryxdesign/core/Token';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {formatKes} from '@/lib/format';
import {imageUrl} from '@/lib/images';
import type {Artwork} from '@/lib/types';
import {ArtworkStatus} from '../ArtworkStatus';

type Row = Artwork & Record<string, unknown>;

const columns: TableColumn<Row>[] = [
  {
    key: 'title',
    header: 'Artwork',
    width: proportional(3),
    renderCell: a => (
      <HStack gap={3} vAlign="center">
        <Thumbnail src={imageUrl(a.images[0]) ?? undefined} alt="" />
        <VStack gap={0.5}>
          <Link href={`/admin/artworks/${a.id}`} hasUnderline>{a.title}</Link>
          <Text type="supporting" maxLines={1}>
            {[a.medium, a.dimensions].filter(Boolean).join(' · ') || '—'}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'price_kes',
    header: 'Price',
    width: pixel(130),
    align: 'end',
    renderCell: a => <Text hasTabularNumbers>{formatKes(a.price_kes)}</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(140),
    renderCell: a => <ArtworkStatus status={a.status} />,
  },
  {
    key: 'is_published',
    header: 'Shop',
    width: pixel(150),
    renderCell: a => (
      <HStack gap={1}>
        <Token size="sm" label={a.is_published ? 'Listed' : 'Hidden'} color={a.is_published ? 'green' : 'gray'} />
        {a.is_featured ? <Token size="sm" label="Featured" color="blue" /> : null}
      </HStack>
    ),
  },
  {
    key: 'updated_at',
    header: 'Updated',
    width: pixel(130),
    align: 'end',
    renderCell: a => <Timestamp value={a.updated_at} format="relative_short" type="body" />,
  },
];

export function ArtworksTable({artworks}: {artworks: Artwork[]}) {
  return (
    <Table<Row>
      data={artworks as Row[]}
      columns={columns}
      idKey="id"
      hasHover
      verticalAlign="middle"
    />
  );
}
