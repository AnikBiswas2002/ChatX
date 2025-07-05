import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const BASE_URL = import.meta.env.MODE==="development"? "http://localhost:5001":"/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // ✅ Check if user is logged in
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check', {
        withCredentials: true,
      });
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.error('Error checking auth:', error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ✅ Signup logic
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await axiosInstance.post('/auth/signup', data, {
        withCredentials: true,
      });
      await get().checkAuth();
      toast.success('Account created successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ✅ Login logic
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      await axiosInstance.post('/auth/login', data, {
        withCredentials:true,
      });
      await get().checkAuth();
      toast.success('Logged in successfully');
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ✅ Logout logic
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, { withCredentials: true });
      set({ authUser: null });
      toast.success('Logged out successfully');
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to log out');
    }
  },

  // ✅ Update profile (image/fullName)
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      await axiosInstance.put('/auth/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      await get().checkAuth();
      toast.success('Profile updated!');
    } catch (error) {
      console.error(error.response || error);
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ✅ Connect socket and manage online users
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    socket.on('onlineUsers', (onlineUsers) => {
      set({ onlineUsers });
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Socket disconnected');
      set({ onlineUsers: [] });
    });

    set({ socket });
  },

  // ✅ Disconnect socket
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
