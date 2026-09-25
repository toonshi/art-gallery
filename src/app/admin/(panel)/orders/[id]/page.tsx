import {notFound} from 'next/navigation';
import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {Banner} from '@astryxdesign/core/Banner';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {getOrderById} from '@/lib/data';
import {formatKes} from '@/lib/format';
import type {ShippingAddress} from '@/lib/types';
import {OrderStatusLabel} from '@/components/ArtworkStatus';
import {OrderActions} from '@/components/admin/OrderActions';
import {PageHeader} from '@/components/admin/PageHeader';

function addressLines(address: ShippingAddress | null): string[] {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(', '),
    address.country === 'KE' ? 'Kenya' : address.country,
  ].filter((l): l is string => Boolean(l));
}

export default async function OrderPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const order = await getOrderById(id).catch(() => null);
  if (!order) notFound();
  const lines = addressLines(order.shipping_address);
  const isPickup = order.delivery_fee_kes === 0;

  return (
    <Layout
      contentWidth={960}
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <PageHeader
              eyebrow={<Link href="/admin/orders">← Orders</Link>}
              title={`Order ${order.reference}`}
              description={
                <>
                  Placed <Timestamp value={order.created_at} format="date_time" type="inherit" />
                </>
              }
              actions={<OrderStatusLabel status={order.status} />}
            />
            {order.notes.startsWith('Warning:') ? (
              <Banner status="error" title="Possible double sale" description={order.notes} />
            ) : null}

            <Grid columns={{minWidth: 280, repeat: 'fit'}} gap={4} align="start">
              <Card padding={4}>
                <VStack gap={3}>
                  <Heading level={2}>Buyer</Heading>
                  <MetadataList>
                    <MetadataListItem label="Name">{order.customer_name ?? '—'}</MetadataListItem>
                    <MetadataListItem label="Email">
                      {order.customer_email ? (
                        <Link href={`mailto:${order.customer_email}`}>{order.customer_email}</Link>
                      ) : (
                        '—'
                      )}
                    </MetadataListItem>
                    <MetadataListItem label="Phone">
                      {order.customer_phone ? (
                        <Link href={`tel:${order.customer_phone.replace(/\s/g, '')}`}>
                          {order.customer_phone}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </MetadataListItem>
                    <MetadataListItem label="Delivery">{order.delivery_method ?? '—'}</MetadataListItem>
                    {!isPickup ? (
                      <MetadataListItem label="Address">
                        {lines.length ? (
                          <VStack gap={0}>
                            {lines.map(line => (
                              <Text key={line}>{line}</Text>
                            ))}
                          </VStack>
                        ) : (
                          '—'
                        )}
                      </MetadataListItem>
                    ) : null}
                  </MetadataList>
                </VStack>
              </Card>

              <Card padding={4}>
                <VStack gap={3}>
                  <Heading level={2}>Payment</Heading>
                  <MetadataList>
                    <MetadataListItem label="Artwork">
                      {order.artwork_id ? (
                        <Link href={`/admin/artworks/${order.artwork_id}`}>{order.artwork_title}</Link>
                      ) : (
                        order.artwork_title
                      )}
                    </MetadataListItem>
                    <MetadataListItem label="Price">{formatKes(order.artwork_price_kes)}</MetadataListItem>
                    <MetadataListItem label="Delivery fee">
                      {order.delivery_fee_kes != null ? formatKes(order.delivery_fee_kes) : '—'}
                    </MetadataListItem>
                    <MetadataListItem label="Total">
                      <Text weight="semibold">
                        {order.total_kes != null ? formatKes(order.total_kes) : '—'}
                      </Text>
                    </MetadataListItem>
                    <MetadataListItem label="Paid">
                      {order.paid_at ? <Timestamp value={order.paid_at} format="date_time" type="body" color="primary" /> : 'Not paid'}
                    </MetadataListItem>
                    {order.stripe_payment_intent_id ? (
                      <MetadataListItem label="Stripe">
                        <Link
                          href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent_id}`}
                          isExternalLink>
                          View payment
                        </Link>
                      </MetadataListItem>
                    ) : null}
                  </MetadataList>
                </VStack>
              </Card>
            </Grid>

            <VStack gap={3}>
              <Heading level={2}>Fulfilment</Heading>
              <OrderActions order={order} />
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
