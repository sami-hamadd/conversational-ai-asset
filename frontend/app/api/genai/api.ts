import axiosTTSInstance from "../services/axiosTTSInstance";

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