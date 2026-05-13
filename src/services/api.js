import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const campaignService = {
  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  sendEmailCampaign: async (filePath) => {
    const response = await api.post('/send-emails-from-csv', {
      file_path: filePath
    });
    return response.data;
  },

  sendSMSCampaign: async (filePath) => {
    const response = await api.post('/send-sms-from-csv/', {
      file_path: filePath
    });
    return response.data;
  },

  sendWhatsAppCampaign: async (filePath) => {
    const response = await api.post('/send-whatsapp-from-csv/', {
      file_path: filePath
    });
    return response.data;
  },

  getTrackingInfo: async () => {
    const response = await api.get('/get-tracking-info/');
    return response.data;
  },

  getWhatsAppTrackingInfo: async () => {
    const response = await api.get('/get-whatsapp-tracking-info/');
    return response.data;
  }
};

export default api;