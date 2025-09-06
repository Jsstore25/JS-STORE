// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import type { Product, Review } from './types';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import StorePage from './pages/StorePage';
import { LOGO_BASE64 } from './constants';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('isAdmin') === 'true');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  useEffect(() => {
  const testeSupabase = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*');
      if (error) throw error;
      console.log('Produtos no Supabase:', data);
    } catch (err) {
      console.error('Erro ao acessar Supabase:', err);
    }
  };

  testeSupabase();
}, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from<Product>('produtos').select('*');
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
    if (!localStorage.getItem('adminCredentials')) {
      localStorage.setItem('adminCredentials', JSON.stringify({ username: 'samuca', password: 'admin' }));
    }
  }, []);

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

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase.from<Product>('produtos').insert([newProduct]).select();
      if (error) throw error;
      if (data && data.length > 0) setProducts(prev => [...prev, data[0]]);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao adicionar produto: ' + (err.message || ''));
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const { data, error } = await supabase.from<Product>('produtos').update(updatedProduct).eq('id', updatedProduct.id).select();
      if (error) throw error;
      if (data && data.length > 0) setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? data[0] : p)));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao atualizar produto: ' + (err.message || ''));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao deletar produto: ' + (err.message || ''));
    }
  };

  const handleAddReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      const newReview: Review = { ...reviewData, id: Date.now().toString(), date: new Date().toISOString() };
      const updatedReviews = product.reviews ? [...product.reviews, newReview] : [newReview];
      const { data, error } = await supabase.from<Product>('produtos').update({ reviews: updatedReviews }).eq('id', productId).select();
      if (error) throw error;
      if (data && data.length > 0) setProducts(prev => prev.map(p => (p.id === productId ? data[0] : p)));
    } catch (err: any) {
      console.error(err);
      alert('Erro ao adicionar review: ' + (err.message || ''));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Erro: {error}</div>;

  if (currentPath.startsWith('#/admin')) {
    return isAdmin ? (
      <AdminPage products={products} onLogout={handleLogout} onAddProduct={handleAddProduct} onUpdateProduct={handleUpdateProduct} onDeleteProduct={handleDeleteProduct} onRefreshProducts={fetchProducts} />
    ) : <LoginPage onLogin={handleLogin} />;
  }

  return <StorePage products={products} onAddReview={handleAddReview} />;
};

export default App;
