import React, { useState } from "react";
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

interface AdminPageProps {
  products: Product[];
  onRefreshProducts: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ products, onRefreshProducts }) => {
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

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

      // 🔹 (Opcional) Limpa a tabela antes
      const { error: delError } = await supabase.from("produtos").delete().neq("id", 0);
      if (delError) throw delError;

      // 🔹 Insere no Supabase
      const { data, error } = await supabase.from("produtos").insert(cleaned).select();
      if (error) throw error;

      onRefreshProducts();
      setImportSuccess(`${data?.length || 0} produtos importados com sucesso!`);
      setTimeout(() => setImportSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setImportError("Erro ao importar: " + (err.message || "desconhecido"));
      setTimeout(() => setImportError(""), 4000);
    } finally {
      e.target.value = ""; // libera pra re-escolher o mesmo arquivo
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

      {/* 🔹 Listagem simples */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Produtos atuais:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="border rounded-lg shadow-sm p-3 bg-white"
          >
            <img
              src={p.imageUrls?.[0]}
              alt={p.name}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="font-bold mt-2">{p.name}</h3>
            <p className="text-gray-600">{p.price}</p>
            <p className="text-sm">{p.category} / {p.subcategory}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
