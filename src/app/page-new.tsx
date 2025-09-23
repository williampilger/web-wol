'use client';

import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import { useState } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);

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
