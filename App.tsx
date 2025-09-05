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

// ✅ Teste rápido da conexão com Supabase
useEffect(() => {
  const testSupabase = async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*').limit(1);
      if (error) throw error;
      console.log('Supabase OK:', data);
    } catch (err: any) {
      console.error('Erro Supabase:', err.message);
    }
  };

  testSupabase();
}, []);


  // Carrega produtos do Supabase
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
      const { data, error } = await supabase.from<Product>('produtos').insert([newProduct]);
      if (error) throw error;
      setProducts(prev => [...prev, data[0]]);
    } catch (err: any) {
      console.error(err);
      alert('Erro: ' + (err.message || 'Erro ao adicionar produto.'));
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const { data, error } = await supabase
        .from<Product>('produtos')
        .update(updatedProduct)
        .eq('id', updatedProduct.id);
      if (error) throw error;
      setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? data[0] : p)));
    } catch (err: any) {
      console.error(err);
      alert('Erro: ' + (err.message || 'Erro ao atualizar produto.'));
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', productId);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err: any) {
      console.error(err);
      alert('Erro: ' + (err.message || 'Erro ao deletar produto.'));
    }
  };

  const handleAddReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return;

    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const updatedReviews = productToUpdate.reviews ? [...productToUpdate.reviews, newReview] : [newReview];
    const updatedProduct = { ...productToUpdate, reviews: updatedReviews };

    handleUpdateProduct(updatedProduct);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <img className="h-24 w-auto animate-pulse" src={LOGO_BASE64} alt="JS Store Logo" />
        <p className="mt-4 text-slate-600 font-semibold">Carregando loja...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <img className="h-24 w-auto" src={LOGO_BASE64} alt="JS Store Logo" />
        <h2 className="mt-6 text-2xl font-bold text-red-600">Ocorreu um Erro</h2>
        <p className="mt-2 text-slate-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-6 bg-pink-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (currentPath.startsWith('#/admin')) {
    if (isAdmin) {
      return (
        <AdminPage
          products={products}
          onLogout={handleLogout}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
          onRefreshProducts={fetchProducts}
        />
      );
    } else {
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  return <StorePage products={products} onAddReview={handleAddReview} />;
};

export default App;
