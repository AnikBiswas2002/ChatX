import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // Fetch all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get('/messages/users');
      set({ users: res.data });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Fetch chat messages
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send new message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      // Emit to socket if needed
      const socket = useAuthStore.getState().socket;
      socket?.emit("sendMessage", res.data);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  // Realtime message subscription via socket.io
  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    const { selectedUser, messages } = get();

    if (!socket || !selectedUser) return;

    socket.on("newMessage", (newMsg) => {
      // Only push message if it's from or to the selected user
      if (
        newMsg.senderId === selectedUser._id ||
        newMsg.receiverId === selectedUser._id
      ) {
        set({ messages: [...get().messages, newMsg] });
      }
    });

    console.log(" Subscribed to messages for:", selectedUser.fullname);
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
      console.log("Unsubscribed from real-time messages");
    }
  },
}));
