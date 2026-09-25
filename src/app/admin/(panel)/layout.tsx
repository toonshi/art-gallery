import type {ReactNode} from 'react';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {Center} from '@astryxdesign/core/Center';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Button} from '@astryxdesign/core/Button';
import {getAdminSession, getOrders} from '@/lib/data';
import {signOut} from '@/lib/admin/actions';
import {AdminShell} from '@/components/admin/AdminShell';

export const metadata: Metadata = {title: 'Admin', robots: {index: false}};
export const dynamic = 'force-dynamic';

export default async function AdminLayout({children}: {children: ReactNode}) {
  const session = await getAdminSession();
  if (session.kind === 'signed-out') redirect('/admin/login');
  if (session.kind === 'forbidden') {
    return (
      <Center minHeight="100dvh" padding={6}>
        <EmptyState
          title="This account isn't an admin"
          description={`${session.email} is signed in but not listed in the admins table. See the README to add it.`}
          actions={
            <form action={signOut}>
              <Button label="Sign out" type="submit" />
            </form>
          }
        />
      </Center>
    );
  }

  const orders = await getOrders();
  const toFulfil = orders.filter(o => o.status === 'paid').length;
  return (
    <AdminShell
      email={session.kind === 'admin' ? session.email : null}
      isDemo={session.kind === 'demo'}
      toFulfil={toFulfil}>
      {children}
    </AdminShell>
  );
}
