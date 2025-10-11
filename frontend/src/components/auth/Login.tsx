import React, { useState } from 'react';
import { Users, Mail, Lock, GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import api from '../../services/api';

interface LoginProps {
  setCurrentUser: (user: any) => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentUser, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.login(email, password);
      setCurrentUser(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-bounce-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Branding */}
          <div className="bg-gradient-to-br from-primary-600 via-secondary-600 to-accent-500 p-12 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-lg rounded-2xl mb-6 shadow-lg">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-4 font-display">CampusConnect</h1>
              <p className="text-xl mb-8 text-white/90">Professional Campus Networking Platform</p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Connect & Collaborate</h3>
                    <p className="text-white/80 text-sm">Build meaningful relationships with peers, alumni, and faculty</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Learn & Grow</h3>
                    <p className="text-white/80 text-sm">Access mentorship and skill development opportunities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Discover Opportunities</h3>
                    <p className="text-white/80 text-sm">Find internships, jobs, and career advancement paths</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="p-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your journey</p>
            </div>

            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12"
                    placeholder="your.email@university.edu"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    className="input-field pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !email || !password}
                className="btn-primary w-full relative"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Register Link */}
              {onSwitchToRegister && (
                <div className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={onSwitchToRegister}
                    className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    Create Account
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-gray-500">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Enter your credentials to explore
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;