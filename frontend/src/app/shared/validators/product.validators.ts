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

    // Validate required string fields
    this.validateStringField(dto.name, 'Name', { required: true, maxLength: 100 }, errors);
    this.validateStringField(dto.description, 'Description', { required: false }, errors);
    this.validateStringField(dto.imageUrl, 'Image URL', { required: false }, errors);

    // Validate required numeric fields
    this.validateNumericField(dto.price, 'Price', { required: true, min: 0.01 }, errors);
    this.validateNumericField(dto.stock, 'Stock', { required: true, min: 0, integer: true }, errors);
    this.validateNumericField(dto.categoryId, 'Category ID', { required: true, min: 1, integer: true }, errors);

    // Validate carousel images
    this.validateCarouselImages(dto.carouselUrl, errors);

    return errors;
  }

  private static validateStringField(value: any, fieldName: string, options: { required: boolean; maxLength?: number }, errors: string[]): void {
    if (options.required && (!value || typeof value !== 'string')) {
      errors.push(`${fieldName} is required and must be a string`);
      return;
    }

    if (value !== undefined) {
      if (typeof value !== 'string') {
        errors.push(`${fieldName} must be a string`);
      } else if (value.trim().length === 0) {
        errors.push(`${fieldName} cannot be empty`);
      } else if (options.maxLength && value.length > options.maxLength) {
        errors.push(`${fieldName} must not exceed ${options.maxLength} characters`);
      }
    }
  }

  private static validateNumericField(value: any, fieldName: string, options: { required: boolean; min?: number; integer?: boolean }, errors: string[]): void {
    if (options.required && (value === undefined || value === null)) {
      errors.push(`${fieldName} is required`);
      return;
    }

    if (value !== undefined && value !== null) {
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${fieldName} must be a valid number`);
      } else if (options.min !== undefined && value < options.min) {
        const minValue = options.min === 0 ? 'greater than or equal to zero' : `greater than or equal to ${options.min}`;
        errors.push(`${fieldName} must be ${minValue}`);
      } else if (options.integer && !Number.isInteger(value)) {
        errors.push(`${fieldName} must be an integer`);
      }
    }
  }

  private static validateCarouselImages(value: any, errors: string[]): void {
    if (value !== undefined) {
      if (!Array.isArray(value)) {
        errors.push('Carousel images must be an array');
      } else {
        value.forEach((url, index) => {
          if (typeof url !== 'string') {
            errors.push(`Carousel image at index ${index} must be a string`);
          }
        });
      }
    }
  }

  static validateUpdateProduct(dto: UpdateProductDto): string[] {
    const errors: string[] = [];

    // Validate optional string fields
    this.validateStringField(dto.name, 'Name', { required: false, maxLength: 100 }, errors);
    this.validateStringField(dto.description, 'Description', { required: false }, errors);
    this.validateStringField(dto.imageUrl, 'Image URL', { required: false }, errors);

    // Validate optional numeric fields
    this.validateNumericField(dto.price, 'Price', { required: false, min: 0.01 }, errors);
    this.validateNumericField(dto.stock, 'Stock', { required: false, min: 0, integer: true }, errors);
    this.validateNumericField(dto.categoryId, 'Category ID', { required: false, min: 1, integer: true }, errors);

    // Validate carousel images
    this.validateCarouselImages(dto.carouselUrl, errors);

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
