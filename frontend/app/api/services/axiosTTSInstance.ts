import axios from 'axios';

// Create a separate instance for the Text-to-Speech API
const axiosTTSInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_GENAI_URL || 'http://localhost:8080', // Use environment variable or fallback to localhost
});

// Example of adding request verification if needed (e.g., token authentication)
axiosTTSInstance.interceptors.request.use(
    (config) => {
        // Add authorization token or other verification if needed
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosTTSInstance;
