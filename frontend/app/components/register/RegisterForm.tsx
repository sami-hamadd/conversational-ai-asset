'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    TextInput,
    PasswordInput,
    Button,
    Paper,
    Container,
    Text,
    Group,
    Notification,
    Title,
    Box,
    Anchor,
} from '@mantine/core';
import { IconAt, IconCheck, IconExclamationCircleFilled, IconX } from '@tabler/icons-react';
import { signUp } from '@/api/auth/[...nextauth]/register';
import { theme } from 'theme';
import Image from 'next/image';
import MyLogo from 'public/images/CompanyLogo.svg';

export function RegisterForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError("Username can only contain letters and numbers.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const result = await signUp({ username, password });
            if (result?.error) {
                setError(result.error); // Display specific error message if the username is already registered
            } else {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login'); // Redirect to login page
                }, 2000);
            }
        } catch (error: any) {
            setError("An unexpected error occurred. Please try again.");
        }
    };


    return (
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
                        Sign Up
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
                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        required
                        radius="xl"
                        size="md"
                        mt="md"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error && (
                        <Group mt="sm" justify="center">
                            <IconExclamationCircleFilled color='red' />
                            <Text c="red" size="sm" fw='bold'>
                                {error}
                            </Text>
                        </Group>
                    )}
                    {success && (
                        <Notification
                            icon={<IconCheck size={18} />}
                            color="teal"
                            onClose={() => setSuccess(false)}
                            style={{
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                zIndex: 1000,
                            }}
                        >
                            Registration successful! Redirecting to login...
                        </Notification>
                    )}
                    <Button fullWidth mt="lg" radius="xl" size="md" type="submit" color={theme?.colors?.companyColor?.[7]}>
                        Sign Up
                    </Button>
                </form>
                <Text size="sm" mt="md" color="dimmed">
                    Already have an account?{' '}
                    <Anchor
                        size="sm"
                        component="button"
                        onClick={() => router.push('/login')} // Redirect to the register page on click
                    >
                        <span style={{ color: theme?.colors?.companyColor?.[4] }}>
                            Sign In
                        </span>
                    </Anchor>
                </Text>
            </Paper>
        </Container >
    );
}
