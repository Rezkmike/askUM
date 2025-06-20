import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

interface User {
  username: string;
  isAuthenticated: boolean;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (credentials: { username: string; password: string }) => {
    setLoginLoading(true);
    setLoginError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo credentials
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        setUser({
          username: credentials.username,
          isAuthenticated: true
        });
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginError('');
  };

  if (!user?.isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin} 
        error={loginError} 
        loading={loginLoading} 
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;