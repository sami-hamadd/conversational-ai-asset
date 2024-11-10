import { Paper } from '@mantine/core';
import { RegisterForm } from '@/components/register/RegisterForm';
import { Suspense } from 'react';

export default function RegisterPage() {
    return (
        <Suspense>
            <Paper
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <RegisterForm />
            </Paper>
        </Suspense>
    );
}
