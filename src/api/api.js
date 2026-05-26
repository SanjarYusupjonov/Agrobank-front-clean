import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

export const departmentAPI = {
  getAll: (name) => api.get('/department/getAll', {
    params: name ? { name } : {},
  }),
};

export const departmentHeadsAPI = {
  getAll: ({ page = 0, size = 10, query, departmentId } = {}) => {
    const params = { page, size };
    if (query        !== undefined && query        !== '') params.query        = query;
    if (departmentId !== undefined && departmentId !== '') params.departmentId = departmentId;
    return api.get('/heads/getAllByFilter', { params });
  },
  create: (data) => api.post('/heads/create', data),
  delete: (id)   => api.delete(`/heads/delete/${id}`),
};

const cleanParams = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

export const attendanceAPI = {
  getTimeline: (params = {}) => {
    const { page = 0, size = 10, ...filters } = params;
    return api.get('/attendance/timeline', {
      params: { ...cleanParams(filters), page, size },
    });
  },

  getTimelineByEmployee: (params = {}) =>
    api.get('/attendance/getTimelineByEmployee', { params: cleanParams(params) }),

  getTimelineByDateRange: (params = {}) =>
    api.get('/attendance/timeline', { params: cleanParams(params) }),

  exportTimeline: (params = {}) => {
    const { page, size, ...filters } = params;
    return api.get('/excel/timeline/export', {
      params: cleanParams(filters),
      responseType: 'blob',
    });
  },

  exportEmployeeTimeline: (params = {}) =>
    api.get('/excel/getTimelineByEmployee/export', {
      params: cleanParams(params),
      responseType: 'blob',
    }),

  exportTimelinePdf: (params = {}) => {
    const { page, size, ...filters } = params;
    return api.get('/pdf/timeline/export', {
      params: cleanParams(filters),
      responseType: 'blob',
    });
  },

  exportEmployeeTimelinePdf: (params = {}) =>
    api.get('/pdf/getTimelineByEmployee/export', {
      params: cleanParams(params),
      responseType: 'blob',
    }),

  getAll: (page = 0, size = 10) =>
    api.get('/attendance/timeline', { params: { page, size } }),
};

export default api;
