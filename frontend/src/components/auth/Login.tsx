import React, { useState } from 'react';
import { Users, Mail, Lock, GraduationCap, Briefcase, BookOpen, Sparkles } from 'lucide-react';
import api from '../../services/api';

interface LoginProps {
  setCurrentUser: (user: any) => void;
  onSwitchToRegister?: () => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentUser, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'alumni' | 'faculty'>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.login(email, password, role);
      setCurrentUser(response.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'student',
      label: 'Student',
      icon: GraduationCap,
      description: 'Current student seeking opportunities',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      value: 'alumni',
      label: 'Alumni',
      icon: Briefcase,
      description: 'Graduate ready to give back',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      value: 'faculty',
      label: 'Faculty',
      icon: BookOpen,
      description: 'Educator and mentor',
      gradient: 'from-orange-500 to-red-500'
    },
  ];

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
                    className="input-field pl-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">I am a...</label>
                <div className="grid grid-cols-3 gap-3">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setRole(option.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          role === option.value
                            ? `border-primary-500 bg-gradient-to-br ${option.gradient} text-white shadow-lg scale-105`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${role === option.value ? 'text-white' : 'text-gray-600'}`} />
                        <p className={`text-sm font-semibold ${role === option.value ? 'text-white' : 'text-gray-900'}`}>
                          {option.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={() => handleLogin(email, password, role)}
                disabled={isLoading}
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