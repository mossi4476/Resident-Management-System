import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, role?: string) =>
    api.post('/auth/register', { email, password, role }),
  getProfile: () => api.get('/users/profile'),
}

export const residentsApi = {
  getAll: () => api.get('/residents'),
  getById: (id: string) => api.get(`/residents/${id}`),
  create: (data: any) => api.post('/residents', data),
  update: (id: string, data: any) => api.patch(`/residents/${id}`, data),
  delete: (id: string) => api.delete(`/residents/${id}`),
  getStats: () => api.get('/residents/stats'),
}

export const complaintsApi = {
  getAll: (filters?: any) => api.get('/complaints', { params: filters }),
  getMyComplaints: () => api.get('/complaints/my-complaints'),
  getById: (id: string) => api.get(`/complaints/${id}`),
  create: (data: any) => api.post('/complaints', data),
  update: (id: string, data: any) => api.patch(`/complaints/${id}`, data),
  delete: (id: string) => api.delete(`/complaints/${id}`),
  addComment: (id: string, content: string) => api.post(`/complaints/${id}/comments`, { content }),
  getStats: () => api.get('/complaints/stats'),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

export default api
