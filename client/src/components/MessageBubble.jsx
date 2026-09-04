import React from 'react';
import Avatar from './Avatar';
import { CheckCheck } from 'lucide-react';

export const MessageBubble = ({ message, isMe, showAvatar = true }) => {
  const text = message.text || message.content || '';
  const senderName = message.sender?.username || (isMe ? 'You' : 'User');
  const senderAvatar = message.sender?.avatar || '';

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`w-full flex items-end gap-2.5 my-1.5 transition-all ${
        isMe ? 'justify-end pl-12 sm:pl-20' : 'justify-start pr-12 sm:pr-20'
      }`}
    >
      {/* Incoming Avatar - on the LEFT */}
      {!isMe && (
        <div className="w-8 shrink-0 flex items-end justify-center mb-0.5">
          {showAvatar ? (
            <Avatar
              name={senderName}
              src={senderAvatar}
              size="sm"
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Bubble Box */}
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] px-4 py-2.5 shadow-md transition-all ${
          isMe
            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-tr-xs shadow-indigo-600/25 border border-indigo-400/20'
            : 'bg-slate-800 text-slate-100 rounded-2xl rounded-tl-xs border border-slate-700/80 shadow-black/30'
        }`}
      >
        {/* Incoming sender username header */}
        {!isMe && showAvatar && (
          <p className="text-[11px] font-bold text-indigo-300 tracking-tight mb-1 select-none flex items-center gap-1.5">
            <span>{senderName}</span>
          </p>
        )}

        {/* Message Text */}
        <p className="break-words whitespace-pre-wrap leading-relaxed text-[13.5px] font-normal">
          {text}
        </p>

        {/* Time and Delivery Status */}
        <div
          className={`flex items-center gap-1.5 mt-1 select-none text-[10px] ${
            isMe ? 'text-indigo-200/80 justify-end' : 'text-slate-400 justify-end'
          }`}
        >
          <span>{formatTime(message.createdAt)}</span>
          {isMe && (
            <span title="Delivered">
              <CheckCheck className="w-3.5 h-3.5 text-indigo-200" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
