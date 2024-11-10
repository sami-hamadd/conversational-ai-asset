'use client';
import React, { useEffect, useState, useRef } from 'react';
import { Box, ScrollArea, Stack, Text } from '@mantine/core';
import Loading from '@/components/loading/CustomLoading';
import MessageInput from '@/components/chats/MessageInput';
import MessageList from '@/components/chats/MessageList';
import ChatEmptyState from '@/components/chats/ChatEmptyState';
import { useSessionCheck } from '@/hooks/useSessionCheck';
import { getMessages } from '@/api/conversations/api';
import NotFound from '@/not-found';

interface Question {
    type: 'TEXT' | 'AUDIO';
    content: string;
}

interface Answer {
    type: 'TEXT';
    content: string | Record<string, any>[];
    generated_chart?: any; // Adding support for generated charts
}

export interface Message {
    message_id: string;
    question: Question;
    answer: Answer;
    timestamp: string;
    feedback: 'LIKE' | 'DISLIKE' | null;
}

export default function ChatPage({ params }: { params: { conversationId: string } }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [chatError, setChatError] = useState(false);
    const { session, status } = useSessionCheck(); // Use the session check hook
    const { conversationId } = params;
    const [messageToStreamId, setMessageToStreamId] = useState<string | null>(null);
    const hasFetchedOnce = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false); // New state


    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchMessages = async () => {
            if (!session?.accessToken) {
                console.error('No access token available');
                return;
            }

            if (hasFetchedOnce.current) {
                return;
            }

            setLoading(true);
            try {
                const messages = await getMessages(conversationId, session.accessToken);

                if (!messages) {
                    setChatError(true);
                }

                setMessages(messages);
                hasFetchedOnce.current = true;
            } catch (error) {
                console.error('Error fetching messages:', error);
                setChatError(true);
            } finally {
                setLoading(false);
                scrollToBottom();
            }
        };

        if (status === 'authenticated') {
            fetchMessages();
        }
    }, [conversationId, session, status]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleMessageSent = (newMessages: any) => {
        setIsWaitingForResponse(false); // Stop showing typing indicator

        // Find the new AI message by comparing message IDs
        const oldMessageIds = messages.map((msg) => msg.message_id);
        const newMessage = newMessages.find((msg: any) => !oldMessageIds.includes(msg.message_id));

        if (newMessage) {
            setMessageToStreamId(newMessage.message_id);
        } else {
            setMessageToStreamId(null);
        }

        setMessages(newMessages);
        scrollToBottom();
    };

    const handleWaitingMessage = (userMessage: any) => {
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setIsWaitingForResponse(true); // Show typing indicator
        scrollToBottom();
    };

    if (loading) {
        return <Loading />;
    }

    if (chatError) {
        return <NotFound />;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <ScrollArea style={{ flexGrow: 1 }} scrollbarSize={20} offsetScrollbars mb={0} pb={0} mt={'4rem'}>
                <Stack gap="md" style={{ paddingLeft: '20%', paddingRight: '20%', flexGrow: 1, justifyContent: 'flex-end', marginBottom: 0 }}>
                    {messages.length === 0 ? (
                        <ChatEmptyState />
                    ) : (
                        <>
                            <MessageList
                                messages={messages}
                                conversationId={conversationId}
                                messageToStreamId={messageToStreamId}
                                isWaitingForResponse={isWaitingForResponse}
                            />

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </Stack>
            </ScrollArea>

            {/* Input box docked at the bottom */}
            <Box
                style={{
                    position: 'sticky',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: 'white',
                    paddingLeft: '20%',
                    paddingRight: '20%',
                    marginTop: 0,
                }}
            >
                <MessageInput
                    conversationId={conversationId}
                    sessionToken={session?.accessToken!}
                    onMessageSent={handleMessageSent}
                    onWaitingMessage={handleWaitingMessage}
                />
                <Text size="sm" ta="center" color="gray">
                    AI can make mistakes. Check important info.
                </Text>
            </Box>
        </div>
    );
}
