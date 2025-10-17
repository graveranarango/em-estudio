import { auth } from '../firebase';

const API_BASE = '/api';

const getAuthHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  const token = await user.getIdToken();
  return {
    'Authorization': `Bearer ${token}`
  };
};

export const getGoogleAuthUrl = async (): Promise<{ authUrl: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/google/auth/url`, { headers });

  if (!response.ok) {
    throw new Error('Failed to get Google Auth URL');
  }
  return response.json();
};