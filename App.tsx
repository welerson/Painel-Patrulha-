import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AgenteView } from './components/AgenteView';
import { GestorView } from './components/GestorView';
import { UserSession, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('ppbh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: UserSession) => {
    setUser(userData);
    localStorage.setItem('ppbh_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ppbh_user');
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <>
      {user.role === UserRole.AGENTE ? (
        <AgenteView user={user} onLogout={handleLogout} />
      ) : (
        <GestorView user={user} onLogout={handleLogout} />
      )}
    </>
  );
};

export default App;