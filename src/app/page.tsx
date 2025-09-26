'use client';

import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [isCheckingLocal, setIsCheckingLocal] = useState(true);

  // Verificar se está na rede local ao carregar a página
  useEffect(() => {
    const checkLocalAccess = async () => {
      try {
        const response = await fetch('/api/auth/local');
        const data = await response.json();
        
        if (response.ok && data.isLocal) {
          console.log(`Login automático como usuário local: ${data.user.id}`);
          setUsername(data.user.id);
          setUserGroups(data.user.groups);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Erro ao verificar acesso local:', error);
      } finally {
        setIsCheckingLocal(false);
      }
    };

    checkLocalAccess();
  }, []);

  const handleLogin = (user: string, groups: string[]) => {
    setUsername(user);
    setUserGroups(groups);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUsername('');
    setUserGroups([]);
    setIsLoggedIn(false);
  };

  // Mostrar loading enquanto verifica rede local
  if (isCheckingLocal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acesso local...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Dashboard 
      username={username} 
      userGroups={userGroups} 
      onLogout={handleLogout} 
    />
  );
}
