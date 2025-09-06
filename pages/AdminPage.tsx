import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

interface Product {
  id?: number;
  name: string;
  price: string;
  imageUrls: string[];
  category: string;
  subcategory: string;
  description?: string;
}

const AdminPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

  // 🔹 Busca produtos do Supabase ao montar o componente
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("produtos").select("*");
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      console.error(err);
      setImportError("Erro ao buscar produtos: " + (err.message || "desconhecido"));
      setTimeout(() => setImportError(""), 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔹 Importar JSON direto no Supabase
  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportSuccess("");

    try {
      const text = await file.text();
      const importedProducts = JSON.parse(text);

      if (!Array.isArray(importedProducts)) {
        throw new Error("O arquivo JSON deve conter um array de produtos.");
      }

      // Remove ids para evitar conflito
      const cleaned = importedProducts.map(({ id, ...rest }: any) => rest);

      // 🔹 Limpa a tabela antes de inserir (opcional)
      const { error: delError } = await supabase.from("produtos").delete().neq("id", 0);
      if (delError) throw delError;

      // 🔹 Insere os produtos no Supabase
      const { data, error } = await supabase.from("produtos").insert(cleaned).select();
      if (error) throw error;

      setImportSuccess(`${data?.length || 0} produtos importados com sucesso!`);
      fetchProducts(); // Atualiza a lista
      setTimeout(() => setImportSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setImportError("Erro ao importar: " + (err.message || "desconhecido"));
      setTimeout(() => setImportError(""), 4000);
    } finally {
      e.target.value = ""; // permite re-selecionar o mesmo arquivo
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administração de Produtos</h1>

      {/* 🔹 Importar Produtos JSON */}
      <label className="block mb-2 font-semibold">Importar produtos (JSON):</label>
      <input
        type="file"
        accept="application/json"
        onChange={handleImportChange}
        className="mb-4"
      />
      {importError && <p className="text-red-600">{importError}</p>}
      {importSuccess && <p className="text-green-600">{importSuccess}</p>}

      {/* 🔹 Listagem de produtos */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Produtos atuais:</h2>
      {loading ? (
        <p>Carregando produtos...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="border rounded-lg shadow-sm p-3 bg-white">
              <img
                src={p.imageUrls?.[0]}
                alt={p.name}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-bold mt-2">{p.name}</h3>
              <p className="text-gray-600">{p.price}</p>
              <p className="text-sm">{p.category} / {p.subcategory}</p>
              {p.description && <p className="text-sm mt-1">{p.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
