import { supabase } from '../lib/supabaseClient';

// Mantemos os tipos aqui para evitar problemas de importação no ambiente serverless.
export interface Review {
  id: number;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

export interface Product {
  id: number;
  name: string;
  price: string;
  imageUrls: string[];
  category: 'Feminino' | 'Masculino';
  subcategory: string;
  description?: string;
  reviews?: Review[];
}

// Este manipulador usa a sintaxe do Vercel Node.js runtime (req, res).
export default async function handler(req: any, res: any) {
  try {
    const { url, method, query, body } = req;
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);

    if (pathSegments[0] === 'api' && pathSegments[1] === 'products' && pathSegments.length === 2) {
      const idParam = query.id as string;

      switch (method) {
        case 'GET': {
          const { data, error } = await supabase
            .from('produtos')
            .select('*')
            .order('id', { ascending: true });

          if (error) throw error;
          return res.status(200).json(data);
        }

        case 'POST': {
          if (Array.isArray(body)) {
            // ATENÇÃO: Esta operação é destrutiva. Ela apaga todos os produtos existentes antes de importar os novos.
            const { error: deleteError } = await supabase.from('produtos').delete().neq('id', 0);
            if (deleteError) throw deleteError;

            // Remove o ID do cliente, pois o Supabase irá gerá-lo
            const productsToInsert = body.map(({ id, ...rest }) => rest);
            const { error: insertError } = await supabase.from('produtos').insert(productsToInsert);
            if (insertError) throw insertError;
            
            return res.status(200).json({ message: 'Produtos importados com sucesso.' });
          } else {
            const { id, ...newProductData } = body;
            const { data, error } = await supabase
              .from('produtos')
              .insert([newProductData])
              .select()
              .single();

            if (error) throw error;
            return res.status(201).json(data);
          }
        }

        case 'PUT': {
          if (!idParam) {
            return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
          }
          const id = parseInt(idParam, 10);
          const { id: bodyId, ...updatedProductData } = body;

          const { data, error } = await supabase
            .from('produtos')
            .update(updatedProductData)
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;
          if (!data) return res.status(404).json({ error: 'Produto não encontrado.' });
          return res.status(200).json(data);
        }
            
        case 'DELETE': {
          if (!idParam) {
            return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
          }
          const id = parseInt(idParam, 10);
          
          const { error } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

          if (error) throw error;
          return res.status(204).send(null);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Método ${method} não permitido.`);
      }
    }
    
    return res.status(404).json({ error: 'Rota não encontrada.' });

  } catch (error: any) {
    console.error('Erro na API Supabase:', error);
    return res.status(500).json({ error: 'Erro Interno do Servidor', message: error.message });
  }
}