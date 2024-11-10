'use client';
import { useState } from 'react';
import { Text, Title, Container, Group } from '@mantine/core';
import { NewChatButton } from '@/components/buttons/NewChatButton';
import { useSessionCheck } from '@/hooks/useSessionCheck';
import dynamic from 'next/dynamic';
import CustomLoading from '@/components/loading/CustomLoading';
const Player = dynamic(() => import('@lottiefiles/react-lottie-player').then(mod => mod.Player), { ssr: false });

export default function HomePage() {
  const { status } = useSessionCheck();
  const [shouldRefetch, setShouldRefetch] = useState(false);

  if (status === 'loading') {
    return <CustomLoading />;
  }

  const handleChatCreated = () => {
    setShouldRefetch(true);
  };

  return (
    <Container style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      overflow: 'auto'
    }}>
      <div style={{ flex: 1, maxWidth: '60%' }}>
        <Player
          autoplay
          loop
          src="/lotties/animation.json"
          style={{ height: '20rem', width: '20rem' }}
        />
        <Title>Your Insights Companion!</Title>
        <Text fw={500} fz="lg" mb={5}>
          Your Key to Real-Time KPIs and Data Exploration
        </Text>
        <Text fz="sm" c="dimmed" mb={20}>
          Unlock powerful insights with this exclusive tool, designed to support employees in tracking KPIs and exploring operational data. Access real-time analytics at your fingertips—start a new chat now to dive into the data that drives success!
        </Text>
        <Group justify='center'>
          <NewChatButton onChatCreated={handleChatCreated} />
        </Group>
      </div>
    </Container>
  );
}
