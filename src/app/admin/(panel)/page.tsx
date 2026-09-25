import {Layout, LayoutContent, VStack, HStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Card} from '@astryxdesign/core/Card';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {getAllArtworks, getOrders} from '@/lib/data';
import {formatKes} from '@/lib/format';
import {OrdersTable} from '@/components/admin/OrdersTable';
import {PageHeader} from '@/components/admin/PageHeader';

const SOLD = new Set(['paid', 'shipped', 'delivered']);

function Metric({label, value, detail}: {label: string; value: string; detail: string}) {
  return (
    <Card padding={4}>
      <VStack gap={1}>
        <Text color="secondary">{label}</Text>
        <Text type="display-3" hasTabularNumbers>
          {value}
        </Text>
        <Text type="supporting">{detail}</Text>
      </VStack>
    </Card>
  );
}

export default async function OverviewPage() {
  const [artworks, orders] = await Promise.all([getAllArtworks(), getOrders()]);
  const sales = orders.filter(o => SOLD.has(o.status));
  const revenue = sales.reduce((sum, o) => sum + (o.total_kes ?? o.artwork_price_kes), 0);
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const recentRevenue = sales
    .filter(o => Date.parse(o.paid_at ?? o.created_at) >= thirtyDaysAgo)
    .reduce((sum, o) => sum + (o.total_kes ?? o.artwork_price_kes), 0);
  const toFulfil = orders.filter(o => o.status === 'paid');
  const listed = artworks.filter(a => a.is_published && a.status !== 'sold');
  const hidden = artworks.filter(a => !a.is_published);

  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={8}>
            <PageHeader
              title="Overview"
              description="How the shop is doing and what needs your attention."
              actions={<Button label="Add artwork" variant="primary" href="/admin/artworks/new" />}
            />

            <Grid columns={{minWidth: 150, repeat: 'fit'}} gap={4}>
              <Metric label="Sales" value={formatKes(revenue)} detail={`${formatKes(recentRevenue)} in the last 30 days`} />
              <Metric label="Orders to fulfil" value={String(toFulfil.length)} detail="Paid, not yet sent" />
              <Metric label="For sale" value={String(listed.length)} detail={`${hidden.length} hidden drafts`} />
              <Metric label="Sold" value={String(sales.length)} detail="Originals sold online" />
            </Grid>

            <VStack gap={3}>
              <HStack justify="between" vAlign="center">
                <Heading level={2}>Needs fulfilling</Heading>
                <Button label="All orders" variant="ghost" href="/admin/orders" />
              </HStack>
              <Card>
                {toFulfil.length ? (
                  <OrdersTable orders={toFulfil} />
                ) : (
                  <EmptyState isCompact title="All caught up" description="New paid orders will show up here." />
                )}
              </Card>
            </VStack>

            <VStack gap={3}>
              <Heading level={2}>Recent orders</Heading>
              <Card>
                {orders.length ? (
                  <OrdersTable orders={orders.slice(0, 8)} />
                ) : (
                  <EmptyState isCompact title="No orders yet" description="When someone buys a piece it will appear here." />
                )}
              </Card>
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
