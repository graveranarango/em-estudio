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

export const getDashboardData = async (): Promise<any> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/dashboard/data`, { headers });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return response.json();
};