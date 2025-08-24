export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  carouselUrl?: string[];
  categoryId: number;
  category?: string; // Para mostrar el nombre de la categoría
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  carouselUrl?: string[];
  categoryId: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  carouselUrl?: string[];
  categoryId?: number;
}
