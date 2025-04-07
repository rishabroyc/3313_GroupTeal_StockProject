// src/services/authService.ts

import { toast } from 'sonner';
import { sendCommand, parseResponse } from './socketService';

// Types
export interface AuthResponse {
  success: boolean;
  message: string;
  username?: string;
}

/**
 * Check if user is logged in
 * @returns boolean indicating if user is logged in
 */
export const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('username');
};

/**
 * Get current username
 * @returns string of current username or null if not logged in
 */
export const getCurrentUser = (): string | null => {
  return localStorage.getItem('username');
};

/**
 * Login user
 * @param username Username
 * @param password Password
 * @returns Promise resolving to login result
 */
export const login = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await sendCommand(`LOGIN|${username}|${password}`);
    
    // Check if the response contains the username
    // Assuming successful response format: "OK|Logged in|<username>"
    const parts = response.split('|');
    const isSuccess = parts[0] === 'OK';
    const returnedUsername = parts.length > 2 ? parts[2] : username;
    
    if (isSuccess) {
      // Store username in localStorage
      localStorage.setItem('username', returnedUsername);
      toast.success('Successfully signed in');
    }
    
    return {
      success: isSuccess,
      message: parts[1] || 'Login failed',
      username: returnedUsername
    };
  } catch (error) {
    toast.error('Failed to sign in. Is the server running?');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Register a new user
 * @param username Username
 * @param password Password
 * @returns Promise resolving to registration result
 */
export const register = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await sendCommand(`REGISTER|${username}|${password}`);
    const result = parseResponse(response);
    
    if (result.status === 'OK') {
      toast.success('Account created successfully');
    }
    
    return {
      success: result.status === 'OK',
      message: result.message
    };
  } catch (error) {
    toast.error('Failed to create account. Is the server running?');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Logout user
 * Removes user from localStorage and redirects to homepage
 */
export const logout = (): void => {
  localStorage.removeItem('username');
  // Clear any other auth-related data
  localStorage.removeItem('userProfile');
  
  toast.success('Logged out successfully');
};