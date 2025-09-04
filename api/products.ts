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


export default async function handler(req: Request) {
  try {
    const url = new URL(req.url, `http://dummy.base`);
    const { pathname } = url;
    const { method } = req;

    // Rota específica para importação de dados
    if (method === 'POST' && pathname === '/api/products/import') {
      const importedProducts = await req.json();
      if (!Array.isArray(importedProducts)) {
        return new Response(JSON.stringify({ error: 'Body must be an array of products' }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
      products = importedProducts; // Substitui completamente os dados em memória
      return new Response(JSON.stringify({ message: 'Products imported successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rotas CRUD padrão para /api/products
    if (pathname === '/api/products') {
      const idParam = url.searchParams.get('id');

      switch (method) {
        case 'GET':
          return new Response(JSON.stringify(products), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });

        case 'POST': {
          const newProductData = await req.json();
          const newProduct: Product = {
            ...newProductData,
            id: Date.now(), // Gera um ID único baseado no timestamp
            reviews: newProductData.reviews || [],
          };
          products.push(newProduct);
          return new Response(JSON.stringify(newProduct), {
            status: 201, // 201 Created
            headers: { 'Content-Type': 'application/json' },
          });
        }

        case 'PUT': {
          if (!idParam) {
            return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          const id = parseInt(idParam, 10);
          const updatedProductData = await req.json();
          const productIndex = products.findIndex(p => p.id === id);

          if (productIndex === -1) {
            return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
          }
          
          products[productIndex] = { ...products[productIndex], ...updatedProductData };
          return new Response(JSON.stringify(products[productIndex]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
            
        case 'DELETE': {
          if (!idParam) {
            return new Response(JSON.stringify({ error: 'Product ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
          }
          const id = parseInt(idParam, 10);
          const initialLength = products.length;
          products = products.filter(p => p.id !== id);
            
          if (products.length === initialLength) {
            return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
          }
            
          return new Response(null, { status: 204 }); // 204 No Content
        }

        default:
          const headers = new Headers();
          headers.set('Allow', 'GET, POST, PUT, DELETE');
          return new Response('Method Not Allowed', { status: 405, headers });
      }
    }
    
    // Se nenhuma rota corresponder, retorna 404
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
