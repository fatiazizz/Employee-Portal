import axios from 'axios';

// تابعی برای خواندن مقدار یک کوکی خاص
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()!.split(';').shift()!);
  }
  return null;
}

// Use relative URL so requests go to the same origin as the page (avoids localhost vs 127.0.0.1 mismatch)
const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    Accept: 'application/json',
  },
});

// در هر درخواست، XSRF-TOKEN را از کوکی بخوان و در هدر قرار بده
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token) {
    config.headers['X-XSRF-TOKEN'] = token;
  }
  return config;
});

export default api;
