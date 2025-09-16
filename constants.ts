import type { Product } from './types';

export const WHATSAPP_LINK = "https://wa.me/5531991687046?text=Oi%2C%20tudo%20bem%3F%20Quero%20saber%20mais%20sobre%20os%20produtos";
export const INSTAGRAM_LINK = "https://www.instagram.com/jsstore25_/";
export const LOCATION_LINK = "https://www.google.com/maps/search/?api=1&query=Rua+Flemidark,+93,+Santa+Cecilia,+Belo+Horizonte,+MG,+30668-190";

export const LOGO_BASE64 = `data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.j, .s %7B font-family: 'Times New Roman', serif; font-size: 80px; fill: %23111; %7D .store %7B font-family: 'Helvetica', sans-serif; font-size: 24px; letter-spacing: 4px; fill: %23111; %7D%3C/style%3E%3Ctext x='40' y='80' class='j'%3EJ%3C/text%3E%3Ctext x='60' y='110' class='s'%3ES%3C/text%3E%3Cline x1='40' y1='40' x2='110' y2='120' stroke='%23111' stroke-width='3' /%3E%3Ctext x='75' y='140' text-anchor='middle' class='store'%3ESTORE%3C/text%3E%3C/svg%3E`;

export const SUBCATEGORIES: { [key in 'Feminino' | 'Masculino' | 'Infantil']: string[] } = {
  Feminino: ['Blusas', 'Calças', 'Shorts', 'Vestidos', 'Calçados', 'Acessórios'],
  Masculino: ['Blusas', 'Calças', 'Bermudas', 'Calçados', 'Acessórios'],
  Infantil: ['Blusas', 'Calças', 'Shorts', 'Bermudas', 'Vestidos', 'Calçados', 'Acessórios'],
};

export const INITIAL_PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: "Slip On (1ª linha)", 
    price: "R$ 100,00", 
    imageurls: ["https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80"], 
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