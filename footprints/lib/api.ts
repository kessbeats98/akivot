import axios from 'axios';
import { User, Dog, Walk, PaymentPeriod, WalkMedia } from '@/types';

// Create an Axios instance configured for Better Auth (HTTP-only cookies)
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial for sending the HTTP-only session cookie
});

// --- Auth ---
export const getSession = async (): Promise<User | null> => {
  try {
    const { data } = await api.get<User>('/auth/session');
    return data;
  } catch (error) {
    return null;
  }
};

// --- Walks ---
export const getWalks = async (params?: { month?: string; year?: string; walkerId?: string; ownerId?: string }): Promise<Walk[]> => {
  const { data } = await api.get<Walk[]>('/walks', { params });
  return data;
};

export const getWalkById = async (walkId: string): Promise<Walk> => {
  const { data } = await api.get<Walk>(`/walks/${walkId}`);
  return data;
};

export const startWalk = async (walkId: string): Promise<Walk> => {
  const { data } = await api.post<Walk>(`/walks/${walkId}/start`);
  return data;
};

export const completeWalk = async (walkId: string, notes?: string): Promise<Walk> => {
  const { data } = await api.post<Walk>(`/walks/${walkId}/complete`, { notes });
  return data;
};

// --- Dogs ---
export const getDogs = async (params?: { ownerId?: string; walkerId?: string }): Promise<Dog[]> => {
  const { data } = await api.get<Dog[]>('/dogs', { params });
  return data;
};

// --- Media Uploads ---
export const uploadWalkMedia = async (walkId: string, file: File): Promise<{ blobUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('walkId', walkId);

  const { data } = await api.post<{ blobUrl: string }>('/uploads/walk-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// --- Payments ---
export const getPaymentPeriods = async (params?: { ownerId?: string; walkerId?: string; status?: 'OPEN' | 'CLOSED' }): Promise<PaymentPeriod[]> => {
  const { data } = await api.get<PaymentPeriod[]>('/payments/periods', { params });
  return data;
};

export const closePaymentPeriod = async (periodId: string): Promise<PaymentPeriod> => {
  const { data } = await api.post<PaymentPeriod>(`/payments/periods/${periodId}/close`);
  return data;
};
