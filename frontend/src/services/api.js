const pageTitle = 'Local Skill Development & Employment Portal';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${apiBase}${endpoint}`, {
    ...options,
    headers: {
      ...buildHeaders(token),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

export const authService = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
};

export const jobsService = {
  getAll: () => request('/jobs'),
  create: (payload) => request('/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  apply: (jobId) => request(`/jobs/${jobId}/apply`, { method: 'POST' }),
};

export const coursesService = {
  getAll: () => request('/courses'),
  create: (payload) => request('/courses', { method: 'POST', body: JSON.stringify(payload) }),
  enroll: (courseId) => request(`/courses/${courseId}/enroll`, { method: 'POST' }),
};

export const adminService = {
  getPending: () => request('/admin/pending'),
  approveJob: (jobId) => request(`/admin/jobs/${jobId}/approve`, { method: 'PATCH' }),
  approveCourse: (courseId) => request(`/admin/courses/${courseId}/approve`, { method: 'PATCH' }),
};

export { pageTitle };
