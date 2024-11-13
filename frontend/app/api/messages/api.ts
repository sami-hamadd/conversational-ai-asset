import axiosInstance from "../services/axiosInstance";

// Fetch messages for a specific conversation
export const getMessages = async (conversationId: string, token: string) => {
    const response = await axiosInstance.get(`/api/v1/conversations/${conversationId}/messages/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data.messages.map((message: any) => ({
        message_id: message.message_id,
        question: {
            type: message.question.type,
            content: message.question.content,
        },
        answer: {
            type: message.answer.type,
            content: message.answer.content,
            generated_chart: message.answer.generated_chart,
        },
        timestamp: message.timestamp,
        feedback: message.feedback || null,
    }));
};

// Send text message
export const sendMessageText = async (conversationId: string, questionContent: string, token: string) => {
    const response = await axiosInstance.post(
        `/api/v1/conversations/${conversationId}/text/`,
        {
            question: {
                type: 'TEXT',
                content: questionContent,
            }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Send audio message
export const sendMessageAudio = async (conversationId: string, base64Audio: string, token: string) => {
    const response = await axiosInstance.post(
        `/api/v1/conversations/${conversationId}/audio/`,
        {
            question: {
                type: 'AUDIO',
                content: base64Audio,
            }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};



// Update message feedback
export const updateMessageFeedback = async (conversationId: string, messageId: string, feed: 'LIKE' | 'DISLIKE', token: string) => {
    try {
        const response = await axiosInstance.put(
            `/api/v1/conversations/${conversationId}/messages/${messageId}/feedback/`,
            { feedback: feed },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating feedback:', error);
        throw error;
    }
};
