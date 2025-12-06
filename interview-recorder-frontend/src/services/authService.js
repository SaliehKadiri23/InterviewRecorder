import axios from '../utils/axios';

const TOKEN_KEY = 'interview_recorder_token';

// API service for authentication
const authService = {
  // Sign up a new user
  async signup(data) {
    const response = await axios.post('/api/auth/signup', data);
    return response.data;
  },

  // Login user
  async login(data) {
    const response = await axios.post('/api/auth/login', data);
    return response.data;
  },

  // Logout user
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  // Get current user info
  async getCurrentUser() {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  // Get token from storage
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  // Save token to storage
  setToken(token, rememberMe = false) {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }
};

export { authService };