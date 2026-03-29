import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
 baseURL: 'http://localhost:3000', // Adjust to match your backend port
 headers: {
 'Content-Type': 'application/json',
 },
});

api.interceptors.request.use((config) => {
 const token = useAuthStore.getState().token;
 if (token && config.headers) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

// Optionally handle global 401s
api.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 useAuthStore.getState().logout();
 }
 return Promise.reject(error);
 }
);
