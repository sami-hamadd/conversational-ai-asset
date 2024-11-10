import { Center, Title } from '@mantine/core';
import React from 'react';

const ChatEmptyState = () => {
    return (
        <Center style={{ height: '100vh' }}>
            <Title c="dimmed" ta="center" order={1}>
                Hi, how can I help?
            </Title>
        </Center>
    );
};

export default ChatEmptyState;
