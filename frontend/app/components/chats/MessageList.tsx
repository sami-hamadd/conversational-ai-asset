import React, { useState, useRef } from "react";
import { Flex, Group, ActionIcon, Tooltip, Paper } from "@mantine/core";
import { Message } from "@/chat/[conversationId]/page";
import MessageCard from "@/components/chats/MessageCard";
import TypingIndicator from "@/components/chats/TypingIndicator";
import {
  IconRobot,
  IconThumbUp,
  IconThumbDown,
  IconCopy,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useClipboard } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { updateMessageFeedback } from "@/api/messages/api";
import { callTextToSpeechApi } from "@/api/genai/api";

interface MessageListProps {
  messages: Message[];
  conversationId: string;
  messageToStreamId: string | null;
  isWaitingForResponse: boolean;
}

export default function MessageList({
  messages,
  conversationId,
  messageToStreamId,
  isWaitingForResponse,
}: MessageListProps) {
  const clipboard = useClipboard();
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize feedbackMap from the messages data
  const [feedbackMap, setFeedbackMap] = useState<{
    [key: string]: "LIKE" | "DISLIKE" | null;
  }>(() =>
    messages.reduce((acc, message) => {
      acc[message.message_id] = message.feedback || null;
      return acc;
    }, {} as { [key: string]: "LIKE" | "DISLIKE" | null })
  );

  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const handleFeedback = async (
    messageId: string,
    feedback: "LIKE" | "DISLIKE"
  ) => {
    if (session?.accessToken) {
      try {
        await updateMessageFeedback(
          conversationId,
          messageId,
          feedback,
          session.accessToken
        );
        setFeedbackMap({ ...feedbackMap, [messageId]: feedback });
      } catch (error) {
        console.error("Failed to update feedback:", error);
      }
    }
  };

  const handleSpeakAloud = async (message: Message, messageId: string) => {
    let textContent = "";

    if (typeof message.answer.content === "string") {
      textContent = message.answer.content;
    } else if (
      Array.isArray(message.answer.content) ||
      typeof message.answer.content === "object"
    ) {
      textContent = JSON.stringify(message.answer.content);
    }

    try {
      if (isSpeaking === messageId && audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsSpeaking(null);
        return;
      }

      setIsSpeaking(messageId);

      const audioBlob = await callTextToSpeechApi(textContent);

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
        audioRef.current.play();

        audioRef.current.onended = () => {
          setIsSpeaking(null);
        };
      }
    } catch (error) {
      console.error("Error speaking aloud:", error);
      setIsSpeaking(null);
    }
  };

  const handleCopy = (message: Message) => {
    let textToCopy = "";
    if (typeof message.answer.content === "string") {
      textToCopy = message.answer.content;
    } else if (
      Array.isArray(message.answer.content) ||
      typeof message.answer.content === "object"
    ) {
      textToCopy = JSON.stringify(message.answer.content, null, 2);
    }
    clipboard.copy(textToCopy);
  };

  return (
    <>
      {messages.map((message, index) => {
        return (
          <div key={message.message_id}>
            {/* Render the question */}
            <Flex justify="flex-end" mb="md">
              {message.question.type === "AUDIO" ? (
                <audio controls>
                  <source
                    src={`data:audio/webm;base64,${message.question.content}`}
                    type="audio/webm"
                  />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <MessageCard
                  type="question"
                  content={message.question.content}
                  messageType={message.question.type}
                />
              )}
            </Flex>
            {message.answer && (

              <div
                onMouseEnter={() => setHoveredMessageId(message.message_id)}
                onMouseLeave={() => setHoveredMessageId(null)}
                style={{ position: "relative" }}
              >
                <Flex justify="flex-start">
                  <IconRobot
                    size={20}
                    style={{ marginRight: 10, marginTop: 3 }}
                  />
                  <MessageCard
                    type="answer"
                    content={message.answer.content}
                    messageType={message.answer.type}
                    generated_chart={message.answer.generated_chart}
                    shouldStream={
                      message.message_id === messageToStreamId &&
                      message.answer.type === "TEXT"
                    }
                  />

                </Flex>

                {hoveredMessageId === message.message_id &&
                  message.message_id !== "waiting" && (
                    <Paper withBorder w={"fit-content"} radius={"lg"} p={'0.3rem'} ml={'2.5rem'}>
                      <Group justify="left" gap={'xs'}>
                        <Tooltip label="Like" withArrow position="bottom">
                          <ActionIcon
                            bd={0}
                            variant={
                              feedbackMap[message.message_id] === "LIKE"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleFeedback(message.message_id, "LIKE")
                            }
                            size={"xs"}
                          >
                            <IconThumbUp />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Dislike" withArrow position="bottom">
                          <ActionIcon
                            bd={0}
                            variant={
                              feedbackMap[message.message_id] === "DISLIKE"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              handleFeedback(message.message_id, "DISLIKE")
                            }
                            size={"xs"}
                          >
                            <IconThumbDown />
                          </ActionIcon>
                        </Tooltip>

                        <Tooltip
                          label="Copy to clipboard"
                          withArrow
                          position="bottom"
                        >
                          <ActionIcon
                            onClick={() => handleCopy(message)}
                            color={clipboard.copied ? "green" : "gray"}
                            variant="outline"
                            bd={0}
                            size={"xs"}
                          >
                            <IconCopy />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip
                          label={
                            isSpeaking === message.message_id
                              ? "Stop"
                              : "Speak aloud"
                          }
                          withArrow
                          position="bottom"
                        >
                          <ActionIcon
                            variant="outline"
                            bd={0}
                            size={"xs"}
                            onClick={() =>
                              handleSpeakAloud(message, message.message_id)
                            }
                          >
                            {isSpeaking === message.message_id ? (
                              <IconVolumeOff />
                            ) : (
                              <IconVolume />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Paper>
                  )}
              </div>
            )}

          </div>
        );
      })}
      {isWaitingForResponse && (
        <div style={{ position: "relative" }}>
          <Flex justify="flex-start">
            <IconRobot size={20} style={{ marginRight: 10, marginTop: 3 }} />
            <TypingIndicator />
          </Flex>
        </div>
      )}
    </>
  );
}
