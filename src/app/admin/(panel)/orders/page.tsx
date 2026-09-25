import {Layout, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {getOrders} from '@/lib/data';
import {OrdersBrowser} from '@/components/admin/OrdersBrowser';
import {PageHeader} from '@/components/admin/PageHeader';

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  return (
    <Layout
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            <PageHeader
              title="Orders"
              description="Payments are handled by Stripe; mark orders as sent and delivered here."
            />
            <OrdersBrowser orders={orders} />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
