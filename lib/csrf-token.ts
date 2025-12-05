// import { API_BASE_URL } from './api-config';

// // CSRF Token utility for Frappe API calls
// export const getCSRFToken = (): string => {
//   if (typeof window === 'undefined') {
//     return '';
//   }

//   // Frappe CSRF token cookie name is 'frappe-csrf-token'
//   const cookieNames = ['frappe-csrf-token', 'csrftoken', 'csrf_token', 'csrf-token'];

//   for (const cookieName of cookieNames) {
//     // Try exact match first
//     let csrfMatch = document.cookie.match(new RegExp(`(^|; )${cookieName}=([^;]+)`));

//     if (csrfMatch && csrfMatch[2]) {
//       return decodeURIComponent(csrfMatch[2]).trim();
//     }

//     // Try case-insensitive match
//     const cookies = document.cookie.split(';');
//     for (const cookie of cookies) {
//       const [name, value] = cookie.trim().split('=');
//       if (name && name.toLowerCase() === cookieName.toLowerCase()) {
//         return decodeURIComponent(value || '').trim();
//       }
//     }
//   }

//   return '';
// };

// export const getCSRFHeaders = (): Record<string, string> => {
//   const csrfToken = getCSRFToken();
//   const headers: Record<string, string> = {};

//   if (csrfToken) {
//     headers['X-Frappe-CSRF-Token'] = csrfToken;
//   }

//   return headers;
// };

// // Ensure CSRF token is available - fetch from server if needed
// export const ensureCSRFToken = async (): Promise<string> => {
//   if (typeof window === 'undefined') {
//     return '';
//   }

//   // Check if already in cookies
//   let token = getCSRFToken();
//   if (token) {
//     console.log('CSRF token found in cookies:', token.substring(0, 10) + '...');
//     return token;
//   }

//   console.log('CSRF token not in cookies, fetching from server...');
//   console.log('Current cookies:', document.cookie);

//   // Try to fetch from server - make a GET request to trigger CSRF token cookie
//   try {
//     const apiBaseUrl = API_BASE_URL;

//     // Method 1: Try frappe.auth.get_logged_user - this endpoint sets CSRF token cookie
//     let response = await fetch(`${apiBaseUrl}/api/method/frappe.auth.get_logged_user`, {
//       method: 'GET',
//       credentials: 'include',
//       headers: {
//         'Accept': 'application/json',
//       },
//     });

//     console.log('frappe.auth.get_logged_user response status:', response.status);

//     if (response.ok) {
//       // Check cookies after request
//       token = getCSRFToken();
//       console.log('CSRF token after get_logged_user:', token ? token.substring(0, 10) + '...' : 'not found');
//       console.log('Cookies after request:', document.cookie);

//       if (token) {
//         return token;
//       }

//       // Try to get from response headers
//       const csrfHeader = response.headers.get('X-Frappe-CSRF-Token');
//       if (csrfHeader) {
//         console.log('CSRF token found in response header');
//         return csrfHeader.trim();
//       }
//     }

//     // Method 2: Try a simple GET request to any API endpoint
//     response = await fetch(`${apiBaseUrl}/api/resource/Company?limit_page_length=1`, {
//       method: 'GET',
//       credentials: 'include',
//       headers: {
//         'Accept': 'application/json',
//       },
//     });

//     console.log('Company resource response status:', response.status);

//     if (response.ok) {
//       token = getCSRFToken();
//       console.log('CSRF token after Company request:', token ? token.substring(0, 10) + '...' : 'not found');
//       console.log('Cookies after Company request:', document.cookie);

//       if (token) {
//         return token;
//       }

//       // Check response headers for CSRF token
//       const csrfHeader = response.headers.get('X-Frappe-CSRF-Token');
//       if (csrfHeader) {
//         console.log('CSRF token found in Company response header');
//         return csrfHeader.trim();
//       }
//     }

//     // Method 3: Try to get from any response header
//     const allHeaders = Array.from(response.headers.entries());
//     console.log('All response headers:', allHeaders);

//   } catch (error) {
//     console.error('Failed to fetch CSRF token:', error);
//   }

//   console.warn('CSRF token not found after all attempts');
//   return '';
// };

// // Fetch CSRF token from server if not available in cookies
// export const fetchCSRFToken = async (): Promise<string> => {
//   if (typeof window === 'undefined') {
//     return '';
//   }

//   // Check if already in cookies
//   const existingToken = getCSRFToken();
//   if (existingToken) {
//     return existingToken;
//   }

//   try {
//     // Try to get CSRF token from session info
//     const response = await fetch(`${API_BASE_URL}/api/method/frappe.sessions.get_session_info`, {
//       method: 'GET',
//       credentials: 'include',
//     });

//     if (response.ok) {
//       const data = await response.json();
//       // CSRF token might be in the response or set as cookie
//       const token = getCSRFToken();
//       if (token) {
//         return token;
//       }
//     }
//   } catch (error) {
//     console.warn('Failed to fetch CSRF token:', error);
//   }

//   return '';
// };







import { API_BASE_URL } from './api-config';

export const getCSRFToken = (): string => {
  if (typeof window === 'undefined') return '';

  // Try different cookie names
  const names = ['csrf_token', 'frappe-csrf-token', 'csrftoken'];

  for (const name of names) {
    const match = document.cookie.match(new RegExp(`(^|; )${name}=([^;]+)`));
    if (match) return decodeURIComponent(match[2]).trim();
  }

  return '';
};

export const fetchCSRFToken = async (): Promise<string> => {
  if (typeof window === 'undefined') return '';

  try {
    // Make a GET request to trigger cookie setting
    await fetch(`${API_BASE_URL}/api/method/frappe.auth.get_logged_user`, {
      credentials: 'include',
    });

    return getCSRFToken();
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return '';
  }
};
