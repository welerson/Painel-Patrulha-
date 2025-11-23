import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.AGENTE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock authentication
    if (email && password) {
      onLogin({
        email,
        role,
        name: name || email.split('@')[0]
      });
    } else {
      alert("Preencha e-mail e senha (mock: qualquer valor serve)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Patrulha de Próprios PBH</h1>
          <p className="text-slate-500">Guarda Civil Municipal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="flex rounded-md bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole(UserRole.AGENTE)}
              className={`flex-1 py-2 text-sm font-medium rounded ${role === UserRole.AGENTE ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
            >
              Agente / Viatura
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.GESTOR)}
              className={`flex-1 py-2 text-sm font-medium rounded ${role === UserRole.GESTOR ? 'bg-white shadow text-blue-700' : 'text-slate-500'}`}
            >
              Gestor
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome / Matrícula</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Agente Silva"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              type="email" 
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="******"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-800 text-white py-2 rounded font-bold hover:bg-blue-900 transition transform active:scale-95"
          >
            Entrar
          </button>

          <div className="text-xs text-center text-slate-400 mt-4 border-t pt-4">
            <p className="font-bold mb-1">Modo Multitarefa:</p>
            <p>Sessão isolada por aba (sessionStorage).</p>
            <p>Dados compartilhados (localStorage).</p>
            <p className="mt-2">Você pode abrir uma aba como Agente e outra como Gestor simultaneamente.</p>
          </div>
        </form>
      </div>
    </div>
  );
};