import { CreateCategoryDto, UpdateCategoryDto } from '../interfaces/category.interface';

export class CategoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CategoryValidationError';
  }
}

export class CategoryValidators {
  static validateCreateCategory(dto: CreateCategoryDto): string[] {
    const errors: string[] = [];

    // Name validation
    if (!dto.name || typeof dto.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (dto.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (dto.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (dto.name.length > 50) {
      errors.push('Name must not exceed 50 characters');
    }

    return errors;
  }

  static validateUpdateCategory(dto: UpdateCategoryDto): string[] {
    const errors: string[] = [];

    // Name validation (optional for update)
    if (dto.name !== undefined) {
      if (typeof dto.name !== 'string') {
        errors.push('Name must be a string');
      } else if (dto.name.trim().length === 0) {
        errors.push('Name cannot be empty');
      } else if (dto.name.length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else if (dto.name.length > 50) {
        errors.push('Name must not exceed 50 characters');
      }
    }

    return errors;
  }

  static validateAndThrow(dto: CreateCategoryDto | UpdateCategoryDto, isUpdate = false): void {
    const errors = isUpdate
      ? this.validateUpdateCategory(dto as UpdateCategoryDto)
      : this.validateCreateCategory(dto as CreateCategoryDto);

    if (errors.length > 0) {
      throw new CategoryValidationError(errors.join(', '));
    }
  }
}
