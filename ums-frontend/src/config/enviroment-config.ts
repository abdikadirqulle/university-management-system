// Environment configuration

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// API URLs
const API_URL = {
  development: 'http://localhost:5000/api',
  production: 'https://university-management-system-4ka6.onrender.com/api'
};

// Config object
const config = {
  apiUrl: isProduction ? API_URL.production : API_URL.development,
  isProduction,
  appName: 'University Management System',
};

export default config;
