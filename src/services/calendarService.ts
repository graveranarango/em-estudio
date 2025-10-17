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

export const getCalendarEvents = async (): Promise<{ events: any[] }> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}/calendar/events`, { headers });

  if (!response.ok) {
    if (response.status === 401) {
      // This specific error can be caught to prompt the user to reconnect
      throw new Error('Google token expired or revoked.');
    }
    throw new Error('Failed to get calendar events');
  }
  return response.json();
};