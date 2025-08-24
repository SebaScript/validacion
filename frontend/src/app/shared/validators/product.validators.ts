import { CreateProductDto, UpdateProductDto } from '../interfaces/product.interface';

export class ProductValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductValidationError';
  }
}

export class ProductValidators {
  static validateCreateProduct(dto: CreateProductDto): string[] {
    const errors: string[] = [];

    // Name validation
    if (!dto.name || typeof dto.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (dto.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (dto.name.length > 100) {
      errors.push('Name must not exceed 100 characters');
    }

    // Description validation (optional)
    if (dto.description !== undefined && typeof dto.description !== 'string') {
      errors.push('Description must be a string');
    }

    // Price validation
    if (dto.price === undefined || dto.price === null) {
      errors.push('Price is required');
    } else if (typeof dto.price !== 'number' || isNaN(dto.price)) {
      errors.push('Price must be a valid number');
    } else if (dto.price <= 0) {
      errors.push('Price must be positive');
    }

    // Stock validation
    if (dto.stock === undefined || dto.stock === null) {
      errors.push('Stock is required');
    } else if (typeof dto.stock !== 'number' || isNaN(dto.stock)) {
      errors.push('Stock must be a valid number');
    } else if (dto.stock < 0) {
      errors.push('Stock must be positive or zero');
    } else if (!Number.isInteger(dto.stock)) {
      errors.push('Stock must be an integer');
    }

    // Image validation (optional)
    if (dto.imageUrl !== undefined && typeof dto.imageUrl !== 'string') {
      errors.push('Image URL must be a string');
    }

    // Carousel images validation (optional)
    if (dto.carouselUrl !== undefined) {
      if (!Array.isArray(dto.carouselUrl)) {
        errors.push('Carousel images must be an array');
      } else {
        dto.carouselUrl.forEach((url, index) => {
          if (typeof url !== 'string') {
            errors.push(`Carousel image at index ${index} must be a string`);
          }
        });
      }
    }

    // CategoryId validation
    if (dto.categoryId === undefined || dto.categoryId === null) {
      errors.push('Category ID is required');
    } else if (typeof dto.categoryId !== 'number' || isNaN(dto.categoryId)) {
      errors.push('Category ID must be a valid number');
    } else if (dto.categoryId <= 0) {
      errors.push('Category ID must be positive');
    } else if (!Number.isInteger(dto.categoryId)) {
      errors.push('Category ID must be an integer');
    }

    return errors;
  }

  static validateUpdateProduct(dto: UpdateProductDto): string[] {
    const errors: string[] = [];

    // Name validation (optional for update)
    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string') {
        errors.push('Name must be a string');
      } else if (dto.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      } else if (dto.name.length > 100) {
        errors.push('Name must not exceed 100 characters');
      }
    }

    // Description validation (optional)
    if (dto.description !== undefined && typeof dto.description !== 'string') {
      errors.push('Description must be a string');
    }

    // Price validation (optional for update)
    if (dto.price !== undefined) {
      if (typeof dto.price !== 'number' || isNaN(dto.price)) {
        errors.push('Price must be a valid number');
      } else if (dto.price <= 0) {
        errors.push('Price must be positive');
      }
    }

    // Stock validation (optional for update)
    if (dto.stock !== undefined) {
      if (typeof dto.stock !== 'number' || isNaN(dto.stock)) {
        errors.push('Stock must be a valid number');
      } else if (dto.stock < 0) {
        errors.push('Stock must be positive or zero');
      } else if (!Number.isInteger(dto.stock)) {
        errors.push('Stock must be an integer');
      }
    }

    // Image validation (optional)
    if (dto.imageUrl !== undefined && typeof dto.imageUrl !== 'string') {
      errors.push('Image URL must be a string');
    }

    // Carousel images validation (optional)
    if (dto.carouselUrl !== undefined) {
      if (!Array.isArray(dto.carouselUrl)) {
        errors.push('Carousel images must be an array');
      } else {
        dto.carouselUrl.forEach((url, index) => {
          if (typeof url !== 'string') {
            errors.push(`Carousel image at index ${index} must be a string`);
          }
        });
      }
    }

    // CategoryId validation (optional for update)
    if (dto.categoryId !== undefined) {
      if (typeof dto.categoryId !== 'number' || isNaN(dto.categoryId)) {
        errors.push('Category ID must be a valid number');
      } else if (dto.categoryId <= 0) {
        errors.push('Category ID must be positive');
      } else if (!Number.isInteger(dto.categoryId)) {
        errors.push('Category ID must be an integer');
      }
    }

    return errors;
  }

  static validateAndThrow(dto: CreateProductDto | UpdateProductDto, isUpdate = false): void {
    const errors = isUpdate
      ? this.validateUpdateProduct(dto as UpdateProductDto)
      : this.validateCreateProduct(dto as CreateProductDto);

    if (errors.length > 0) {
      throw new ProductValidationError(errors.join(', '));
    }
  }
}
