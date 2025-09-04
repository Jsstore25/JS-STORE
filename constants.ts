import type { Product } from './types';

export const WHATSAPP_LINK = "https://wa.me/5531991687046?text=Oi%2C%20tudo%20bem%3F%20Quero%20saber%20mais%20sobre%20os%20produtos";
export const INSTAGRAM_LINK = "https://www.instagram.com/jsstore25_/";
export const LOCATION_LINK = "https://www.google.com/maps/search/?api=1&query=Rua+Flemidark,+93,+Santa+Cecilia,+Belo+Horizonte,+MG,+30668-190";

export const LOGO_BASE64 = `data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.j, .s %7B font-family: 'Times New Roman', serif; font-size: 80px; fill: %23111; %7D .store %7B font-family: 'Helvetica', sans-serif; font-size: 24px; letter-spacing: 4px; fill: %23111; %7D%3C/style%3E%3Ctext x='40' y='80' class='j'%3EJ%3C/text%3E%3Ctext x='60' y='110' class='s'%3ES%3C/text%3E%3Cline x1='40' y1='40' x2='110' y2='120' stroke='%23111' stroke-width='3' /%3E%3Ctext x='75' y='140' text-anchor='middle' class='store'%3ESTORE%3C/text%3E%3C/svg%3E`;

export const SUBCATEGORIES: { [key in 'Mulher' | 'Homem']: string[] } = {
  Mulher: ['Blusas', 'Calças', 'Shorts', 'Vestidos', 'Calçados', 'Acessórios'],
  Homem: ['Blusas', 'Calças', 'Bermudas', 'Calçados', 'Acessórios'],
};

export const INITIAL_PRODUCTS: Product[] = [
  // Mulher
  { id: 1, name: "Calça Jeans Skinny", price: "R$ 189,90", imageUrls: ["https://picsum.photos/seed/m1/400/500", "https://picsum.photos/seed/m1-2/400/500", "https://picsum.photos/seed/m1-3/400/500"], category: "Mulher", subcategory: "Calças", description: "Calça jeans skinny de cintura alta, com lavagem moderna e tecido com elastano para máximo conforto e ajuste perfeito ao corpo. Ideal para o dia a dia." },
  { id: 2, name: "Blusa de Seda", price: "R$ 129,90", imageUrls: ["https://picsum.photos/seed/m2/400/500"], category: "Mulher", subcategory: "Blusas", description: "Blusa de seda leve e elegante, com caimento fluido e detalhes em renda no decote. Perfeita para ocasiões especiais ou para um look de trabalho sofisticado." },
  { id: 3, name: "Sandália Anabela", price: "R$ 219,90", imageUrls: ["https://picsum.photos/seed/m3/400/500"], category: "Mulher", subcategory: "Calçados", description: "Sandália anabela com salto em corda e tiras de couro. Confortável e estilosa, é a escolha ideal para compor looks de verão." },
  { id: 4, name: "Short Jeans Destroyed", price: "R$ 99,90", imageUrls: ["https://picsum.photos/seed/m4/400/500"], category: "Mulher", subcategory: "Shorts", description: "Short jeans de lavagem clara com detalhes destroyed. Uma peça versátil e moderna para os dias mais quentes." },
  { id: 5, name: "Bolsa de Couro", price: "R$ 299,90", imageUrls: ["https://picsum.photos/seed/m5/400/500"], category: "Mulher", subcategory: "Acessórios", description: "Bolsa de couro legítimo com design clássico e atemporal. Espaçosa e funcional, é perfeita para acompanhar você em todos os momentos." },
  { id: 6, name: "Vestido Floral", price: "R$ 249,90", imageUrls: ["https://picsum.photos/seed/m6/400/500"], category: "Mulher", subcategory: "Vestidos" },
  { id: 7, name: "Tênis Casual Branco", price: "R$ 199,90", imageUrls: ["https://picsum.photos/seed/m7/400/500"], category: "Mulher", subcategory: "Calçados" },
  { id: 8, name: "Calça Pantalona", price: "R$ 179,90", imageUrls: ["https://picsum.photos/seed/m8/400/500"], category: "Mulher", subcategory: "Calças" },
  
  // Homem
  { id: 9, name: "Calça Jeans Reta", price: "R$ 199,90", imageUrls: ["https://picsum.photos/seed/h1/400/500", "https://picsum.photos/seed/h1-2/400/500"], category: "Homem", subcategory: "Calças", description: "Calça jeans masculina de corte reto, confeccionada em algodão de alta qualidade. Confortável e durável, ideal para qualquer ocasião." },
  { id: 10, name: "Camiseta Básica", price: "R$ 79,90", imageUrls: ["https://picsum.photos/seed/h2/400/500"], category: "Homem", subcategory: "Blusas", description: "Camiseta básica de algodão pima, com toque macio e caimento perfeito. Essencial em qualquer guarda-roupa." },
  { id: 11, name: "Sapatênis de Couro", price: "R$ 259,90", imageUrls: ["https://picsum.photos/seed/h3/400/500"], category: "Homem", subcategory: "Calçados" },
  { id: 12, name: "Bermuda Chino", price: "R$ 119,90", imageUrls: ["https://picsum.photos/seed/h4/400/500"], category: "Homem", subcategory: "Bermudas" },
  { id: 13, name: "Relógio de Pulso", price: "R$ 349,90", imageUrls: ["https://picsum.photos/seed/h5/400/500"], category: "Homem", subcategory: "Acessórios" },
  { id: 14, name: "Camisa Polo", price: "R$ 139,90", imageUrls: ["https://picsum.photos/seed/h6/400/500"], category: "Homem", subcategory: "Blusas" },
  { id: 15, name: "Bermuda Cargo", price: "R$ 149,90", imageUrls: ["https://picsum.photos/seed/h7/400/500"], category: "Homem", subcategory: "Bermudas" },
  { id: 16, name: "Chinelo Slide", price: "R$ 89,90", imageUrls: ["https://picsum.photos/seed/h8/400/500"], category: "Homem", subcategory: "Calçados" },
];