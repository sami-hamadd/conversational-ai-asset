import axios from 'axios';

export async function signUp(data: { username: string; password: string }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    try {
        const response = await axios.post(`${apiUrl}/sign_up/`, data);
        return response.data;
    } catch (error: any) {
        if (error.response?.data?.detail === "Username already registered") {
            return { error: "Username is already registered." };
        }
        return { error: error.response?.data?.detail || 'Failed to register user' };
    }
}

