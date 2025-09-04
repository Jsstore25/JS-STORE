// Em uma aplicação real, você se conectaria a um banco de dados como Vercel Postgres, Firebase, etc.
// Para este exemplo, usamos uma simples variável em memória para simular um banco de dados.
// NOTA: Em um ambiente serverless, esta memória é reiniciada em cada nova instância da função.

// Tipos e dados iniciais foram internalizados para evitar problemas de importação no ambiente serverless.
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

const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "Slip On (1ª linha)", 
    price: "R$ 100,00", 
    imageUrls: ["https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80"], 
    category: "Feminino", 
    subcategory: "Calçados", 
    description: "Tênis slip on super confortável e estiloso, com design moderno e prático para o dia a dia. Tamanhos disponíveis do 34 ao 39.",
    reviews: [
      {
        id: 1,
        author: "Ana P.",
        rating: 5,
        comment: "Amei o tênis! Super confortável e a cor é linda. Chegou antes do prazo.",
        date: "2024-05-20T10:00:00Z"
      },
      {
        id: 2,
        author: "Carlos",
        rating: 4,
        comment: "Produto de boa qualidade, corresponde à descrição. Apenas um pouco apertado no início.",
        date: "2024-05-18T15:30:00Z"
      }
    ]
  },
];


// Criamos uma cópia profunda para evitar que as mutações afetem o array original.
let products: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));


// Este manipulador usa a sintaxe do Vercel Node.js runtime (req, res).
export default async function handler(req: any, res: any) {
  try {
    const { url, method, query, body } = req;

    // Remove a query string e divide a URL em segmentos para um roteamento robusto.
    const pathSegments = url.split('?')[0].split('/').filter(Boolean);

    // Rota: /api/products/import
    if (pathSegments[0] === 'api' && pathSegments[1] === 'products' && pathSegments[2] === 'import' && pathSegments.length === 3) {
      if (method === 'POST') {
        const importedProducts = body;
        if (!Array.isArray(importedProducts)) {
          return res.status(400).json({ error: 'O corpo da requisição deve ser um array de produtos.' });
        }
        products = importedProducts; // Substitui a lista de produtos em memória.
        return res.status(200).json({ message: 'Produtos importados com sucesso.' });
      } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Método ${method} não permitido para a rota de importação.`);
      }
    }

    // Rota: /api/products (e com query params)
    if (pathSegments[0] === 'api' && pathSegments[1] === 'products' && pathSegments.length === 2) {
      const idParam = query.id as string;

      switch (method) {
        case 'GET':
          return res.status(200).json(products);

        case 'POST': {
          const newProductData = body;
          const newProduct: Product = {
            ...newProductData,
            id: Date.now(),
            reviews: newProductData.reviews || [],
          };
          products.push(newProduct);
          return res.status(201).json(newProduct);
        }

        case 'PUT': {
          if (!idParam) {
            return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
          }
          const id = parseInt(idParam, 10);
          const updatedProductData = body;
          const productIndex = products.findIndex(p => p.id === id);

          if (productIndex === -1) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
          }
          
          products[productIndex] = { ...products[productIndex], ...updatedProductData };
          return res.status(200).json(products[productIndex]);
        }
            
        case 'DELETE': {
          if (!idParam) {
            return res.status(400).json({ error: 'O ID do produto é obrigatório.' });
          }
          const id = parseInt(idParam, 10);
          const initialLength = products.length;
          products = products.filter(p => p.id !== id);
            
          if (products.length === initialLength) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
          }
            
          return res.status(204).send(null);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Método ${method} não permitido para a rota de produtos.`);
      }
    }
    
    // Se nenhuma rota corresponder, retorna 404
    return res.status(404).json({ error: 'Rota não encontrada.' });

  } catch (error: any) {
    console.error('Erro na API:', error);
    return res.status(500).json({ error: 'Erro Interno do Servidor', message: error.message });
  }
}
