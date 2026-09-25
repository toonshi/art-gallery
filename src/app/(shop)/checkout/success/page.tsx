import type {Metadata} from 'next';
import {VStack, HStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {SuccessIcon} from '@/components/icons';
import {site} from '@/lib/config';
import {isStripeConfigured, isSupabaseConfigured} from '@/lib/env';
import {formatKes} from '@/lib/format';
import {markOrderPaid} from '@/lib/orders/fulfil';
import {createSupabaseServiceClient} from '@/lib/supabase/server';
import type {Order} from '@/lib/types';

export const metadata: Metadata = {title: 'Thank you', robots: {index: false}};
export const dynamic = 'force-dynamic';

async function loadOrder(sessionId: string): Promise<Order | null> {
  if (!isSupabaseConfigured() || !isStripeConfigured() || !sessionId.startsWith('cs_')) {
    return null;
  }
  // The webhook normally records the payment first; this covers a slow webhook.
  await markOrderPaid(sessionId).catch(error => console.error(error));
  const {data} = await createSupabaseServiceClient()
    .from('orders')
    .select('*')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();
  return data as Order | null;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{session_id?: string}>;
}) {
  const {session_id: sessionId = ''} = await searchParams;
  const order = await loadOrder(sessionId);

  return (
    <VStack gap={6} hAlign="center" paddingBlock={10}>
      <Card padding={8} maxWidth={560} width="100%">
        <VStack gap={6}>
          <VStack gap={3} hAlign="center">
            <SuccessIcon />
            <Heading level={1} justify="center">
              Thank you — it&apos;s yours
            </Heading>
            <Text color="secondary" justify="center" textWrap="balance">
              {order?.customer_email
                ? `A receipt is on its way to ${order.customer_email}. We'll be in touch to arrange delivery.`
                : "Your payment went through. We'll be in touch shortly to arrange delivery."}
            </Text>
          </VStack>
          {order ? (
            <MetadataList>
              <MetadataListItem label="Order">{order.reference}</MetadataListItem>
              <MetadataListItem label="Artwork">{order.artwork_title}</MetadataListItem>
              <MetadataListItem label="Delivery">{order.delivery_method ?? '—'}</MetadataListItem>
              <MetadataListItem label="Total paid">
                {formatKes(order.total_kes ?? order.artwork_price_kes)}
              </MetadataListItem>
            </MetadataList>
          ) : null}
          <HStack justify="center">
            <Button label="Keep browsing" href="/artworks" />
          </HStack>
        </VStack>
      </Card>
      {site.contactEmail ? (
        <Text color="secondary">Questions? Email {site.contactEmail}</Text>
      ) : null}
    </VStack>
  );
}
