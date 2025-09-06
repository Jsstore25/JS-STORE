import React, { useState, useEffect, useCallback } from 'react';
import type { Product, Review } from './types';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import StorePage from './pages/StorePage';
import { LOGO_BASE64 } from './constants';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        const responseBody = await response.text();
        let finalErrorMessage = `A API retornou um erro ${response.status} (${response.statusText}).\n\n`;
        
        try {
          const parsedError = JSON.parse(responseBody);
          if (parsedError.message) {
            finalErrorMessage += `MENSAGEM DO SERVIDOR:\n${parsedError.message}`;
          } else {
            finalErrorMessage += `RESPOSTA JSON DO SERVIDOR (sem 'message'):\n${JSON.stringify(parsedError, null, 2)}`;
          }
        } catch (e) {
            finalErrorMessage += `A RESPOSTA DO SERVIDOR NÃO ERA JSON.\nResposta bruta (pode ser HTML de erro do Vercel):\n\n${responseBody}`;
        }
        throw new Error(finalErrorMessage);
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
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
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };
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
  
  const handleApiError = async (operation: string, response: Response) => {
    let errorMessage = `Falha ao ${operation}.`;
    try {
        const errorBody = await response.json();
        if (errorBody.message) {
            errorMessage += `\n\nMensagem do Servidor:\n${errorBody.message}`;
        } else {
            errorMessage += `\n\nResposta do Servidor (código ${response.status}):\n${JSON.stringify(errorBody, null, 2)}`;
        }
    } catch (e) {
        errorMessage += `\n\nO servidor respondeu com o código ${response.status} mas o corpo da resposta não era JSON.`;
    }
    return errorMessage;
  };

  const handleAddProduct = async (newProduct: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        const errorMessage = await handleApiError('adicionar o produto', response);
        throw new Error(errorMessage);
      }
      await fetchProducts(); // Recarrega a lista de produtos do servidor
    } catch (err) {
      console.error(err);
      alert('Erro: ' + (err as Error).message);
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`/api/products?id=${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      if (!response.ok) {
        const errorMessage = await handleApiError('atualizar o produto', response);
        throw new Error(errorMessage);
      }
      await fetchProducts(); // Recarrega a lista de produtos do servidor
    } catch (err) {
      console.error(err);
      alert('Erro: ' + (err as Error).message);
    }
  };
  
  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });
      // Um status 204 (No Content) é uma resposta de sucesso para DELETE.
      if (response.status === 204) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        return; 
      }
      if (!response.ok) {
          const errorMessage = await handleApiError('excluir o produto', response);
          throw new Error(errorMessage);
      }
      // Se a resposta for OK (ex: 200), também consideramos sucesso.
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch(err) {
      console.error(err);
      alert('Erro: ' + (err as Error).message);
    }
  };
  
  const handleAddReview = (productId: number, reviewData: Omit<Review, 'id' | 'date'>) => {
    const productToUpdate = products.find(p => p.id === productId);
    if (!productToUpdate) return;
    
    const newReview: Review = {
      ...reviewData,
      id: Date.now(), // ID temporário, o servidor pode ou não usar
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
        <p className="mt-2 text-slate-600 max-w-2xl whitespace-pre-wrap text-left bg-red-50 border border-red-200 p-4 rounded-md">{error}</p>
        <button onClick={fetchProducts} className="mt-6 bg-pink-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
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