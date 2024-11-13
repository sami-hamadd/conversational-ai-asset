import axiosInstance from "@/api/services/axiosInstance";

// Create a new conversation
export const createConversation = async (title: string, token: string) => {
    const response = await axiosInstance.post(
        '/api/v1/conversations/',
        { title },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

// Fetch all conversations
export const getConversations = async (token: string) => {
    const response = await axiosInstance.get(
        '/api/v1/conversations/',
        {
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



// Delete a conversation
export async function deleteConversation(conversationId: string, token: string) {
    try {
        const response = await axiosInstance.delete(
            `/api/v1/conversations/${conversationId}/`,
            {
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