import { auth } from '../firebase';

const API_BASE = '/api'; // Assuming a proxy is set up in vite.config.ts

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

export const generateImage = async (prompt: string): Promise<{ imageUrl: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/image/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate image');
  }

  return response.json();
};