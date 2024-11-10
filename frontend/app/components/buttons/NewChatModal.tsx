import React, { useState } from 'react';
import { Button, Modal, TextInput, Group } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { theme } from 'theme';
import { createConversation } from '@/api/conversations/api';

interface NewChatModalProps {
    opened: boolean;
    onClose: () => void;
    onChatCreated: () => void;  // Callback to trigger a refetch in parent
}

export const NewChatModal = ({ opened, onClose, onChatCreated }: NewChatModalProps) => {
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const handleCreateConversation = async () => {
        if (!title.trim()) return;

        setLoading(true);
        try {
            const { conversation_id } = await createConversation(title, session?.accessToken!);
            onClose();  // Close modal on success
            router.push(`/chat/${conversation_id}`);  // Redirect to the new chat
            onChatCreated();   // Trigger the parent to refetch conversations
        } catch (error) {
            console.error('Error creating conversation:', error);
        } finally {
            setTitle('');
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !loading) {
            handleCreateConversation();
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Create a new conversation!"
            centered
        >
            <TextInput
                label="Chat Title"
                placeholder="Enter chat title"
                value={title}
                onChange={(e) => setTitle(e.currentTarget.value)}
                onKeyDown={handleKeyDown}  // Added keydown event listener
                disabled={loading}
            />
            <Group justify="flex-end" mt="md">
                <Button onClick={handleCreateConversation} loading={loading} color={theme?.colors?.companyColor?.[7]}>
                    Create Chat
                </Button>
            </Group>
        </Modal>
    );
};
