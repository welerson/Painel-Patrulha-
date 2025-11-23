import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { AgenteView } from './components/AgenteView';
import { GestorView } from './components/GestorView';
import { UserSession, UserRole } from './types';
import { auth } from './firebaseConfig';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isFireBaseConnected, setIsFirebaseConnected] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. Check local user session (UI state)
  useEffect(() => {
    const savedUser = sessionStorage.getItem('ppbh_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2. Ensure Firebase Connection (Anonymous Auth) to bypass Security Rules
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase Conectado (ID):", firebaseUser.uid);
        setIsFirebaseConnected(true);
      } else {
        console.log("Tentando conexão anônima...");
        signInAnonymously(auth).catch((error) => {
          const errorCode = error.code;
          
          // FIX: Tratar erro quando Auth Anônima não está ativada no console
          // Permite prosseguir se o Firestore estiver em modo público (Teste)
          if (errorCode === 'auth/admin-restricted-operation' || errorCode === 'auth/operation-not-allowed') {
             console.warn("ALERTA: Autenticação Anônima não habilitada no console do Firebase.");
             console.warn("Tentando conexão sem autenticação (O Firestore precisa estar com regras públicas 'allow read, write: if true').");
             setIsFirebaseConnected(true);
          } else {
             console.error("Erro crítico na autenticação:", error);
             setAuthError(`Erro de conexão (${errorCode}): ${error.message}`);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: UserSession) => {
    setUser(userData);
    sessionStorage.setItem('ppbh_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('ppbh_user');
  };

  // Loading / Error Screen for Database Connection
  if (!isFireBaseConnected && !authError) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <h2 className="text-xl font-bold">Conectando ao sistema...</h2>
        <p className="text-slate-400 text-sm mt-2">Estabelecendo conexão segura com o banco de dados.</p>
      </div>
    );
  }

  if (authError) {
     return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 text-center">
        <div className="bg-red-500/10 border border-red-500 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Erro de Conexão</h2>
          <p className="text-sm mb-4">{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
     );
  }

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