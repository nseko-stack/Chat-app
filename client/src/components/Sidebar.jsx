import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import { 
  MessageSquare, 
  Users, 
  Search, 
  Plus, 
  LogOut, 
  Sparkles, 
  CircleDot,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({
  conversations = [],
  activeConversation,
  onSelectConversation,
  onOpenNewChatModal,
  loading = false,
}) => {
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'contacts'

  // Helper to get the other participant in 1-on-1 conversation
  const getPartner = (conv) => {
    if (!conv || !conv.participants) return { username: 'User', email: '' };
    const myId = (user?.id || user?._id)?.toString();
    return conv.participants.find((p) => {
      const pid = (p._id || p.id || p)?.toString();
      return pid && pid !== myId;
    }) || conv.participants[0] || { username: 'User' };
  };

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const partner = getPartner(conv);
      const nameMatch = partner.username?.toLowerCase().includes(searchTerm.toLowerCase());
      const emailMatch = partner.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return nameMatch || emailMatch;
    });
  }, [conversations, searchTerm, user]);

  const formatTimestamp = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col glass-panel border-r border-white/10 z-20 select-none">
      {/* Top Header */}
      <div className="p-4 pb-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-white">PulseChat</h1>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time Messenger</p>
          </div>
        </div>

        <button
          onClick={onOpenNewChatModal}
          title="Start New Chat"
          className="p-2.5 rounded-2xl bg-indigo-600/90 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>

      {/* User Profile Bar */}
      <div className="px-4 py-3 bg-slate-900/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={user?.username}
            src={user?.avatar}
            isOnline={true}
            showStatus={true}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3.5 pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/40 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Conversations Count & Quick Filter */}
      <div className="px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
        <span>DIRECT MESSAGES</span>
        <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[10px]">
          {filteredConversations.length}
        </span>
      </div>

      {/* Conversations Scroll Area */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No chats found</p>
            <p className="text-[11px] text-slate-500 mt-1 mb-4">
              {searchTerm ? 'No conversations match your search' : 'Start your first direct message!'}
            </p>
            <button
              onClick={onOpenNewChatModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Find People
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const partner = getPartner(conv);
            const isOnline = isUserOnline(partner._id || partner.id);
            const isSelected = activeConversation?._id === conv._id;

            return (
              <button
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                  isSelected
                    ? 'bg-indigo-600/20 border border-indigo-500/40 shadow-lg shadow-indigo-600/10'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <Avatar
                  name={partner.username}
                  src={partner.avatar}
                  isOnline={isOnline}
                  showStatus={true}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-slate-100'}`}>
                      {partner.username}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                      {formatTimestamp(conv.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate">
                      {partner.email || 'Click to chat'}
                    </span>
                    {isOnline && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 ml-1 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
