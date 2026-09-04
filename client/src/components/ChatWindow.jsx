import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { messageAPI } from '../services/api';
import Avatar from './Avatar';
import MessageBubble from './MessageBubble';
import { 
  Send, 
  Smile, 
  ArrowLeft, 
  Loader2, 
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '😂', '👋', '🎉', '🚀', '✨', '🙌', '💯'];

export const ChatWindow = ({
  conversation,
  onBack,
}) => {
  const { user } = useAuth();
  const { 
    socket, 
    isUserOnline, 
    joinChat, 
    leaveChat, 
    emitNewMessage, 
    emitTyping, 
    emitStopTyping 
  } = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const myId = (user?.id || user?._id)?.toString();

  const partner = React.useMemo(() => {
    if (!conversation || !conversation.participants) {
      return { username: 'Chat', email: '' };
    }
    return (
      conversation.participants.find((p) => {
        const pid = (p?._id || p?.id || p)?.toString();
        return pid && pid !== myId;
      }) ||
      conversation.participants[0] ||
      { username: 'Chat' }
    );
  }, [conversation, myId]);

  const partnerId = (partner?._id || partner?.id || partner)?.toString();
  const isOnline = isUserOnline(partnerId);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await messageAPI.getMessages(conversation._id);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    joinChat(conversation._id);

    return () => {
      leaveChat(conversation._id);
    };
  }, [conversation?._id]);

  // Socket real-time listeners
  useEffect(() => {
    if (!socket || !conversation?._id) return;

    const handleMessageReceived = (newMsg) => {
      const msgConvId = newMsg.conversationId?._id || newMsg.conversationId;
      if (msgConvId === conversation._id) {
        setMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });
      }
    };

    const handleTyping = (data) => {
      if (data.room === conversation._id && (data.user?.id || data.user?._id) !== myId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = (data) => {
      if (data.room === conversation._id) {
        setIsTyping(false);
      }
    };

    socket.on('message received', handleMessageReceived);
    socket.on('typing', handleTyping);
    socket.on('stop typing', handleStopTyping);

    return () => {
      socket.off('message received', handleMessageReceived);
      socket.off('typing', handleTyping);
      socket.off('stop typing', handleStopTyping);
    };
  }, [socket, conversation?._id, myId]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    if (conversation?._id) {
      emitTyping(conversation._id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(conversation._id);
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || !conversation?._id || sending) return;

    setSending(true);
    setInputText('');
    setShowEmojiPicker(false);
    emitStopTyping(conversation._id);

    try {
      const res = await messageAPI.sendMessage({
        conversationId: conversation._id,
        text: textToSend,
      });

      if (res.data) {
        setMessages((prev) => [...prev, res.data]);
        emitNewMessage(res.data);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // restore unsent text if failure
      setInputText(textToSend);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const addEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const isMyMessage = (msg) => {
    if (!msg || !user) return false;

    const myUserId = (user._id || user.id || user.userId || '')?.toString().trim();
    const myUsername = user.username?.toLowerCase().trim();
    const myEmail = user.email?.toLowerCase().trim();

    const sender = msg.sender;
    if (!sender) return false;

    if (typeof sender === 'string') {
      const sId = sender.trim();
      if (myUserId && sId === myUserId) return true;
    } else if (typeof sender === 'object') {
      const sId = (sender._id || sender.id || '')?.toString().trim();
      const sUsername = sender.username?.toLowerCase().trim();
      const sEmail = sender.email?.toLowerCase().trim();

      if (myUserId && sId && myUserId === sId) return true;
      if (myUsername && sUsername && myUsername === sUsername) return true;
      if (myEmail && sEmail && myEmail === sEmail) return true;
    }

    return false;
  };

  // Group messages with date labels
  const renderMessagesWithDates = () => {
    const elements = [];
    let lastDate = null;

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (msgDate !== lastDate) {
        lastDate = msgDate;
        elements.push(
          <div key={`date-${msgDate}-${index}`} className="flex items-center justify-center my-4 select-none">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-[11px] font-medium text-slate-400 shadow-sm">
              {msgDate}
            </span>
          </div>
        );
      }

      const isMe = isMyMessage(msg);
      const nextMsg = messages[index + 1];
      const nextIsMe = nextMsg ? isMyMessage(nextMsg) : null;
      const showAvatar = !nextMsg || nextIsMe !== isMe;

      elements.push(
        <MessageBubble
          key={msg._id || index}
          message={msg}
          isMe={isMe}
          showAvatar={showAvatar}
        />
      );
    });

    return elements;
  };

  return (
    <main className="flex-1 h-full flex flex-col glass-panel relative overflow-hidden bg-gradient-to-b from-[#0B0F19]/90 to-[#0F172A]/90">
      {/* Active Chat Header */}
      <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between glass-panel z-10">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <Avatar
            name={partner.username}
            src={partner.avatar}
            isOnline={isOnline}
            showStatus={true}
            size="md"
          />

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate flex items-center gap-2">
              {partner.username}
              <span className="text-[10px] font-normal text-slate-400 border border-white/10 px-1.5 py-0.5 rounded-full bg-white/5 hidden sm:inline">
                Direct
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
              {isTyping ? (
                <span className="text-indigo-400 font-medium animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                  typing...
                </span>
              ) : isOnline ? (
                <span className="text-emerald-400 font-medium">Online</span>
              ) : (
                <span>{partner.email || 'Offline'}</span>
              )}
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>End-to-End Ready</span>
          </div>
        </div>
      </header>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 relative flex flex-col w-full">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs font-medium">Loading chat history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto p-6">
            <div className="w-16 h-16 rounded-3xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-600/10">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white">This is the beginning of your conversation</h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Say hello to <span className="text-indigo-300 font-semibold">{partner.username}</span> to get the chat started!
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['👋 Hi there!', '✨ How are you?', '🚀 Let\'s connect!'].map((quick) => (
                <button
                  key={quick}
                  onClick={() => {
                    setInputText(quick);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {renderMessagesWithDates()}
            
            {/* Live Typing indicator bubble */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1 animate-in fade-in duration-150">
                <Avatar name={partner.username} src={partner.avatar} size="sm" />
                <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Floating Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-6 z-30 p-2.5 rounded-2xl glass-dropdown border border-white/15 shadow-2xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 text-lg active:scale-90 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Message Input Bottom Bar */}
      <footer className="p-3 md:p-4 border-t border-white/10 glass-panel relative">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-slate-950/60 border border-white/10 rounded-2xl p-1.5 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
        >
          {/* Emoji toggle */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-colors ${
              showEmojiPicker ? 'text-indigo-400 bg-white/10' : ''
            }`}
            title="Add Emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${partner.username}...`}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
              inputText.trim() && !sending
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 hover:brightness-110 active:scale-95'
                : 'bg-white/5 text-slate-500 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </footer>
    </main>
  );
};

export default ChatWindow;
