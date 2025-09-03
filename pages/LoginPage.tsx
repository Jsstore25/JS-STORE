import React, { useState } from 'react';
import { LOGO_BASE64 } from '../constants';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const savedCredsString = localStorage.getItem('adminCredentials');
    
    if (savedCredsString) {
        const savedCreds = JSON.parse(savedCredsString);
        if (username === savedCreds.username && password === savedCreds.password) {
            onLogin();
        } else {
            setError('Usuário ou senha inválidos.');
        }
    } else {
        // Fallback for safety, in case localStorage is not initialized
        if (username === 'samuca' && password === 'admin') {
            onLogin();
        } else {
            setError('Usuário ou senha inválidos.');
        }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <img className="h-24 w-auto mx-auto" src={LOGO_BASE64} alt="JS Store Logo" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Acesso Administrativo
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-700">
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              Entrar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;