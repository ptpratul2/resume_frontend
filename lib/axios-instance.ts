// import axios from 'axios';
// import { API_BASE_URL } from './api-config';
// import { getCSRFToken } from './csrf-token';

// const axiosInstance = axios.create({
//     baseURL: API_BASE_URL,
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// axiosInstance.interceptors.request.use((config) => {
//     const token = getCSRFToken();
//     if (token) {
//         config.headers['X-Frappe-CSRF-Token'] = token;
//     }
//     return config;
// });

// export default axiosInstance;


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

axiosInstance.interceptors.request.use(
    (config) => {
        const token = getCSRFToken();
        if (token) {
            config.headers['X-Frappe-CSRF-Token'] = token;
        }

        // IMPORTANT: Remove Content-Type for FormData uploads
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403 &&
            error.response?.data?.exception?.includes('CSRFTokenError')) {
            console.error('CSRF Token Error - Please refresh the page');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
