import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import StorePage from './pages/StorePage';
import { supabase } from './supabaseClient';
import { Header } from './components/Header';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      setProducts(data ?? []);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
    window.location.hash = '#/admin';
  };

  const handleLogout = () => {
    sessionStorage.removeItem('isAdmin');
    setIsAdmin(false);
    window.location.hash = '#/';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Erro: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={0} newProductCount={0} onCartClick={()=>{}} onNotificationClick={()=>{}} />
      <main className="flex-grow">
        {currentPath.startsWith('#/admin') ? (
          isAdmin ? (
            <AdminPage />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        ) : (
          <StorePage products={products} />
        )}
      </main>
    </div>
  );
};

export default App;
