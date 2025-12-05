import axios from 'axios';
import { API_BASE_URL } from './api-config';
import { getCSRFToken } from './csrf-token';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = getCSRFToken();
    if (token) {
        config.headers['X-Frappe-CSRF-Token'] = token;
    }
    return config;
});

export default axiosInstance;
