'use client'
import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  Box,
  Group,
} from '@mantine/core';
import { IconAt, IconExclamationCircleFilled } from '@tabler/icons-react';
import Image from 'next/image';
import MyLogo from 'public/images/CompanyLogo.svg';
import { theme } from 'theme';
export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await signIn('credentials', {
        redirect: false,  // Disable NextAuth automatic redirection
        username: username,
        password: password,
      });

      if (result?.error) {
        // Handle 401 error (invalid credentials)
        setError(result.error || "The Username or Password is incorrect");
      } else {
        // Check if a redirect URL is provided, otherwise default to dashboard
        const redirectUrl = searchParams.get('redirect') || '/';
        router.push(redirectUrl);  // Redirect to the intended URL or dashboard
      }
    } catch (error: any) {
      // Handle network/server errors or unexpected errors
      setError(error.message || "An unexpected error occurred. Please try again.");
    }
  };



  return (
    <Suspense>
      <Container
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '20px',
        }}
        my={40}
      >
        <Paper withBorder shadow="md" p={30} radius="md">
          <Image src={MyLogo} alt="My Logo" width={400} height={80} />
          <Box mb="md">
            <Text size="lg" fw={500} ta="left" color="dimmed">
              Welcome!
            </Text>
            <Title ta="left" order={2} mt="xs">
              Login
            </Title>
          </Box>
          <form onSubmit={handleSubmit}>
            <TextInput
              label="Username"
              placeholder="Your username"
              required
              rightSection={<IconAt size={16} />}
              radius="xl"
              size="md"
              mt="md"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              radius="xl"
              size="md"
              mt="md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Group mt="sm">
                <IconExclamationCircleFilled color='red' />
                <Text c="red" size="sm" fw='bold'>
                  {error}
                </Text>
              </Group>
            )}
            <Button fullWidth mt="lg" radius="xl" size="md" type="submit" color={theme?.colors?.companyColor?.[7]}>
              Sign In
            </Button>
          </form>
          <Text size="sm" mt="md" color="dimmed">
            Don&apos;t have an account?{' '}
            <Anchor
              size="sm"
              component="button"
              onClick={() => router.push('/register')} // Redirect to the register page on click
            >
              <span style={{ color: theme?.colors?.companyColor?.[4] }}>
                Register
              </span>
            </Anchor>
          </Text>
        </Paper>
      </Container >
    </Suspense>
  );
}
