export interface Product {
  id: number;
  name: string;
  price: string;
  imageUrls: string[];
  category: 'Feminino' | 'Masculino';
  subcategory: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}