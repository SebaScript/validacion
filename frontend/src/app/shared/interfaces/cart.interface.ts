import { Product } from './product.interface';

export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  cartId: number;
  userId: number;
  items: CartItem[];
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateQuantityRequest {
  quantity: number;
}

export interface CartTotal {
  itemCount: number;
  total: number;
}
