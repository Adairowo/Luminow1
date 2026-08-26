import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      // Si el token expira o es inválido
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Si el usuario no tiene permisos (ej. admin intentando entrar al tenant)
      if (error.response?.status === 403 && error.response?.data?.message === 'Tenant no identificado.') {
        localStorage.removeItem('token');
        window.location.href = '/login?error=no_tenant';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
