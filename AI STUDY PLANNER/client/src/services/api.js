import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  // This log will tell us if the browser can actually see your token
  console.log("Interceptor checking storage. Token found:", token ? "YES ✅" : "NO ❌");

  if (token) {
    // Some versions of axios require config.headers.set or direct assignment
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const loginUser = (formData) => API.post('/auth/login', formData);
export const signupUser = (formData) => API.post('/auth/signup', formData);
export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
// Function to get AI-generated task breakdown
export const getAiTaskBreakdown = (projectData) => API.post('/ai/breakdown', projectData);
// Fetch all calendar events
export const getSchedules = () => API.get('/schedules');

// Create a new calendar event
export const createSchedule = (scheduleData) => API.post('/schedules', scheduleData);

export default API;