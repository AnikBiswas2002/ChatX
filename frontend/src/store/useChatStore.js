import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthStore';

let subscribedUserId = null;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  // ✅ Fetch all users
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

  // ✅ Fetch messages with selected user
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

  // ✅ Send a message (via API + socket)
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser?._id) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });

      const socket = useAuthStore.getState().socket;
      socket?.emit("sendMessage", res.data);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  // ✅ Select a user + setup live updates
  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [] });
    get().unsubscribeFromMessages();       // clean old
    get().subscribeToMessages();           // setup new
    get().getMessages(user._id);           // fetch chat
  },

  // ✅ Socket message listener
  subscribeToMessages: () => {
    const { socket } = useAuthStore.getState();
    const { selectedUser } = get();

    if (!socket || !selectedUser) return;
    if (subscribedUserId === selectedUser._id) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMsg) => {
      if (
        newMsg.senderId === selectedUser._id ||
        newMsg.receiverId === selectedUser._id
      ) {
        set({ messages: [...get().messages, newMsg] });
      }
    });

    subscribedUserId = selectedUser._id;
    console.log("✅ Subscribed to real-time messages for:", selectedUser.fullname);
  },

  // ✅ Clean listener
  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (socket) {
      socket.off("newMessage");
      subscribedUserId = null;
      console.log("🔌 Unsubscribed from messages");
    }
  },
}));
