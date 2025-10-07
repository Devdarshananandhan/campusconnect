import React, { useState } from 'react';
import './App.css';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { User } from './types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setShowRegister(false);
  };

  const handleRegisterSuccess = (user: any) => {
    setCurrentUser(user);
    setShowRegister(false);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-100">
          {!currentUser ? (
            showRegister ? (
              <Register 
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setShowRegister(false)}
              />
            ) : (
              <Login 
                setCurrentUser={handleLoginSuccess}
                onSwitchToRegister={() => setShowRegister(true)}
              />
            )
          ) : (
            <Dashboard currentUser={currentUser} setCurrentUser={setCurrentUser} />
          )}
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
