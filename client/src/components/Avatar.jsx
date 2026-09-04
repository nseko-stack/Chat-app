import React from 'react';

const GRADIENT_PAIRS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-400 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-fuchsia-600',
  'from-teal-500 to-emerald-700',
  'from-pink-500 to-rose-600',
];

const getGradient = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[index];
};

const getInitials = (name = '') => {
  if (!name) return '?';
  const parts = name.trim().split(/[\s_.-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const Avatar = ({
  name = 'User',
  src,
  isOnline = false,
  showStatus = false,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const statusSizeMap = {
    sm: 'w-2.5 h-2.5 right-0 bottom-0 ring-1',
    md: 'w-3 h-3 right-0 bottom-0 ring-2',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5 ring-2',
    xl: 'w-4 h-4 right-1 bottom-1 ring-2',
  };

  const gradientClass = getGradient(name);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-2xl object-cover ring-1 ring-white/10 shadow-md`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-2xl bg-gradient-to-br ${gradientClass} flex items-center justify-center font-semibold text-white shadow-md ring-1 ring-white/20 select-none`}
        >
          {getInitials(name)}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute ${statusSizeMap[size]} rounded-full ring-[#0B0F19] ${
            isOnline
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              : 'bg-slate-500'
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
