import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../interfaces/category.interface';
import { CategoryValidators, CategoryValidationError } from '../validators/category.validators';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly STORAGE_KEY = 'categories';
  private readonly COUNTER_KEY = 'category_counter';

  private _selected = signal<string>('New');
  selectedCategory = this._selected.asReadonly();

  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.initializeStorage();
    this.loadCategories();
  }

  private initializeStorage(): void {
    const categories = localStorage.getItem(this.STORAGE_KEY);
    if (!categories) {
      this.seedInitialData();
    }
  }

  private seedInitialData(): void {
    const initialCategories: Category[] = [
      { id: 1, name: 'T-shirts' },
      { id: 2, name: 'Hoodies' },
      { id: 3, name: 'Bottoms' },
      { id: 4, name: 'Hats' },
      { id: 5, name: 'Accessories' }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialCategories));
    localStorage.setItem(this.COUNTER_KEY, '5');
  }

  private getCategoriesFromStorage(): Category[] {
    const categories = localStorage.getItem(this.STORAGE_KEY);
    return categories ? JSON.parse(categories) : [];
  }

  private saveCategories(categories: Category[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }

  private getNextId(): number {
    const counter = localStorage.getItem(this.COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    localStorage.setItem(this.COUNTER_KEY, nextId.toString());
    return nextId;
  }

  setCategory(cat: string) {
    this._selected.set(cat);
  }

  loadCategories(): void {
    try {
      const categories = this.getCategoriesFromStorage();
        this.categoriesSubject.next(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      this.categoriesSubject.next([]);
    }
  }

  getAllCategories(): Observable<Category[]> {
    try {
      const categories = this.getCategoriesFromStorage();
      return of(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return throwError(() => new Error('Failed to fetch categories from storage'));
    }
  }

  // Alias for backward compatibility
  getCategories(): Observable<Category[]> {
    return this.getAllCategories();
  }

  getCategoryById(id: number): Observable<Category> {
    try {
      const categories = this.getCategoriesFromStorage();
      const category = categories.find(c => c.id === id);

      if (!category) {
        return throwError(() => new Error(`Category with ID ${id} not found`));
      }

      return of(category);
    } catch (error) {
      console.error('Error fetching category:', error);
      return throwError(() => new Error('Failed to fetch category from storage'));
    }
  }

  createCategory(createCategoryDto: CreateCategoryDto): Observable<Category> {
    try {
      // Validate the input
      CategoryValidators.validateAndThrow(createCategoryDto, false);

      const categories = this.getCategoriesFromStorage();

      // Check if category name already exists
      const existingCategory = categories.find(c =>
        c.name.toLowerCase() === createCategoryDto.name.toLowerCase()
      );

      if (existingCategory) {
        return throwError(() => new Error('Category name already exists'));
      }

      const newCategory: Category = {
        id: this.getNextId(),
        name: createCategoryDto.name.trim()
      };

      categories.push(newCategory);
      this.saveCategories(categories);

      return of(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);
      if (error instanceof CategoryValidationError) {
        return throwError(() => error);
      }
      return throwError(() => new Error('Failed to create category'));
    }
  }

  updateCategory(id: number, updateCategoryDto: UpdateCategoryDto): Observable<Category> {
    try {
      // Validate the input
      CategoryValidators.validateAndThrow(updateCategoryDto, true);

      const categories = this.getCategoriesFromStorage();
      const categoryIndex = categories.findIndex(c => c.id === id);

      if (categoryIndex === -1) {
        return throwError(() => new Error(`Category with ID ${id} not found`));
      }

      // Check if new name already exists (excluding current category)
      if (updateCategoryDto.name) {
        const existingCategory = categories.find(c =>
          c.id !== id && c.name.toLowerCase() === updateCategoryDto.name!.toLowerCase()
        );

        if (existingCategory) {
          return throwError(() => new Error('Category name already exists'));
        }
      }

      const updatedCategory: Category = {
        ...categories[categoryIndex],
        ...updateCategoryDto,
        name: updateCategoryDto.name?.trim() || categories[categoryIndex].name
      };

      categories[categoryIndex] = updatedCategory;
      this.saveCategories(categories);

      return of(updatedCategory);
    } catch (error) {
      console.error('Error updating category:', error);
      if (error instanceof CategoryValidationError) {
        return throwError(() => error);
      }
      return throwError(() => new Error('Failed to update category'));
    }
  }

  deleteCategory(id: number): Observable<void> {
    try {
      const categories = this.getCategoriesFromStorage();
      const categoryIndex = categories.findIndex(c => c.id === id);

      if (categoryIndex === -1) {
        return throwError(() => new Error(`Category with ID ${id} not found`));
      }

      categories.splice(categoryIndex, 1);
      this.saveCategories(categories);

      return of(void 0);
    } catch (error) {
      console.error('Error deleting category:', error);
      return throwError(() => new Error('Failed to delete category'));
    }
  }

  // Helper method to get category name by ID
  getCategoryNameById(id: number): string {
    const categories = this.getCategoriesFromStorage();
    const category = categories.find(c => c.id === id);
    return category?.name || 'Unknown';
  }

  // Helper methods for data management
  clearAllCategories(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
    this.categoriesSubject.next([]);
  }

  resetToInitialData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.COUNTER_KEY);
    this.initializeStorage();
    this.loadCategories();
  }
}
export type { Category };

