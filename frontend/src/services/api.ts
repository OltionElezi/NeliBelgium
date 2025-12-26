import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API helper functions
export const clientApi = {
  getAll: () => api.get('/clients'),
  getById: (id: number) => api.get(`/clients/${id}`),
  create: (data: any) => api.post('/clients', data),
  update: (id: number, data: any) => api.put(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`)
};

export const invoiceApi = {
  getAll: (params?: any) => api.get('/invoices', { params }),
  getById: (id: number) => api.get(`/invoices/${id}`),
  create: (data: any) => api.post('/invoices', data),
  update: (id: number, data: any) => api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  getPdf: (id: number, lang?: string) => api.get(`/invoices/${id}/pdf`, {
    params: { lang },
    responseType: 'blob'
  }),
  send: (id: number, email?: string, lang?: string) => api.post(`/invoices/${id}/send`, { email, lang }),
  updateStatus: (id: number, status: string) => api.patch(`/invoices/${id}/status`, { status })
};

export const workerApi = {
  getAll: () => api.get('/workers'),
  getById: (id: number) => api.get(`/workers/${id}`),
  create: (data: any) => api.post('/workers', data),
  update: (id: number, data: any) => api.put(`/workers/${id}`, data),
  delete: (id: number) => api.delete(`/workers/${id}`)
};

export const expenseApi = {
  getAll: (params?: any) => api.get('/expenses', { params }),
  getByWorker: (workerId: number, params?: any) => api.get(`/workers/${workerId}/expenses`, { params }),
  create: (workerId: number, data: any) => api.post(`/workers/${workerId}/expenses`, data),
  update: (id: number, data: any) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`)
};

export const trashApi = {
  getAll: () => api.get('/trash'),
  restore: (type: string, id: number) => api.post(`/trash/${type}/${id}/restore`),
  permanentDelete: (type: string, id: number) => api.delete(`/trash/${type}/${id}`),
  empty: () => api.delete('/trash')
};

export const companyApi = {
  get: () => api.get('/company'),
  update: (data: any) => api.put('/company', data),
  uploadLogo: (logo: string) => api.post('/company/logo', { logo })
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const productApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: number, data: any) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  updateStock: (id: number, quantity: number, operation?: string) =>
    api.patch(`/products/${id}/stock`, { quantity, operation })
};

export const companyExpenseApi = {
  getAll: (params?: any) => api.get('/company-expenses', { params }),
  getSummary: (params?: any) => api.get('/company-expenses/summary', { params }),
  getById: (id: number) => api.get(`/company-expenses/${id}`),
  create: (data: any) => api.post('/company-expenses', data),
  update: (id: number, data: any) => api.put(`/company-expenses/${id}`, data),
  delete: (id: number) => api.delete(`/company-expenses/${id}`)
};

export const electricalProjectApi = {
  getAll: (params?: { clientId?: number }) => api.get('/electrical-projects', { params }),
  getById: (id: number) => api.get(`/electrical-projects/${id}`),
  create: (data: { name: string; clientId: number; description?: string; address?: string }) =>
    api.post('/electrical-projects', data),
  update: (id: number, data: { name?: string; description?: string; address?: string }) =>
    api.put(`/electrical-projects/${id}`, data),
  delete: (id: number) => api.delete(`/electrical-projects/${id}`),
  duplicate: (id: number) => api.post(`/electrical-projects/${id}/duplicate`),
  // Diagram operations
  addDiagram: (projectId: number, data: { name: string; type: string; diagramData?: any }) =>
    api.post(`/electrical-projects/${projectId}/diagrams`, data),
  updateDiagram: (projectId: number, diagramId: number, data: { name?: string; diagramData?: any; pageIndex?: number }) =>
    api.put(`/electrical-projects/${projectId}/diagrams/${diagramId}`, data),
  deleteDiagram: (projectId: number, diagramId: number) =>
    api.delete(`/electrical-projects/${projectId}/diagrams/${diagramId}`),
  // PDF export (to be implemented)
  getPdf: (id: number) => api.get(`/electrical-projects/${id}/pdf`, { responseType: 'blob' })
};
