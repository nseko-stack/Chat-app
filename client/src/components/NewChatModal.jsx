import React, { useState, useEffect } from 'react';
import { userAPI, conversationAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import { Search, X, MessageSquarePlus, Loader2, UserPlus } from 'lucide-react';

export const NewChatModal = ({ isOpen, onClose, onSelectConversation }) => {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingChatId, setStartingChatId] = useState(null);
  const [error, setError] = useState(null);
  const { isUserOnline } = useSocket();

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setUsers([]);
      setError(null);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await userAPI.getUsers(search);
        setUsers(res.users || []);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 250);
    return () => clearTimeout(debounce);
  }, [isOpen, search]);

  const handleStartChat = async (targetUser) => {
    setStartingChatId(targetUser._id);
    try {
      const res = await conversationAPI.createConversation(targetUser._id);
      if (res.conversation) {
        onSelectConversation(res.conversation);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    } finally {
      setStartingChatId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg glass-dropdown rounded-3xl p-6 relative border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">New Conversation</h2>
              <p className="text-xs text-slate-400">Search and message people across the platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative my-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            autoFocus
          />
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-xs">Finding people...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-300">No users found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching with a different username or email</p>
            </div>
          ) : (
            users.map((u) => {
              const isOnline = isUserOnline(u._id);
              const isStarting = startingChatId === u._id;

              return (
                <div
                  key={u._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 hover:border-indigo-500/30 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={u.username}
                      src={u.avatar}
                      isOnline={isOnline}
                      showStatus={true}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
                          {u.username}
                        </span>
                        {isOnline && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">
                            Online
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartChat(u)}
                    disabled={isStarting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                  >
                    {isStarting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                    )}
                    <span>Chat</span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
