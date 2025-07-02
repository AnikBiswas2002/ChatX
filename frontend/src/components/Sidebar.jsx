import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { Users } from 'lucide-react';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    isUsersLoading,
    setSelectedUser,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                selectedUser?._id === user._id ? 'bg-base-300 ring-1 ring-base-300' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.profilePic || '/avatar.png'}
                  alt={user.fullname}
                  className="size-12 object-cover rounded-full"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white" />
                )}
              </div>

              {/* Name + Status */}
              <div className="flex-1 min-w-0 text-left hidden lg:block">
                <div className="font-medium truncate">{user.fullname}</div>
                <div className={`text-sm ${isOnline ? 'text-green-500' : 'text-zinc-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          );
        })}

        {users.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
