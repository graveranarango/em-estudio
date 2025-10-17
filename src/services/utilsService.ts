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

export const recursiveDelete = async (path: string): Promise<{ success: boolean }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/utils/recursive-delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to perform recursive delete');
  }

  return response.json();
};