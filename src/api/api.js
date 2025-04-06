import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Device API calls
export const deviceApi = {
  getAllDevices: () => axios.get(`${API_URL}/devices`),
  getDevice: (id) => axios.get(`${API_URL}/devices/${id}`),
  createDevice: (data) => axios.post(`${API_URL}/devices`, data),
  updateDevice: (id, data) => axios.put(`${API_URL}/devices/${id}`, data),
  deleteDevice: (id) => axios.delete(`${API_URL}/devices/${id}`),
};

// Energy Data API calls
export const energyApi = {
  getDeviceData: (deviceId) => axios.get(`${API_URL}/energy-data/device/${deviceId}`),
  getLatestData: (deviceId) => axios.get(`${API_URL}/energy-data/device/${deviceId}/latest`),
  getTotalUsage: () => axios.get(`${API_URL}/energy-data/user/total-usage`),
};
