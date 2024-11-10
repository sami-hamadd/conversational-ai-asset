import axiosInstance from "@/api/services/axiosInstance";
import axiosTTSInstance from "@/api/services/axiosTTSInstance";

// Fetch all conversations
export const getConversations = async (token: string) => {
    const response = await axiosInstance.get('/conversations/', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.conversations.map((convo: any) => ({
        conversation_id: convo.conversation_id,
        title: convo.title,
        last_interaction: convo.last_interaction
    }));
};

// Fetch messages for a specific conversation
export const getMessages = async (conversationId: string, token: string) => {
    const response = await axiosInstance.get(`/conversations/${conversationId}/messages/`, {
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
        `/create_message_text/${conversationId}/`,
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
        `/create_message_audio/${conversationId}/`,
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

// Create a new conversation
export const createConversation = async (title: string, token: string) => {
    const response = await axiosInstance.post(
        '/create_conversation/',
        { title },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Delete a conversation
export async function deleteConversation(conversationId: string, token: string) {
    try {
        const response = await axiosInstance.delete(`/delete_conversation/${conversationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        throw new Error('Error deleting conversation');
    }
}

// Update message feedback
export const updateMessageFeedback = async (conversationId: string, messageId: string, feed: 'LIKE' | 'DISLIKE', token: string) => {
    try {
        const response = await axiosInstance.put(
            `/conversations/${conversationId}/messages/${messageId}/feedback`,
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

// Call the Text-to-Speech API
export const callTextToSpeechApi = async (text: string) => {
    try {
        const response = await axiosTTSInstance.post(
            '/speech/text-to-speech',
            { text: text },
            { responseType: 'blob' }
        );
        return response.data;
    } catch (error) {
        console.error("Error calling Text-to-Speech API:", error);
        throw error;
    }
};