import { Paper } from '@mantine/core';
import { LoginForm } from '@/components/login/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense>
      <Paper style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <LoginForm />
      </Paper>
    </Suspense>
  );
}
