import React, { useState, useEffect } from 'react';
import type { Product } from './types';
import { INITIAL_PRODUCTS } from './constants';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import StorePage from './pages/StorePage';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  });
  
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProductsJSON = localStorage.getItem('products');

      if (savedProductsJSON) {
        let parsedProducts = JSON.parse(savedProductsJSON);
        
        if (Array.isArray(parsedProducts)) {
          const migratedProducts = parsedProducts.map((p: any): Product => {
            // Se o produto for de uma versão antiga com `imageUrl`
            if (p.imageUrl && typeof p.imageUrl === 'string' && !p.imageUrls) {
              const { imageUrl, ...rest } = p;
              return { ...rest, imageUrls: [imageUrl] };
            }
            // Garante que `imageUrls` seja um array, prevenindo corrupção de dados
            if (!Array.isArray(p.imageUrls)) {
                p.imageUrls = [];
            }
            return p;
          });
          return migratedProducts;
        }
      }
      
      return INITIAL_PRODUCTS;
    } catch (error) {
      console.error("Failed to parse/migrate products from localStorage", error);
      return INITIAL_PRODUCTS;
    }
  });

  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

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

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

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
  
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...newProduct, id: Date.now() }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };
  
  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  if (currentPath.startsWith('#/admin')) {
    if (isAdmin) {
      return (
        <AdminPage 
          products={products}
          onLogout={handleLogout}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      );
    } else {
      return <LoginPage onLogin={handleLogin} />;
    }
  }

  return <StorePage products={products} />;
};

export default App;