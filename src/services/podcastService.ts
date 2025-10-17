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

export const generatePodcast = async (script: string): Promise<{ audioUrl: string }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/podcast/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ script }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate podcast');
  }

  return response.json();
};