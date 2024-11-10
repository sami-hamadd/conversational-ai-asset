import axios from 'axios';
import { signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';

// Create an instance of Axios
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

// Intercept responses
axiosInstance.interceptors.response.use(
    response => response, // Pass through successful responses
    async (error) => {
        // Check if it's a 401 error (Unauthorized)
        if (error.response?.status === 401) {
            // Sign out the user when token expires
            await signOut();
            // Redirect to the login page using `next/navigation`
            redirect('/login');
        }
        return Promise.reject(error); // Continue rejecting the error for further handling
    }
);

export default axiosInstance;