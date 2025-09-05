import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { LOGO_BASE64, INITIAL_PRODUCTS } from '../constants';
import ProductFormModal from '../components/ProductFormModal';
import { PlusIcon, UploadIcon, DownloadIcon } from '../components/Icons';

interface AdminPageProps {
  products: Product[];
  onLogout: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: number) => void;
  onRefreshProducts: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ products, onLogout, onAddProduct, onUpdateProduct, onDeleteProduct, onRefreshProducts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [shippingCost, setShippingCost] = useState('');
  const [shippingSuccess, setShippingSuccess] = useState('');
  const [shippingError, setShippingError] = useState('');
  
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');

  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const savedShippingCost = localStorage.getItem('standardShippingCost');
    if (savedShippingCost) {
      const formatted = parseFloat(savedShippingCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      setShippingCost(formatted);
    }
  }, []);

  // Efeito para backup automático e detecção de reset do servidor.
  useEffect(() => {
    const isServerStateInitial = JSON.stringify(products) === JSON.stringify(INITIAL_PRODUCTS);
    const backupRaw = localStorage.getItem('products_backup');

    // 1. Detectar se o servidor foi resetado e se existe um backup melhor para restaurar.
    if (isServerStateInitial && backupRaw) {
      const isBackupStateInitial = backupRaw === JSON.stringify(INITIAL_PRODUCTS);
      if (!isBackupStateInitial) {
        setShowRestorePrompt(true);
      }
    }

    // 2. Salvar backup no localStorage, evitando sobreescrever um backup bom com o estado inicial.
    if (!isServerStateInitial || !backupRaw) {
      localStorage.setItem('products_backup', JSON.stringify(products));
    }
  }, [products]);

  const handleRestoreBackup = async () => {
    setIsRestoring(true);
    setImportError('');
    setImportSuccess('');
    const backup = localStorage.getItem('products_backup');

    if (!backup) {
      setImportError('Nenhum backup local encontrado.');
      setIsRestoring(false);
      return;
    }

    try {
      const importedProducts = JSON.parse(backup);
      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importedProducts),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar dados de backup para o servidor.');
      }
      
      setImportSuccess('Backup restaurado com sucesso! A lista de produtos foi atualizada.');
      setShowRestorePrompt(false);
      onRefreshProducts();
      setTimeout(() => setImportSuccess(''), 4000);

    } catch (error) {
      console.error(error);
      const message = (error as Error).message || 'Ocorreu um erro desconhecido.';
      setImportError(`Erro ao restaurar: ${message}`);
      setTimeout(() => setImportError(''), 4000);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };
  
  const handleSaveProduct = (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
      onUpdateProduct(productData);
    } else {
      onAddProduct(productData);
    }
    handleCloseModal();
  };
  
  const handleDelete = (productId: number) => {
    if(window.confirm('Tem certeza que deseja excluir este produto?')) {
      onDeleteProduct(productId);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const savedCredsString = localStorage.getItem('adminCredentials');
    if (!savedCredsString) {
        setPasswordError('Erro ao carregar credenciais.');
        return;
    }
    const savedCreds = JSON.parse(savedCredsString);

    if (currentPassword !== savedCreds.password) {
        setPasswordError('A senha atual está incorreta.');
        return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError('As novas senhas não coincidem.');
        return;
    }
    
    const newCreds = { ...savedCreds, password: newPassword };
    localStorage.setItem('adminCredentials', JSON.stringify(newCreds));
    setPasswordSuccess('Senha alterada com sucesso!');
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => setPasswordSuccess(''), 3000);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setShippingError('');
    setShippingSuccess('');

    const value = shippingCost.replace('.', '').replace(',', '.');
    const numericValue = parseFloat(value);
    
    if (isNaN(numericValue) || numericValue < 0) {
      setShippingError('Por favor, insira um valor de frete válido.');
      return;
    }

    localStorage.setItem('standardShippingCost', numericValue.toFixed(2));
    setShippingSuccess('Valor do frete salvo com sucesso!');

    setTimeout(() => setShippingSuccess(''), 3000);
  };
  
  const handleExport = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'jsstore_products_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
  };
  
  const handleImportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];

    if (!file) return;

    setImportError('');
    setImportSuccess('');

    fileReader.readAsText(file, "UTF-8");
    fileReader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error("Não foi possível ler o arquivo.");
        }
        const importedProducts = JSON.parse(content);
        
        // Validação simples
        if (!Array.isArray(importedProducts)) {
          throw new Error("O arquivo JSON deve conter um array de produtos.");
        }
        
        const response = await fetch('/api/products/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedProducts)
        });

        if (!response.ok) {
          throw new Error('Falha ao enviar dados para o servidor.');
        }

        setImportSuccess('Dados importados com sucesso! A lista de produtos foi atualizada.');
        onRefreshProducts(); // Recarrega os produtos na interface
        setTimeout(() => setImportSuccess(''), 4000);

      } catch (error) {
        console.error(error);
        const message = (error as Error).message || 'Ocorreu um erro desconhecido.';
        setImportError(`Erro ao importar: ${message}`);
        setTimeout(() => setImportError(''), 4000);
      } finally {
         if (event.target) {
           event.target.value = ''; // Permite re-selecionar o mesmo arquivo
         }
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
               <img className="h-16 w-auto" src={LOGO_BASE64} alt="JS Store Logo" />
               <h1 className="text-xl font-bold text-gray-800">Painel do Administrador</h1>
            </div>
            <a href="#/" className="text-sm text-blue-600 hover:underline mr-4">Ver Loja</a>
            <button onClick={onLogout} className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {showRestorePrompt && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md shadow-lg" role="alert">
            <div className="flex">
                <div className="py-1"><svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg></div>
                <div>
                <p className="font-bold">Dados do servidor parecem ter sido reiniciados!</p>
                <p className="text-sm">Encontramos um backup local dos seus produtos. Deseja restaurá-lo?</p>
                <div className="mt-3">
                    <button 
                    onClick={handleRestoreBackup}
                    disabled={isRestoring}
                    className="bg-yellow-500 text-white font-bold py-1 px-3 rounded text-sm hover:bg-yellow-600 disabled:bg-yellow-300"
                    >
                    {isRestoring ? 'Restaurando...' : 'Sim, restaurar backup'}
                    </button>
                    <button onClick={() => setShowRestorePrompt(false)} className="ml-4 text-sm font-semibold text-yellow-800 hover:underline">Ignorar</button>
                </div>
                </div>
            </div>
            </div>
        )}
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
            <button onClick={handleOpenAddModal} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2">
                <PlusIcon /> Adicionar Produto
            </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategoria</th>
                    <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Ações</span>
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                    <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrls[0]} alt={product.name} loading="lazy" />
                            </div>
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.subcategory}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button onClick={() => handleOpenEditModal(product)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Configurações de Frete</h2>
            <form onSubmit={handleSaveShipping} className="space-y-4">
               <div>
                <label htmlFor="shipping-cost"  className="block text-sm font-medium text-gray-700">Frete Padrão (não-dropshipping)</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R$</span>
                  <input
                    id="shipping-cost"
                    name="shipping-cost"
                    type="text"
                    required
                    placeholder="Ex: 25,00"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    className="pl-9 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  />
                </div>
              </div>

              {shippingError && <p className="text-sm text-red-600">{shippingError}</p>}
              {shippingSuccess && <p className="text-sm text-green-600">{shippingSuccess}</p>}
              
              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Salvar Frete
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Alterar Senha</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password"  className="block text-sm font-medium text-gray-700">Senha Atual</label>
                <input
                  id="current-password"
                  name="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="new-password"  className="block text-sm font-medium text-gray-700">Nova Senha</label>
                <input
                  id="new-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}

              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                  Salvar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Gerenciamento de Dados</h2>
            <p className="text-sm text-gray-600 mb-4">Exporte seus dados de produtos para um arquivo de backup ou importe um arquivo para restaurar sua loja. Isso é útil pois os dados podem ser resetados no ambiente do servidor.</p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={handleExport} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                    <DownloadIcon /> Exportar Dados (JSON)
                </button>

                <input
                    type="file"
                    id="import-file"
                    className="hidden"
                    accept=".json"
                    onChange={handleImportChange}
                />
                <label htmlFor="import-file" className="w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    <UploadIcon /> Importar Dados (JSON)
                </label>
            </div>
             {importError && <p className="mt-2 text-sm text-red-600">{importError}</p>}
             {importSuccess && <p className="mt-2 text-sm text-green-600">{importSuccess}</p>}
        </div>

      </main>
      {isModalOpen && (
          <ProductFormModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveProduct}
            product={editingProduct}
          />
      )}
    </div>
  );
};

export default AdminPage;