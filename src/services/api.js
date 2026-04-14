const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Headers sem Content-Type (browser define automaticamente com boundary para FormData)
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Erro desconhecido.' }));
    throw error;
  }
  if (res.status === 204) return null;
  return res.json();
};

export const api = {
  get: (endpoint) =>
    fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() }).then(handleResponse),

  post: (endpoint, body) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (endpoint, body) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (endpoint, body) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  // Upload de arquivo (produto com imagem)
  postForm: (endpoint, formData) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    }).then(handleResponse),

  patchForm: (endpoint, formData) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: formData,
    }).then(handleResponse),

  delete: (endpoint) =>
    fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};
