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

    // Rota específica para importação de dados
    if (method === 'POST' && url === '/api/products/import') {
      const importedProducts = body;
      if (!Array.isArray(importedProducts)) {
        return res.status(400).json({ error: 'Body must be an array of products' });
      }
      products = importedProducts;
      return res.status(200).json({ message: 'Products imported successfully' });
    }

    // Rotas CRUD padrão para /api/products, ajustado para não capturar sub-rotas como 'import'
    if (url === '/api/products' || url?.startsWith('/api/products?')) {
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
            return res.status(400).json({ error: 'Product ID is required' });
          }
          const id = parseInt(idParam, 10);
          const updatedProductData = body;
          const productIndex = products.findIndex(p => p.id === id);

          if (productIndex === -1) {
            return res.status(404).json({ error: 'Product not found' });
          }
          
          products[productIndex] = { ...products[productIndex], ...updatedProductData };
          return res.status(200).json(products[productIndex]);
        }
            
        case 'DELETE': {
          if (!idParam) {
            return res.status(400).json({ error: 'Product ID is required' });
          }
          const id = parseInt(idParam, 10);
          const initialLength = products.length;
          products = products.filter(p => p.id !== id);
            
          if (products.length === initialLength) {
            return res.status(404).json({ error: 'Product not found' });
          }
            
          return res.status(204).send(null);
        }

        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
    
    // Se nenhuma rota corresponder, retorna 404
    return res.status(404).json({ error: 'Not Found' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}