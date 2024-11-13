import React, { useState, useRef } from 'react';
import { Textarea, Group, ActionIcon, rem } from '@mantine/core';
import { IconArrowUp, IconMicrophone } from '@tabler/icons-react';
import { theme } from 'theme';
import classes from '@/components/chats/disabled_sendbtn.module.css'
import { getMessages, sendMessageAudio, sendMessageText } from '@/api/messages/api';

interface MessageInputProps {
    conversationId: string;
    sessionToken: string;
    onMessageSent: (newMessages: any) => void;
    onWaitingMessage: (waitingMessage: any) => void;
}

export default function MessageInput({ conversationId, sessionToken, onMessageSent, onWaitingMessage }: MessageInputProps) {
    const [messageText, setMessageText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleSendMessage = async () => {
        if (!messageText.trim()) return;

        setIsLoading(true);

        // Create the user's message
        const userMessage = {
            message_id: 'temp-' + Date.now(), // Temporary ID
            question: {
                type: 'TEXT',
                content: messageText,
            },
            answer: null, // No answer yet
            feedback: null,
        };

        onWaitingMessage(userMessage); // Add user's message and indicate waiting

        try {
            const mess = messageText;
            setMessageText('');
            await sendMessageText(conversationId, mess, sessionToken);
            const newMessages = await getMessages(conversationId, sessionToken);
            onMessageSent(newMessages);  // Update the message list with the new messages
        } catch (error) {
            console.error('Error sending message:', error);
            onMessageSent([]); // Handle error appropriately
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecordVoiceMessage = () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    audioChunksRef.current = [];
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        let base64Audio = reader.result as string;

                        // Remove the "data:audio/webm;base64," prefix
                        base64Audio = base64Audio.split(',')[1];

                        setIsLoading(true);
                        // Create the user's message
                        const userMessage = {
                            message_id: 'temp-' + Date.now(), // Temporary ID
                            question: {
                                type: 'AUDIO',
                                content: base64Audio,
                            },
                            answer: null, // No answer yet
                            feedback: null,
                        };

                        onWaitingMessage(userMessage); // Add user's message and indicate waiting
                        try {
                            const { message_id, answer } = await sendMessageAudio(conversationId, base64Audio, sessionToken);
                            const newMessages = await getMessages(conversationId, sessionToken);
                            onMessageSent(newMessages);
                        } catch (error) {
                            console.error('Error sending voice message:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    };
                    reader.readAsDataURL(audioBlob); // Convert Blob to base64
                };

                mediaRecorder.start();
                setIsRecording(true);
            });
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !isLoading && !isRecording) {
            event.preventDefault(); // Prevent the default behavior of creating a new line
            handleSendMessage();
        }
    };

    return (
        <Group gap="apart" style={{ padding: '5px', scrollbarWidth: 'thin' }} className="textarea-wrapper">
            <Textarea
                variant="filled"
                placeholder="Type your message..."
                onChange={(e) => setMessageText(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isRecording}
                style={{ flexGrow: 1 }}
                autosize
                minRows={1}
                maxRows={4}
                value={messageText}
                radius="xl"
                size="md"
                rightSection={
                    <Group gap="xs">
                        <ActionIcon
                            size={25}
                            radius="xl"
                            color={isRecording ? 'red' : theme.primaryColor}
                            variant="filled"
                            onClick={handleRecordVoiceMessage}
                            className={classes.button}
                            disabled={isLoading}
                        >
                            <IconMicrophone style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </ActionIcon>
                        <ActionIcon
                            size={25}
                            radius="xl"
                            color={theme.primaryColor}
                            variant="filled"
                            onClick={handleSendMessage}
                            disabled={isLoading || messageText.trim() === ''}
                            className={classes.button}
                        >
                            <IconArrowUp style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
                        </ActionIcon>

                    </Group>
                }
                rightSectionWidth={100}
            />
        </Group>
    );
}
