// export const axiosConfig = {
//     withCredentials: true,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// }

// export const axiosConfigMultipart = {
//     withCredentials: true,
//     headers: {},
// }



import { getCSRFToken } from './csrf-token'

// Helper to get config with CSRF token
export const getAxiosConfig = () => ({
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Frappe-CSRF-Token': getCSRFToken(),
    },
})

export const getAxiosConfigMultipart = () => ({
    withCredentials: true,
    headers: {
        'X-Frappe-CSRF-Token': getCSRFToken(),
    },
})

// Legacy exports (deprecated - use functions above)
export const axiosConfig = {
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
}

export const axiosConfigMultipart = {
    withCredentials: true,
    headers: {},
}