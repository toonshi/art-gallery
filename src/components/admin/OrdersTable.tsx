'use client';

import {Table, pixel, proportional, type TableColumn} from '@astryxdesign/core/Table';
import {Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {formatKes} from '@/lib/format';
import type {Order} from '@/lib/types';
import {OrderStatusLabel} from '../ArtworkStatus';

type Row = Order & Record<string, unknown>;

const columns: TableColumn<Row>[] = [
  {
    key: 'reference',
    header: 'Order',
    width: pixel(120),
    renderCell: o => <Link href={`/admin/orders/${o.id}`} hasUnderline>{o.reference}</Link>,
  },
  {key: 'artwork_title', header: 'Artwork', width: proportional(2)},
  {
    key: 'customer_name',
    header: 'Buyer',
    width: proportional(1.5),
    renderCell: o => (
      <Text color={o.customer_name ? 'primary' : 'secondary'} maxLines={1}>
        {o.customer_name ?? '—'}
      </Text>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: proportional(1.5),
    renderCell: o => <OrderStatusLabel status={o.status} />,
  },
  {
    key: 'total_kes',
    header: 'Total',
    width: pixel(130),
    align: 'end',
    renderCell: o => (
      <Text hasTabularNumbers>{formatKes(o.total_kes ?? o.artwork_price_kes)}</Text>
    ),
  },
  {
    key: 'created_at',
    header: 'Placed',
    width: pixel(140),
    align: 'end',
    renderCell: o => <Timestamp value={o.created_at} format="relative_short" type="body" />,
  },
];

export function OrdersTable({orders}: {orders: Order[]}) {
  return (
    <Table<Row>
      data={orders as Row[]}
      columns={columns}
      idKey="id"
      hasHover
      textOverflow="truncate"
    />
  );
}
