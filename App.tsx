import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AgenteView } from './components/AgenteView';
import { GestorView } from './components/GestorView';
import { UserSession, UserRole } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);

  // Check for existing session on mount using sessionStorage (per tab isolation)
  useEffect(() => {
    const savedUser = sessionStorage.getItem('ppbh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: UserSession) => {
    setUser(userData);
    // Use sessionStorage so one tab can be Agente and another Gestor
    sessionStorage.setItem('ppbh_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('ppbh_user');
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