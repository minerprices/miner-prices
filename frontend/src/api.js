import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authAPI = {
  register: (email, password, companyName, contactName, contactPhone, website) =>
    api.post('/auth/register', {
      email,
      password,
      companyName,
      contactName,
      contactPhone,
      website,
    }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

// Miners endpoints
export const minersAPI = {
  getAll: (algorithm, search) =>
    api.get('/miners', { params: { algorithm, search } }),
  getOne: (id) =>
    api.get(`/miners/${id}`),
  getProfitability: (id) =>
    api.get(`/miners/${id}/profitability`),
  getAlgorithms: () =>
    api.get('/miners/api/algorithms'),
};

// Locations endpoints
export const locationsAPI = {
  getAll: (country, algorithm) =>
    api.get('/locations', { params: { country, algorithm } }),
  getOne: (id) =>
    api.get(`/locations/${id}`),
  getVendorLocations: () =>
    api.get('/locations/vendor/me'),
  create: (data) =>
    api.post('/locations', data),
  update: (id, data) =>
    api.put(`/locations/${id}`, data),
  delete: (id) =>
    api.delete(`/locations/${id}`),
};

// Admin endpoints
export const adminAPI = {
  getPendingVendors: () =>
    api.get('/admin/vendors/pending'),
  getAllVendors: () =>
    api.get('/admin/vendors'),
  approveVendor: (vendorId, reason) =>
    api.post(`/admin/vendors/${vendorId}/approve`, { reason }),
  rejectVendor: (vendorId, reason) =>
    api.post(`/admin/vendors/${vendorId}/reject`, { reason }),
  getSyncLogs: () =>
    api.get('/admin/sync-logs'),
  getStats: () =>
    api.get('/admin/stats'),
  syncMiners: () =>
    api.post('/admin/sync-miners'),
};
