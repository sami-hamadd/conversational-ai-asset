import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { NewChatModal } from '@/components/buttons/NewChatModal';
import { theme } from 'theme';

interface NewChatButtonProps {
    onChatCreated: () => void;
}

export const NewChatButton = ({ onChatCreated }: NewChatButtonProps) => {
    const [opened, setOpened] = useState(false);

    return (
        <>
            <NewChatModal
                opened={opened}
                onClose={() => setOpened(false)}
                onChatCreated={onChatCreated}
            />
            <Button onClick={() => setOpened(true)} color={theme?.colors?.companyColor?.[7]}>
                Create a new chat!
            </Button>
        </>
    );
};
