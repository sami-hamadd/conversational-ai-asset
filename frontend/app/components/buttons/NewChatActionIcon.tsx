import React, { useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import { NewChatModal } from '@/components/buttons/NewChatModal';

interface NewChatActionIconProps {
    onChatCreated: () => void;
}

export const NewChatActionIcon = ({ onChatCreated }: NewChatActionIconProps) => {
    const [opened, setOpened] = useState(false);

    return (
        <>
            <NewChatModal
                opened={opened}
                onClose={() => setOpened(false)}
                onChatCreated={onChatCreated}
            />
            <ActionIcon variant='subtle' onClick={() => setOpened(true)}>
                <IconEdit size={20} />
            </ActionIcon>
        </>
    );
};
