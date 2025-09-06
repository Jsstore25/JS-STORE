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
        throw new Error(
