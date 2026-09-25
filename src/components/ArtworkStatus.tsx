import {StatusDot} from '@astryxdesign/core/StatusDot';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {artworkStatusMeta, orderStatusMeta} from '@/lib/format';
import type {ArtworkStatus as Status, OrderStatus} from '@/lib/types';

export function ArtworkStatus({status}: {status: Status}) {
  const meta = artworkStatusMeta[status];
  return (
    <HStack gap={1.5} vAlign="center">
      <StatusDot variant={meta.tone} label={meta.label} />
      <Text color="secondary">{meta.label}</Text>
    </HStack>
  );
}

export function OrderStatusLabel({status}: {status: OrderStatus}) {
  const meta = orderStatusMeta[status];
  return (
    <HStack gap={1.5} vAlign="center">
      <StatusDot variant={meta.tone} label={meta.label} />
      <Text>{meta.label}</Text>
    </HStack>
  );
}
