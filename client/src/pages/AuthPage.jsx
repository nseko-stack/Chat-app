import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  MessageSquare, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  Shield, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export const AuthPage = () => {
  const { login, register, authError, clearError } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const res = await register(username, email, password);
        if (res.success) {
          setSuccessMessage('Account created successfully! Logging you in...');
          // Auto login after registration
          setTimeout(async () => {
            await login(email, password);
          }, 800);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0B0F19]">
      {/* Background Decorative Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Hero Pitch (Visible on lg screens) */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-center space-y-6 p-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel-light border border-white/10 text-indigo-300 text-xs font-semibold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Chat Experience</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Connect seamlessly in real time with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">PulseChat</span>.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed max-w-md">
            Experience lightning fast direct messaging, live typing indicators, and sleek glassmorphism design built for modern teams and friends.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Instant Messaging</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Ultra-low latency with Socket.IO</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Secure Access</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">JWT token protected endpoints</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Auth Form Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
            {/* Header / Brand */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-3 ring-1 ring-white/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {isLogin ? 'Sign in to access your direct messages' : 'Join PulseChat and start messaging right away'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-2xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); clearError(); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  isLogin
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); clearError(); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  !isLogin
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error / Success feedback */}
            {authError && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. alex_rivera"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 border border-white/10 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to PulseChat' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer toggle */}
            <div className="mt-6 text-center text-xs text-slate-400">
              {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors"
              >
                {isLogin ? 'Register now' : 'Sign In'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
