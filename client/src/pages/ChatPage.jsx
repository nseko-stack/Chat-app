import React, { useState, useEffect } from 'react';
import { conversationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import NewChatModal from '../components/NewChatModal';
import { MessageSquare, Sparkles, Plus, Users, Shield } from 'lucide-react';

export const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await conversationAPI.getConversations();
      setConversations(res.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Listen to socket messages to bring updated conversation to the top
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      const convId = newMsg.conversationId?._id || newMsg.conversationId;
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === convId);
        if (index > -1) {
          const updated = [...prev];
          const [target] = updated.splice(index, 1);
          return [{ ...target, updatedAt: new Date().toISOString() }, ...updated];
        }
        // If not in current list, fetch conversations to refresh
        fetchConversations();
        return prev;
      });
    };

    socket.on('message received', handleNewMessage);
    return () => {
      socket.off('message received', handleNewMessage);
    };
  }, [socket]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setIsMobileChatOpen(true);
  };

  const handleBackToSidebar = () => {
    setIsMobileChatOpen(false);
  };

  const handleConversationCreated = (newConv) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c._id === newConv._id);
      if (exists) return prev;
      return [newConv, ...prev];
    });
    setActiveConversation(newConv);
    setIsMobileChatOpen(true);
  };

  return (
    <div className="h-screen w-screen flex bg-[#0B0F19] text-slate-100 overflow-hidden relative">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Sidebar (Desktop or Mobile list view) */}
      <div
        className={`h-full z-20 ${
          isMobileChatOpen ? 'hidden md:flex' : 'flex w-full md:w-auto'
        }`}
      >
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          onSelectConversation={handleSelectConversation}
          onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
          loading={loading}
        />
      </div>

      {/* Main Chat Area / Empty State */}
      <div
        className={`flex-1 h-full z-10 ${
          !isMobileChatOpen ? 'hidden md:flex' : 'flex w-full'
        }`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBackToSidebar}
          />
        ) : (
          /* Empty State / Welcome Screen */
          <div className="flex-1 h-full flex flex-col items-center justify-center p-6 text-center select-none relative">
            <div className="max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-600/30 mb-6 ring-1 ring-white/20 animate-bounce-subtle">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Welcome to PulseChat
              </h2>
              
              <p className="text-sm text-slate-400 mt-2 mb-8 leading-relaxed">
                Select a conversation from the sidebar or find new people to start messaging in real-time.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="w-full py-3 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start New Chat</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-12 w-full text-left">
                <div className="p-4 rounded-2xl glass-panel-light border border-white/5">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>Real-Time Sync</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Socket.IO powered instant message delivery</p>
                </div>

                <div className="p-4 rounded-2xl glass-panel-light border border-white/5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Protected</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Authenticated 1-on-1 private messaging</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Chat & User Search Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSelectConversation={handleConversationCreated}
      />
    </div>
  );
};

export default ChatPage;
