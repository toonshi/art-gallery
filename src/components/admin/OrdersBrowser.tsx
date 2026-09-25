'use client';

import {useState} from 'react';
import {VStack} from '@astryxdesign/core/Layout';
import {Card} from '@astryxdesign/core/Card';
import {SegmentedControl, SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import type {Order, OrderStatus} from '@/lib/types';
import {OrdersTable} from './OrdersTable';

const filters: Record<string, {label: string; statuses: OrderStatus[]}> = {
  open: {label: 'To fulfil', statuses: ['paid', 'shipped']},
  done: {label: 'Completed', statuses: ['delivered']},
  all: {label: 'All paid', statuses: ['paid', 'shipped', 'delivered', 'cancelled']},
  abandoned: {label: 'Abandoned', statuses: ['pending', 'expired']},
};

export function OrdersBrowser({orders}: {orders: Order[]}) {
  const [filter, setFilter] = useState('open');
  const visible = orders.filter(o => filters[filter].statuses.includes(o.status));
  return (
    <VStack gap={4}>
      <SegmentedControl label="Show orders" value={filter} onChange={setFilter}>
        {Object.entries(filters).map(([value, f]) => (
          <SegmentedControlItem
            key={value}
            value={value}
            label={`${f.label} (${orders.filter(o => f.statuses.includes(o.status)).length})`}
          />
        ))}
      </SegmentedControl>
      <Card>
        {visible.length ? (
          <OrdersTable orders={visible} />
        ) : (
          <EmptyState isCompact title="No orders here" />
        )}
      </Card>
    </VStack>
  );
}
