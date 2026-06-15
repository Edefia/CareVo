import { apiClient } from '../client';

export interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  pillarIcon: 'CARDIO' | 'RENAL' | 'METABOLIC' | 'COMPREHENSIVE';
  color: string;
  bgColor: string;
  isActive: boolean;
}

export const packageService = {
  getPackages: async (): Promise<Package[]> => {
    const response = await apiClient.get('/packages');
    return response.data.data;
  },
};
