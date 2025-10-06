import { TestBed } from '@angular/core/testing';

import { CategoryService, Category } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../interfaces/category.interface';
import { CategoryValidationError } from '../validators/category.validators';

describe('CategoryService', () => {
  let service: CategoryService;
  let mockLocalStorage: { [key: string]: string };

  const mockCategories: Category[] = [
    { id: 1, name: 'T-shirts' },
    { id: 2, name: 'Hoodies' },
    { id: 3, name: 'Bottoms' }
  ];

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    TestBed.configureTestingModule({
      providers: [CategoryService]
    });

    service = TestBed.inject(CategoryService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default category selection', () => {
      expect(service.selectedCategory()).toBe('New');
    });

    it('should initialize with sample data when localStorage is empty', () => {
      // localStorage is empty by default in our setup
      service = new CategoryService();

      expect(localStorage.setItem).toHaveBeenCalledWith('categories', jasmine.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('category_counter', '5');
    });

    it('should not initialize storage if categories already exist', () => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      const setItemSpy = localStorage.setItem as jasmine.Spy;
      setItemSpy.calls.reset();

      service = new CategoryService();

      // Should not set initial data since categories already exist
      expect(setItemSpy).not.toHaveBeenCalledWith('categories', jasmine.any(String));
    });

    it('should load categories into BehaviorSubject on initialization', () => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);

      service = new CategoryService();

      service.categories$.subscribe(categories => {
        expect(categories).toEqual(mockCategories);
      });
    });
  });

  describe('Category Selection', () => {
    it('should set selected category', () => {
      service.setCategory('Electronics');
      expect(service.selectedCategory()).toBe('Electronics');
    });

    it('should update selected category multiple times', () => {
      service.setCategory('Category1');
      expect(service.selectedCategory()).toBe('Category1');

      service.setCategory('Category2');
      expect(service.selectedCategory()).toBe('Category2');
    });

    it('should handle empty category selection', () => {
      service.setCategory('');
      expect(service.selectedCategory()).toBe('');
    });
  });

  describe('loadCategories', () => {
    it('should load categories from storage successfully', () => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      let emittedCategories: Category[] = [];

      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.loadCategories();

      expect(emittedCategories).toEqual(mockCategories);
    });

    it('should handle storage errors gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');
      let emittedCategories: Category[] = [];

      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.loadCategories();

      expect(console.error).toHaveBeenCalledWith('Error loading categories:', jasmine.any(Error));
      expect(emittedCategories).toEqual([]);
    });

    it('should handle malformed JSON in storage', () => {
      mockLocalStorage['categories'] = 'invalid-json';
      spyOn(console, 'error');
      let emittedCategories: Category[] = [];

      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.loadCategories();

      expect(console.error).toHaveBeenCalledWith('Error loading categories:', jasmine.any(Error));
      expect(emittedCategories).toEqual([]);
    });
  });

  describe('getAllCategories', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
    });

    it('should return all categories', (done) => {
      service.getAllCategories().subscribe({
        next: (categories) => {
          expect(categories).toEqual(mockCategories);
          done();
        }
      });
    });

    it('should return empty array when no categories exist', (done) => {
      mockLocalStorage['categories'] = JSON.stringify([]);

      service.getAllCategories().subscribe({
        next: (categories) => {
          expect(categories).toEqual([]);
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.getAllCategories().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch categories from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching categories:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle malformed JSON', (done) => {
      mockLocalStorage['categories'] = 'invalid-json';
      spyOn(console, 'error');

      service.getAllCategories().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch categories from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching categories:', jasmine.any(Error));
          done();
        }
      });
    });
  });

  describe('getCategories (alias)', () => {
    it('should work as alias for getAllCategories', (done) => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);

      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories).toEqual(mockCategories);
          done();
        }
      });
    });
  });

  describe('getCategoryById', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
    });

    it('should return category by ID', (done) => {
      service.getCategoryById(1).subscribe({
        next: (category) => {
          expect(category).toEqual({ id: 1, name: 'T-shirts' });
          done();
        }
      });
    });

    it('should return error for non-existent category ID', (done) => {
      service.getCategoryById(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category with ID 999 not found');
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.getCategoryById(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch category from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching category:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle zero and negative IDs', (done) => {
      service.getCategoryById(0).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category with ID 0 not found');
          done();
        }
      });
    });
  });

  describe('createCategory', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      mockLocalStorage['category_counter'] = '3';
    });

    it('should create a new category successfully', (done) => {
      const createDto: CreateCategoryDto = {
        name: 'New Category'
      };

      let emittedCategories: Category[] = [];
      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.createCategory(createDto).subscribe({
        next: (category) => {
          expect(category).toEqual(jasmine.objectContaining({
            id: 4, // Should be next ID
            name: 'New Category'
          }));
          expect(localStorage.setItem).toHaveBeenCalledWith('categories', jasmine.any(String));
          expect(localStorage.setItem).toHaveBeenCalledWith('category_counter', '4');
          expect(emittedCategories.length).toBe(4);
          done();
        }
      });
    });

    it('should trim category name', (done) => {
      const createDto: CreateCategoryDto = {
        name: '  Trimmed Category  '
      };

      service.createCategory(createDto).subscribe({
        next: (category) => {
          expect(category.name).toBe('Trimmed Category');
          done();
        }
      });
    });

    it('should prevent duplicate category names (case insensitive)', (done) => {
      const createDto: CreateCategoryDto = {
        name: 'T-SHIRTS' // Duplicate of existing 'T-shirts'
      };

      service.createCategory(createDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category name already exists');
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const invalidDto: CreateCategoryDto = {
        name: '' // Invalid - empty name
      };

      service.createCategory(invalidDto).subscribe({
        error: (error) => {
          expect(error instanceof CategoryValidationError).toBe(true);
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      const createDto: CreateCategoryDto = {
        name: 'New Category'
      };

      service.createCategory(createDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to create category');
          expect(console.error).toHaveBeenCalledWith('Error creating category:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should increment the category counter correctly', (done) => {
      const createDto: CreateCategoryDto = {
        name: 'Counter Test'
      };

      service.createCategory(createDto).subscribe({
        next: (category) => {
          expect(category.id).toBe(4);
          expect(localStorage.setItem).toHaveBeenCalledWith('category_counter', '4');
          done();
        }
      });
    });

    it('should update categories$ BehaviorSubject', (done) => {
      const createDto: CreateCategoryDto = {
        name: 'Observable Test'
      };

      let categoriesCount = 0;
      service.categories$.subscribe(categories => {
        categoriesCount = categories.length;
      });

      service.createCategory(createDto).subscribe({
        next: () => {
          expect(categoriesCount).toBe(4); // Original 3 + 1 new
          done();
        }
      });
    });
  });

  describe('updateCategory', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
    });

    it('should update an existing category successfully', (done) => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated T-shirts'
      };

      let emittedCategories: Category[] = [];
      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.updateCategory(1, updateDto).subscribe({
        next: (category) => {
          expect(category).toEqual(jasmine.objectContaining({
            id: 1,
            name: 'Updated T-shirts'
          }));
          expect(localStorage.setItem).toHaveBeenCalledWith('categories', jasmine.any(String));
          expect(emittedCategories.find(c => c.id === 1)?.name).toBe('Updated T-shirts');
          done();
        }
      });
    });

    it('should trim updated category name', (done) => {
      const updateDto: UpdateCategoryDto = {
        name: '  Trimmed Update  '
      };

      service.updateCategory(1, updateDto).subscribe({
        next: (category) => {
          expect(category.name).toBe('Trimmed Update');
          done();
        }
      });
    });

    it('should handle partial updates', (done) => {
      const updateDto: UpdateCategoryDto = {}; // Empty update

      service.updateCategory(1, updateDto).subscribe({
        next: (category) => {
          expect(category.name).toBe('T-shirts'); // Should preserve original name
          done();
        }
      });
    });

    it('should prevent duplicate names when updating (case insensitive)', (done) => {
      const updateDto: UpdateCategoryDto = {
        name: 'HOODIES' // Duplicate of existing 'Hoodies'
      };

      service.updateCategory(1, updateDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category name already exists');
          done();
        }
      });
    });

    it('should allow updating category to same name (case variations)', (done) => {
      const updateDto: UpdateCategoryDto = {
        name: 'T-SHIRTS' // Same category, different case
      };

      service.updateCategory(1, updateDto).subscribe({
        next: (category) => {
          expect(category.name).toBe('T-SHIRTS');
          done();
        }
      });
    });

    it('should return error for non-existent category ID', (done) => {
      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category'
      };

      service.updateCategory(999, updateDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category with ID 999 not found');
          done();
        }
      });
    });

    it('should handle validation errors', (done) => {
      const invalidDto: UpdateCategoryDto = {
        name: '' // Invalid - empty name
      };

      service.updateCategory(1, invalidDto).subscribe({
        error: (error) => {
          expect(error instanceof CategoryValidationError).toBe(true);
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      const updateDto: UpdateCategoryDto = {
        name: 'Updated Category'
      };

      service.updateCategory(1, updateDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to update category');
          expect(console.error).toHaveBeenCalledWith('Error updating category:', jasmine.any(Error));
          done();
        }
      });
    });
  });

  describe('deleteCategory', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
    });

    it('should delete an existing category successfully', (done) => {
      let emittedCategories: Category[] = [];
      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.deleteCategory(1).subscribe({
        next: () => {
          expect(localStorage.setItem).toHaveBeenCalledWith('categories', jasmine.any(String));
          expect(emittedCategories.find(c => c.id === 1)).toBeUndefined();
          expect(emittedCategories.length).toBe(2);
          done();
        }
      });
    });

    it('should return error for non-existent category ID', (done) => {
      service.deleteCategory(999).subscribe({
        error: (error) => {
          expect(error.message).toBe('Category with ID 999 not found');
          done();
        }
      });
    });

    it('should handle localStorage errors', (done) => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');
      spyOn(console, 'error');

      service.deleteCategory(1).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to delete category');
          expect(console.error).toHaveBeenCalledWith('Error deleting category:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should maintain array integrity after deletion', (done) => {
      service.deleteCategory(2).subscribe({
        next: () => {
          const savedCategories = JSON.parse(mockLocalStorage['categories']);
          expect(savedCategories).toEqual([
            { id: 1, name: 'T-shirts' },
            { id: 3, name: 'Bottoms' }
          ]);
          done();
        }
      });
    });

    it('should handle deletion of last category', (done) => {
      mockLocalStorage['categories'] = JSON.stringify([mockCategories[0]]);

      service.deleteCategory(1).subscribe({
        next: () => {
          const savedCategories = JSON.parse(mockLocalStorage['categories']);
          expect(savedCategories).toEqual([]);
          done();
        }
      });
    });

    it('should update categories$ BehaviorSubject after deletion', (done) => {
      let categoriesCount = 0;
      service.categories$.subscribe(categories => {
        categoriesCount = categories.length;
      });

      service.deleteCategory(1).subscribe({
        next: () => {
          expect(categoriesCount).toBe(2); // Original 3 - 1 deleted
          done();
        }
      });
    });
  });

  describe('getCategoryNameById', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
    });

    it('should return category name for valid ID', () => {
      const name = service.getCategoryNameById(1);
      expect(name).toBe('T-shirts');
    });

    it('should return "Unknown" for non-existent ID', () => {
      const name = service.getCategoryNameById(999);
      expect(name).toBe('Unknown');
    });

    it('should return "Unknown" for zero ID', () => {
      const name = service.getCategoryNameById(0);
      expect(name).toBe('Unknown');
    });

    it('should return "Unknown" for negative ID', () => {
      const name = service.getCategoryNameById(-1);
      expect(name).toBe('Unknown');
    });

    it('should handle localStorage errors gracefully', () => {
      (localStorage.getItem as jasmine.Spy).and.throwError('Storage error');

      const name = service.getCategoryNameById(1);
      expect(name).toBe('Unknown');
    });

    it('should handle malformed JSON gracefully', () => {
      mockLocalStorage['categories'] = 'invalid-json';

      const name = service.getCategoryNameById(1);
      expect(name).toBe('Unknown');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      mockLocalStorage['category_counter'] = '5';
    });

    it('should clear all categories and counter', () => {
      let emittedCategories: Category[] = [];
      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.clearAllCategories();

      expect(localStorage.removeItem).toHaveBeenCalledWith('categories');
      expect(localStorage.removeItem).toHaveBeenCalledWith('category_counter');
      expect(emittedCategories).toEqual([]);
    });

    it('should reset to initial data', () => {
      service.resetToInitialData();

      expect(localStorage.removeItem).toHaveBeenCalledWith('categories');
      expect(localStorage.removeItem).toHaveBeenCalledWith('category_counter');
      expect(localStorage.setItem).toHaveBeenCalledWith('categories', jasmine.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('category_counter', '5');
    });

    it('should reload categories after reset', () => {
      let emittedCategories: Category[] = [];
      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      service.resetToInitialData();

      // Should have 5 initial categories
      expect(emittedCategories.length).toBe(5);
      expect(emittedCategories).toContain(jasmine.objectContaining({ name: 'T-shirts' }));
    });
  });

  describe('ID Generation and Storage Management', () => {
    it('should generate sequential IDs', () => {
      mockLocalStorage['category_counter'] = '10';

      const nextId1 = (service as any).getNextId();
      const nextId2 = (service as any).getNextId();

      expect(nextId1).toBe(11);
      expect(nextId2).toBe(12);
      expect(mockLocalStorage['category_counter']).toBe('12');
    });

    it('should handle missing counter in localStorage', () => {
      delete mockLocalStorage['category_counter'];

      const nextId = (service as any).getNextId();

      expect(nextId).toBe(1);
      expect(mockLocalStorage['category_counter']).toBe('1');
    });

    it('should handle invalid counter value', () => {
      mockLocalStorage['category_counter'] = 'invalid';

      const nextId = (service as any).getNextId();

      expect(nextId).toBe(1); // NaN + 1 = 1
      expect(mockLocalStorage['category_counter']).toBe('1');
    });

    it('should get categories from localStorage', () => {
      const categories = (service as any).getCategoriesFromStorage();

      expect(categories).toEqual(mockCategories);
    });

    it('should return empty array when no categories in localStorage', () => {
      delete mockLocalStorage['categories'];

      const categories = (service as any).getCategoriesFromStorage();

      expect(categories).toEqual([]);
    });

    it('should save categories to localStorage and update BehaviorSubject', () => {
      const newCategories = [...mockCategories, { id: 4, name: 'Test 4' }];
      let emittedCategories: Category[] = [];

      service.categories$.subscribe(categories => {
        emittedCategories = categories;
      });

      (service as any).saveCategories(newCategories);

      expect(localStorage.setItem).toHaveBeenCalledWith('categories', JSON.stringify(newCategories));
      expect(emittedCategories).toEqual(newCategories);
    });
  });

  describe('BehaviorSubject Integration', () => {
    it('should emit initial categories on subscription', () => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      service = new CategoryService();

      service.categories$.subscribe(categories => {
        expect(categories).toEqual(mockCategories);
      });
    });

    it('should emit updated categories after operations', (done) => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      service = new CategoryService();

      let emissionCount = 0;
      service.categories$.subscribe(categories => {
        emissionCount++;
        if (emissionCount === 2) { // After initial load + after create
          expect(categories.length).toBe(4);
          expect(categories.find(c => c.name === 'New Category')).toBeDefined();
          done();
        }
      });

      const createDto: CreateCategoryDto = { name: 'New Category' };
      service.createCategory(createDto).subscribe();
    });

    it('should maintain subscription across multiple operations', (done) => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      mockLocalStorage['category_counter'] = '3';
      service = new CategoryService();

      const emissions: Category[][] = [];
      service.categories$.subscribe(categories => {
        emissions.push([...categories]);
        if (emissions.length === 4) { // Initial + create + update + delete
          expect(emissions[0].length).toBe(3); // Initial
          expect(emissions[1].length).toBe(4); // After create
          expect(emissions[2].find(c => c.id === 1)?.name).toBe('Updated Name'); // After update
          expect(emissions[3].length).toBe(3); // After delete
          done();
        }
      });

      // Perform sequence of operations
      service.createCategory({ name: 'New Category' }).subscribe(() => {
        service.updateCategory(1, { name: 'Updated Name' }).subscribe(() => {
          service.deleteCategory(4).subscribe();
        });
      });
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle concurrent operations', (done) => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);
      mockLocalStorage['category_counter'] = '3';

      const createDto1: CreateCategoryDto = { name: 'Concurrent Category 1' };
      const createDto2: CreateCategoryDto = { name: 'Concurrent Category 2' };

      const create1$ = service.createCategory(createDto1);
      const create2$ = service.createCategory(createDto2);

      let completedCount = 0;
      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 2) {
          expect(completedCount).toBe(2);
          done();
        }
      };

      create1$.subscribe({
        next: (category) => {
          expect(category.id).toBeGreaterThan(3);
          checkCompletion();
        }
      });

      create2$.subscribe({
        next: (category) => {
          expect(category.id).toBeGreaterThan(3);
          checkCompletion();
        }
      });
    });

    it('should handle categories with special characters', (done) => {
      const specialCategory: CreateCategoryDto = {
        name: 'Çätëgöry wîth spëcíål çhãráctërs & symbols! @#$%^&*()'
      };

      service.createCategory(specialCategory).subscribe({
        next: (category) => {
          expect(category.name).toBe('Çätëgöry wîth spëcíål çhãráctërs & symbols! @#$%^&*()');
          done();
        }
      });
    });

    it('should handle very long category names', (done) => {
      const longName = 'A'.repeat(1000); // 1k characters
      const longCategory: CreateCategoryDto = { name: longName };

      service.createCategory(longCategory).subscribe({
        next: (category) => {
          expect(category.name).toBe(longName);
          done();
        }
      });
    });

    it('should handle localStorage quota exceeded', (done) => {
      (localStorage.setItem as jasmine.Spy).and.throwError('QuotaExceededError');
      spyOn(console, 'error');

      const createDto: CreateCategoryDto = { name: 'New Category' };

      service.createCategory(createDto).subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to create category');
          expect(console.error).toHaveBeenCalledWith('Error creating category:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle malformed category data in localStorage', (done) => {
      mockLocalStorage['categories'] = '[{"id":1,"name":"Test"},{"invalid":"json"';
      spyOn(console, 'error');

      service.getAllCategories().subscribe({
        error: (error) => {
          expect(error.message).toBe('Failed to fetch categories from storage');
          expect(console.error).toHaveBeenCalledWith('Error fetching categories:', jasmine.any(Error));
          done();
        }
      });
    });

    it('should handle whitespace-only category names', (done) => {
      const whitespaceCategory: CreateCategoryDto = { name: '   ' };

      service.createCategory(whitespaceCategory).subscribe({
        error: (error) => {
          expect(error instanceof CategoryValidationError).toBe(true);
          done();
        }
      });
    });

    it('should normalize category names for comparison', (done) => {
      // Create initial category
      service.createCategory({ name: 'Electronics' }).subscribe(() => {
        // Try to create duplicate with different spacing/case
        service.createCategory({ name: '  ELECTRONICS  ' }).subscribe({
          error: (error) => {
            expect(error.message).toBe('Category name already exists');
            done();
          }
        });
      });
    });
  });

  describe('Performance and Memory Management', () => {
    it('should not create memory leaks with multiple operations', (done) => {
      const operations = [];

      for (let i = 0; i < 100; i++) {
        operations.push(service.getAllCategories());
      }

      let completedOperations = 0;
      operations.forEach(op => {
        op.subscribe({
          next: () => {
            completedOperations++;
            if (completedOperations === 100) {
              expect(completedOperations).toBe(100);
              done();
            }
          }
        });
      });
    });

    it('should handle rapid successive operations', (done) => {
      mockLocalStorage['categories'] = JSON.stringify(mockCategories);

      let completedCount = 0;
      const checkCompletion = () => {
        completedCount++;
        if (completedCount === 5) {
          expect(completedCount).toBe(5);
          done();
        }
      };

      service.getAllCategories().subscribe(() => checkCompletion());
      service.getCategoryById(1).subscribe(() => checkCompletion());
      service.getCategoryById(2).subscribe(() => checkCompletion());
      service.getAllCategories().subscribe(() => checkCompletion());
      service.getCategoryById(1).subscribe(() => checkCompletion());
    });

    it('should handle large datasets efficiently', () => {
      // Create a large dataset
      const largeCategories = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Category ${i + 1}`
      }));

      mockLocalStorage['categories'] = JSON.stringify(largeCategories);

      const startTime = performance.now();
      const result = service.getCategoryNameById(500);
      const endTime = performance.now();

      expect(result).toBe('Category 500');
      expect(endTime - startTime).toBeLessThan(10); // Should be very fast
    });
  });
});
