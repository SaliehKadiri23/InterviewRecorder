export const config = { 
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
  appName: import.meta.env.VITE_APP_NAME || 'Interview Recorder', 
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0', 
  isDevelopment: import.meta.env.DEV, 
  isProduction: import.meta.env.PROD 
};