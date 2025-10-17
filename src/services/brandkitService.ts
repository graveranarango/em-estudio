import { auth } from '../firebase';

const API_BASE = '/api';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getBrandKit = async (): Promise<any> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/brandkit/get`, { headers });

  if (!response.ok) {
    throw new Error('Failed to get BrandKit');
  }
  return response.json();
};

export const updateBrandKit = async (data: any): Promise<any> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/brandkit/update`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update BrandKit');
  }
  return response.json();
};