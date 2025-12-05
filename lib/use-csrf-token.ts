// import { useEffect, useState } from 'react';
// import { ensureCSRFToken } from './csrf-token';

// export const useCSRFToken = () => {
//   const [csrfToken, setCsrfToken] = useState<string>('');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const token = await ensureCSRFToken();
//         setCsrfToken(token);
//       } catch (error) {
//         console.error('Failed to fetch CSRF token:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchToken();
//   }, []);

//   return { csrfToken, isLoading };
// };




import { useEffect, useState } from 'react';
import { fetchCSRFToken } from './csrf-token';

export const useCSRFToken = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCSRFToken()
      .then(setToken)
      .finally(() => setLoading(false));
  }, []);

  return { token, loading };
};