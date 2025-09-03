import React, { useState, useMemo, useRef } from 'react';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { SearchIcon, FilterIcon, CloseIcon } from '../components/Icons';
import { Cart } from '../components/Cart';
import ProductDetailModal from '../components/ProductDetailModal';
import type { Product, CartItem } from '../types';

const BANNER_IMAGE_URL = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80";

const parsePrice = (priceStr: string): number => {
  if (typeof priceStr !== 'string') return 0;
  const numberStr = priceStr
    .replace('R$', '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const price = parseFloat(numberStr);
  return isNaN(price) ? 0 : price;
};

interface StorePageProps {
  products: Product[];
}

const StorePage: React.FC<StorePageProps> = ({ products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      setCart(cart => cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(cart => cart.filter(item => item.id !== productId));
  };
  
  const cartItemCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const allSubcategories = useMemo(() => {
    const subcategoriesByCategory = products.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = new Set();
        }
        acc[product.category].add(product.subcategory);
        return acc;
    }, {} as Record<string, Set<string>>);

    return {
      Mulher: Array.from(subcategoriesByCategory['Mulher'] || []).sort(),
      Homem: Array.from(subcategoriesByCategory['Homem'] || []).sort()
    }
  }, [products]);

  const handleCategoryFilterChange = (category: string) => {
    setActiveCategoryFilters(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleFilterChange = (subcategory: string) => {
    setActiveFilters(prev => 
      prev.includes(subcategory) 
        ? prev.filter(s => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
        setPriceRange(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleClearFilters = () => {
    setActiveCategoryFilters([]);
    setActiveFilters([]);
    setPriceRange({ min: '', max: '' });
  };

  const processedProducts = useMemo(() => {
    let filteredProducts = products;

    if (activeCategoryFilters.length > 0) {
      filteredProducts = filteredProducts.filter(product => activeCategoryFilters.includes(product.category));
    }

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeFilters.length > 0) {
      filteredProducts = filteredProducts.filter(product => activeFilters.includes(product.subcategory));
    }
    
    const minPrice = priceRange.min !== '' ? parseFloat(priceRange.min) : null;
    const maxPrice = priceRange.max !== '' ? parseFloat(priceRange.max) : null;

    if (minPrice !== null || maxPrice !== null) {
      filteredProducts = filteredProducts.filter(product => {
        const price = parsePrice(product.price);
        const meetsMin = minPrice !== null ? price >= minPrice : true;
        const meetsMax = maxPrice !== null ? price <= maxPrice : true;
        return meetsMin && meetsMax;
      });
    }

    const sortedProducts = [...filteredProducts];

    switch (sortOrder) {
      case 'price-asc':
        sortedProducts.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
        break;
      case 'price-desc':
        sortedProducts.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return sortedProducts;
  }, [searchTerm, activeFilters, sortOrder, products, priceRange, activeCategoryFilters]);

  const productsByCategory = useMemo(() => {
    return processedProducts.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as Record<string, Product[]>);
  }, [processedProducts]);

  const categories = ['Mulher', 'Homem'];
  
  const scrollToContent = () => {
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50">
      <Header cartItemCount={cartItemCount} onCartClick={() => setIsCartOpen(true)} />
      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
      />
      
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <div className="relative w-full h-80 md:h-96 shadow-inner flex items-center justify-center text-center text-white">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <img 
              src={BANNER_IMAGE_URL}
              alt="Banner de moda com roupas em cabides" 
              className="w-full h-full object-cover"
          />
          <div className="relative z-20 p-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">Elegância e Estilo</h1>
            <p className="mt-4 text-lg md:text-xl max-w-2xl">Descubra as últimas tendências da moda e encontre peças que combinam com você.</p>
            <button onClick={scrollToContent} className="mt-8 bg-white text-slate-800 font-bold py-3 px-8 rounded-full hover:bg-slate-200 transition-colors">
                Ver Coleção
            </button>
          </div>
      </div>
      
       <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${isFilterOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsFilterOpen(false)}
        aria-hidden="true"
      />
      <div ref={mainContentRef} id="main-content" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside 
            id="filter-sidebar"
            className={`
              fixed top-0 left-0 h-full w-4/5 max-w-sm z-40 transform transition-transform duration-300 ease-in-out
              md:sticky md:top-28 md:w-1/4 lg:w-1/5 md:h-auto md:max-w-none md:transform-none md:z-auto
              ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-heading"
        >
          <div className="h-full overflow-y-auto bg-white p-6 md:bg-transparent md:p-0 md:overflow-y-visible">
            <div className="bg-white md:p-6 md:rounded-lg md:shadow-sm">
                <div className="flex justify-between items-center mb-5 md:block">
                    <h3 id="filter-heading" className="text-xl font-bold text-slate-900 md:mb-5">Filtros</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="md:hidden" aria-label="Fechar filtros">
                        <CloseIcon />
                    </button>
                </div>
                
                <div className="mb-6">
                    <h4 className="font-bold mb-3 text-lg text-pink-500">Categorias</h4>
                    <div className="space-y-2">
                        {categories.map(category => (
                            <div key={category} className="flex items-center">
                            <input
                                type="checkbox"
                                id={`category-${category}`}
                                checked={activeCategoryFilters.includes(category)}
                                onChange={() => handleCategoryFilterChange(category)}
                                className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                            />
                            <label htmlFor={`category-${category}`} className="ml-2 text-slate-700 select-none cursor-pointer">{category}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-bold mb-3 text-lg text-pink-500">Preço</h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input
                        type="text"
                        name="min"
                        placeholder="Mín."
                        value={priceRange.min}
                        onChange={handlePriceChange}
                        className="w-full p-2 pl-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        aria-label="Preço mínimo"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                    <span className="text-gray-500">-</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                      <input
                        type="text"
                        name="max"
                        placeholder="Máx."
                        value={priceRange.max}
                        onChange={handlePriceChange}
                        className="w-full p-2 pl-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                        aria-label="Preço máximo"
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </div>
                  </div>
                </div>

                {categories.map(category => (
                    allSubcategories[category as keyof typeof allSubcategories].length > 0 && (
                    <div key={category} className="mb-6">
                        <h4 className="font-bold mb-3 text-lg text-pink-500">{category}</h4>
                        <div className="space-y-2">
                            {allSubcategories[category as keyof typeof allSubcategories].map(sub => (
                                <div key={sub} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={sub}
                                    checked={activeFilters.includes(sub)}
                                    onChange={() => handleFilterChange(sub)}
                                    className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                                />
                                <label htmlFor={sub} className="ml-2 text-slate-700 select-none cursor-pointer">{sub}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    )
                ))}
                {(activeCategoryFilters.length > 0 || activeFilters.length > 0 || priceRange.min || priceRange.max) && (
                  <button onClick={handleClearFilters} className="w-full text-sm text-center mt-4 bg-slate-200 text-slate-700 py-2 rounded-md hover:bg-slate-300">Limpar filtros</button>
                )}
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="w-full sm:w-auto md:hidden flex items-center justify-center gap-2 bg-white px-4 py-3 border border-gray-300 rounded-full shadow-sm text-slate-700 font-semibold"
                    aria-controls="filter-sidebar"
                    aria-expanded={isFilterOpen}
                >
                    <FilterIcon />
                    Filtros
                </button>
                <div className="relative w-full sm:w-auto sm:flex-grow max-w-lg">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-shadow"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                </div>
                <div className="relative w-full sm:w-auto">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full sm:w-56 appearance-none bg-white py-3 pl-4 pr-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                        aria-label="Ordenar produtos por"
                    >
                        <option value="default">Relevância</option>
                        <option value="price-asc">Preço: Menor para Maior</option>
                        <option value="price-desc">Preço: Maior para Menor</option>
                        <option value="name-asc">Nome: A-Z</option>
                        <option value="name-desc">Nome: Z-A</option>
                    </select>
                </div>
            </div>

            {categories.map(category => (
            productsByCategory[category] && productsByCategory[category].length > 0 && (
                <section key={category} className="mb-12">
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-800 mb-6 pb-2 border-b-2 border-pink-200">
                    {category}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {productsByCategory[category].map(product => (
                      <ProductCard key={product.id} product={product} onViewDetails={handleViewDetails} onAddToCart={() => handleAddToCart(product, 1)}/>
                    ))}
                </div>
                </section>
            )
            ))}
            
            {processedProducts.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-xl text-slate-500">Nenhum produto encontrado.</p>
                    <p className="text-slate-400 mt-2">Tente ajustar seus filtros ou busca.</p>
                </div>
            )}

        </main>
      </div>

       <footer className="text-center py-6 text-gray-500 text-sm bg-gray-200 mt-8">
        <p>&copy; {new Date().getFullYear()} JS Store. Todos os direitos reservados.</p>
        <a href="#/admin" className="text-xs text-gray-400 hover:underline">Admin Login</a>
      </footer>
    </div>
  );
};

export default StorePage;