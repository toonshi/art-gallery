import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {isSupabaseConfigured} from '@/lib/env';
import {getAdminSession} from '@/lib/data';
import {LoginForm} from '@/components/admin/LoginForm';

export const metadata: Metadata = {title: 'Sign in', robots: {index: false}};
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{next?: string}>;
}) {
  const session = await getAdminSession();
  if (session.kind === 'admin') redirect('/admin');
  const {next} = await searchParams;
  // Only same-site admin paths, never an open redirect.
  const destination = next?.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
  return <LoginForm next={destination} isDemo={!isSupabaseConfigured()} />;
}
