import api from '../api';

export const notificationAPI = {
  getAll: () => api.get('/auth/notifications/'),
  get: (id) => api.get(`/auth/notifications/${id}/`),
  markAsRead: (id) => api.patch(`/auth/notifications/${id}/mark-as-read/`),
  getUnreadCount: () => api.get('/auth/notifications/unread-count/'),
  delete: (id) => api.delete(`/auth/notifications/${id}/`),
};