// Centralized API configuration
// Using NEXT_PUBLIC_ prefix makes env vars available on both server and client
export const getApiBaseUrl = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return '';
  }
  return process.env.
   || 'https://ats.octavision.in';
};

export const getFrappeBaseUrl = (): string => {
  return getApiBaseUrl();
};

export const API_BASE_URL = getApiBaseUrl();
export const FRAPPE_BASE_URL = getApiBaseUrl();

