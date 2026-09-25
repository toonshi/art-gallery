'use client';

import {useState, type CSSProperties, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {VStack} from '@astryxdesign/core/Layout';
import {Center} from '@astryxdesign/core/Center';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Banner} from '@astryxdesign/core/Banner';
import {site} from '@/lib/config';
import {createSupabaseBrowserClient} from '@/lib/supabase/browser';

// Standalone auth page paints its own body background (no host shell).
const page: CSSProperties = {
  minHeight: '100dvh',
  backgroundColor: 'var(--color-background-body)',
};

export function LoginForm({next, isDemo}: {next: string; isDemo: boolean}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setIsLoading(true);
    const {error: authError} = await createSupabaseBrowserClient().auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setIsLoading(false);
      setError(authError.message);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <Center axis="both" padding={6} style={page}>
      <Card padding={8} maxWidth={420} width="100%">
        <form onSubmit={submit} noValidate>
          <VStack gap={4} hAlign="stretch">
            <VStack gap={1} hAlign="center">
              <Heading level={1}>{site.name} admin</Heading>
              <Text color="secondary">Sign in to manage artworks and orders</Text>
            </VStack>
            {isDemo ? (
              <Banner
                status="info"
                title="Supabase isn't connected yet"
                description="Sign-in is disabled in demo mode."
                endContent={<Button label="Open demo admin" href="/admin" size="sm" />}
              />
            ) : null}
            {error ? <Banner status="error" title={error} /> : null}
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              isDisabled={isDemo}
              hasAutoFocus
            />
            <TextInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              isDisabled={isDemo}
            />
            <Button
              label="Sign in"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              isDisabled={isDemo}
            />
          </VStack>
        </form>
      </Card>
    </Center>
  );
}
