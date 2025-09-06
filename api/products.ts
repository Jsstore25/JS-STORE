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
  imageurls: string[];
  category: 'Feminino' | 'Masculino';
  subcategory: string;
  description?: string;
  reviews?: Review[];
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;

const baseHeaders = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
};

// Este manipulador usa a sintaxe do Vercel Node.js runtime (req, res).
export default async function handler(req: any, res: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = 'As variáveis de ambiente do servidor SUPABASE_URL e/ou SUPABASE_KEY não foram encontradas no Vercel. Verifique as configurações do seu projeto e garanta que elas foram adicionadas SEM o prefixo "VITE_".';
    console.error(errorMessage);
    return res.status(500).json({ message: errorMessage });
  }

  try {
    const { url, method, query, body } = req;
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);

    if (pathSegments[0] === 'api' && pathSegments[1] === 'products' && pathSegments.length === 2) {
      const idParam = query.id as string;

      switch (method) {
        case 'GET': {
          const fetchRes = await fetch(`${supabaseUrl}/rest/v1/produtos?select=*&order=id.asc`, { headers: baseHeaders });
          if (!fetchRes.ok) throw new Error(await fetchRes.text());
          const data = await fetchRes.json();
          return res.status(200).json(data);
        }

        case 'POST': {
          if (Array.isArray(body)) {
            // Importação em massa: apaga os antigos e insere os novos
            const deleteRes = await fetch(`${supabaseUrl}/rest/v1/produtos?id=not.is.null`, { 
                method: 'DELETE', 
                headers: baseHeaders 
            });
            if (!deleteRes.ok) throw new Error(`Falha ao limpar produtos: ${await deleteRes.text()}`);
            
            if (body.length > 0) {
              const productsToInsert = body.map(p => {
                const { id, ...rest } = p;
                return rest;
              });
              const insertRes = await fetch(`${supabaseUrl}/rest/v1/produtos`, {
                method: 'POST',
                headers: { ...baseHeaders, 'Prefer': 'return=minimal' },
                body: JSON.stringify(productsToInsert),
              });
              if (!insertRes.ok) throw new Error(`Falha ao inserir produtos: ${await insertRes.text()}`);
            }
            
            return res.status(200).json({ message: 'Produtos importados com sucesso.' });
          } else {
            // Inserção de um único produto
            const { id, ...newProductData } = body;
            const insertRes = await fetch(`${supabaseUrl}/rest/v1/produtos?select=*`, {
              method: 'POST',
              headers: { ...baseHeaders, 'Prefer': 'representation' },
              body: JSON.stringify(newProductData),
            });

            if (!insertRes.ok) throw new Error(await insertRes.text());
            const [data] = await insertRes.json();
            return res.status(201).json(data);
          }
        }

        case 'PUT': {
          if (!idParam) return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
          const id = parseInt(idParam, 10);
          const { id: bodyId, ...updatedProductData } = body;

          const updateRes = await fetch(`${supabaseUrl}/rest/v1/produtos?id=eq.${id}&select=*`, {
            method: 'PATCH', // O método de atualização do Supabase REST é PATCH
            headers: { ...baseHeaders, 'Prefer': 'representation' },
            body: JSON.stringify(updatedProductData),
          });

          if (!updateRes.ok) throw new Error(await updateRes.text());
          const [data] = await updateRes.json();
          if (!data) return res.status(404).json({ message: 'Produto não encontrado.' });
          return res.status(200).json(data);
        }
            
        case 'DELETE': {
          if (!idParam) return res.status(400).json({ message: 'O ID do produto é obrigatório.' });
          const id = parseInt(idParam, 10);
          
          const deleteRes = await fetch(`${supabaseUrl}/rest/v1/produtos?id=eq.${id}`, {
            method: 'DELETE',
            headers: baseHeaders,
          });

          if (!deleteRes.ok) throw new Error(await deleteRes.text());
          return res.status(204).send(null);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Método ${method} não permitido.`);
      }
    }
    
    return res.status(404).json({ message: 'Rota não encontrada.' });

  } catch (error: unknown) {
    let originalErrorMessage = 'Erro desconhecido.';
    if (error instanceof Error) {
        originalErrorMessage = error.message;
    } else if (typeof error === 'string') {
        originalErrorMessage = error;
    }

    console.error('Erro na API com Fetch para Supabase:', originalErrorMessage);
    
    let hint;
    const baseHint = "Verifique se as chaves (URL/KEY) do Supabase estão corretas e se as políticas de RLS (Row Level Security) da sua tabela 'produtos' estão configuradas corretamente.";

    switch (req.method) {
        case 'GET':
            hint = `${baseHint} A política de 'SELECT' deve permitir acesso público/anônimo.`;
            break;
        case 'POST':
            hint = `${baseHint} A política de 'INSERT' deve permitir acesso para a chave utilizada (role 'anon').`;
            break;
        case 'PUT':
        case 'PATCH':
            hint = `${baseHint} A política de 'UPDATE' deve permitir acesso para a chave utilizada (role 'anon').`;
            break;
        case 'DELETE':
            hint = `${baseHint} A política de 'DELETE' deve permitir acesso para a chave utilizada (role 'anon').`;
            break;
        default:
            hint = baseHint;
    }

    try {
        const supabaseError = JSON.parse(originalErrorMessage);
        if (supabaseError.message) {
            hint += `\n\nDetalhe do Supabase: ${supabaseError.message}`;
        }
    } catch (e) {
        // Não era um erro JSON do Supabase. Adiciona o erro bruto.
        hint += `\n\nDetalhe do Erro: ${originalErrorMessage}`;
    }

    const detailedMessage = `Falha na comunicação com o Supabase. ${hint}`;
    
    return res.status(500).json({ message: detailedMessage });
  }
}