import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';
import { Loader2 } from 'lucide-react';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-300 tracking-wide">Connecting to PulseChat...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <SocketProvider>
      <ChatPage />
    </SocketProvider>
  ) : (
    <AuthPage />
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
