export interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  category: 'Mulher' | 'Homem';
  subcategory: string;
  description?: string;
}

export interface CartItem extends Product {
  quantity: number;
}