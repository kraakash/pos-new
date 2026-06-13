export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Map '/user/...' paths to backend '/users/...' paths
  let apiPath = endpoint;
  if (apiPath.startsWith('/user/')) {
    apiPath = apiPath.replace('/user/', '/users/');
  } else if (apiPath === '/user') {
    apiPath = '/users';
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  
  const response = await fetch(`${baseUrl}${apiPath}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

/**
 * Sends a multipart/form-data request (for uploading files like PDFs) to the backend.
 * 
 * @param {string} endpoint - API path (e.g. /resume/analyze)
 * @param {FormData} formData - FormData payload containing the file and parameters
 * @returns {Promise<any>} - JSON response promise
 */
export async function apiFormData(endpoint, formData) {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'File upload failed');
  }

  return data;
}
