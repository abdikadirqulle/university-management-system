import { api } from "./api";

export interface UniversitySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface SystemSettings {
  theme: string;
  language: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

export const settingsService = {
  // University Settings
  getUniversitySettings: async (): Promise<UniversitySettings> => {
    const response = await api.get("/settings/university");
    return response.data;
  },

  updateUniversitySettings: async (
    settings: UniversitySettings,
  ): Promise<UniversitySettings> => {
    const response = await api.put("/settings/university", settings);
    return response.data;
  },

  // System Settings
  getSystemSettings: async (): Promise<SystemSettings> => {
    const response = await api.get("/settings/system");
    return response.data;
  },

  updateSystemSettings: async (
    settings: SystemSettings,
  ): Promise<SystemSettings> => {
    const response = await api.put("/settings/system", settings);
    return response.data;
  },
};

export default settingsService;
