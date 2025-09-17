import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, BehaviorSubject } from 'rxjs';

import { AdminComponent } from './admin.component';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService, Category } from '../../shared/services/category.service';
import { AuthService } from '../../shared/services/auth.service';
import { ImageUploadService } from '../../shared/services/image-upload.service';
import { Product } from '../../shared/interfaces/product.interface';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockImageUploadService: jasmine.SpyObj<ImageUploadService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 29.99,
      stock: 10,
      imageUrl: 'http://example.com/image1.jpg',
      carouselUrl: ['http://example.com/image1.jpg', 'http://example.com/image2.jpg'],
      categoryId: 1,
      category: 'T-shirts'
    },
    {
      id: 2,
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 39.99,
      stock: 5,
      imageUrl: 'http://example.com/image3.jpg',
      carouselUrl: ['http://example.com/image3.jpg'],
      categoryId: 2,
      category: 'Hoodies'
    }
  ];

  const mockCategories: Category[] = [
    { id: 1, name: 'T-shirts' },
    { id: 2, name: 'Hoodies' },
    { id: 3, name: 'Bottoms' }
  ];

  beforeEach(async () => {
    const productServiceSpy = jasmine.createSpyObj('ProductService', [
      'getAllProducts', 'createProduct', 'updateProduct', 'deleteProduct'
    ]);

    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', [
      'getCategories'
    ]);

    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'clearAuthData'
    ]);

    const imageUploadServiceSpy = jasmine.createSpyObj('ImageUploadService', [
      'isSupabaseConfigured', 'validateImage', 'uploadImage'
    ]);

    const toastrSpy = jasmine.createSpyObj('ToastrService', [
      'success', 'error', 'warning', 'info'
    ]);

    const routerSpy = jasmine.createSpyObj('Router', [
      'navigate'
    ]);

    await TestBed.configureTestingModule({
      imports: [AdminComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CategoryService, useValue: categoryServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ImageUploadService, useValue: imageUploadServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;

    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockCategoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockImageUploadService = TestBed.inject(ImageUploadService) as jasmine.SpyObj<ImageUploadService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.products).toEqual([]);
      expect(component.categories).toEqual([]);
      expect(component.view).toBe('list');
      expect(component.loading).toBe(false);
      expect(component.error).toBe(null);
      expect(component.searchQuery).toBe('');
    });

    it('should initialize form with default values', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.productForm.get('price')?.value).toBe('');
      expect(component.productForm.get('imageUrl')?.value).toBe('');
      expect(component.productForm.get('description')?.value).toBe('');
      expect(component.productForm.get('categoryId')?.value).toBe('');
      expect(component.productForm.get('stock')?.value).toBe('');
    });

    it('should initialize carousel URL form array', () => {
      expect(component.carouselUrl.length).toBe(0);
    });

    it('should call loadProducts and loadCategories on ngOnInit', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);

      component.ngOnInit();

      expect(mockProductService.getAllProducts).toHaveBeenCalled();
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
    });
  });

  describe('Product Loading', () => {
    beforeEach(() => {
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
    });

    it('should load products successfully', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(component.products).toEqual(mockProducts);
      expect(component.allProducts).toEqual(mockProducts);
      expect(component.filteredProducts).toEqual(mockProducts);
      expect(component.loading).toBe(false);
      expect(component.error).toBe(null);
    });

    it('should handle product loading error', () => {
      const error = new Error('Network error');
      mockProductService.getAllProducts.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.error).toBe('Failed to load products');
      expect(component.loading).toBe(false);
      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load products', 'Error');
    });

    it('should load categories successfully', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));

      component.ngOnInit();

      expect(component.categories).toEqual(mockCategories);
    });

    it('should handle categories loading error', () => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      const error = new Error('Category error');
      mockCategoryService.getCategories.and.returnValue(throwError(() => error));

      component.ngOnInit();

      expect(component.error).toBe('Failed to load categories');
      expect(mockToastr.error).toHaveBeenCalledWith('Failed to load categories', 'Error');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should validate required fields', () => {
      expect(component.productForm.valid).toBe(false);

      component.productForm.patchValue({
        name: 'Test Product',
        price: '29.99',
        imageUrl: 'http://example.com/image.jpg',
        description: 'Test description for product',
        categoryId: '1',
        stock: '10'
      });

      expect(component.productForm.valid).toBe(true);
    });

    it('should validate name field', () => {
      const nameControl = component.productForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('Valid Product Name');
      expect(nameControl?.valid).toBe(true);
    });

    it('should validate price field', () => {
      const priceControl = component.productForm.get('price');

      priceControl?.setValue('');
      expect(priceControl?.hasError('required')).toBe(true);

      priceControl?.setValue('0');
      expect(priceControl?.hasError('pattern')).toBe(true);

      priceControl?.setValue('abc');
      expect(priceControl?.hasError('pattern')).toBe(true);

      priceControl?.setValue('29.99');
      expect(priceControl?.valid).toBe(true);
    });

    it('should validate stock field', () => {
      const stockControl = component.productForm.get('stock');

      stockControl?.setValue('');
      expect(stockControl?.hasError('required')).toBe(true);

      stockControl?.setValue('abc');
      expect(stockControl?.hasError('pattern')).toBe(true);

      stockControl?.setValue('-1');
      expect(stockControl?.hasError('min')).toBe(true);

      stockControl?.setValue('10000');
      expect(stockControl?.hasError('max')).toBe(true);

      stockControl?.setValue('10');
      expect(stockControl?.valid).toBe(true);
    });

    it('should validate description field', () => {
      const descriptionControl = component.productForm.get('description');

      descriptionControl?.setValue('');
      expect(descriptionControl?.hasError('required')).toBe(true);

      descriptionControl?.setValue('short');
      expect(descriptionControl?.hasError('minlength')).toBe(true);

      descriptionControl?.setValue('This is a valid description');
      expect(descriptionControl?.valid).toBe(true);
    });
  });

  describe('Product CRUD Operations', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();

      // Set up valid form data
      component.productForm.patchValue({
        name: 'Test Product',
        price: '29.99',
        imageUrl: 'http://example.com/image.jpg',
        description: 'Test description for product',
        categoryId: '1',
        stock: '10'
      });
    });

    it('should create product successfully', fakeAsync(() => {
      const newProduct: Product = { ...mockProducts[0], id: 3, name: 'Test Product' };
      mockProductService.createProduct.and.returnValue(of(newProduct));
      mockProductService.getAllProducts.and.returnValue(of([...mockProducts, newProduct]));

      component.view = 'add';
      component.onSubmit();
      tick();

      expect(mockProductService.createProduct).toHaveBeenCalled();
      expect(mockToastr.success).toHaveBeenCalledWith('Product created successfully', 'Success');
      expect(component.view).toBe('list');
      expect(component.loading).toBe(false);
    }));

    it('should handle create product error', fakeAsync(() => {
      const error = new Error('Create failed');
      mockProductService.createProduct.and.returnValue(throwError(() => error));

      component.view = 'add';
      component.onSubmit();
      tick();

      expect(component.error).toContain('Failed to create product');
      expect(mockToastr.error).toHaveBeenCalled();
      expect(component.loading).toBe(false);
    }));

    it('should update product successfully', fakeAsync(() => {
      const updatedProduct = { ...mockProducts[0], name: 'Updated Product' };
      mockProductService.updateProduct.and.returnValue(of(updatedProduct));
      mockProductService.getAllProducts.and.returnValue(of([updatedProduct, mockProducts[1]]));

      component.view = 'edit';
      component['editId'] = 1;
      component.onSubmit();
      tick();

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, jasmine.any(Object));
      expect(mockToastr.success).toHaveBeenCalledWith('Product updated successfully', 'Success');
      expect(component.view).toBe('list');
    }));

    it('should handle update product error', fakeAsync(() => {
      const error = new Error('Update failed');
      mockProductService.updateProduct.and.returnValue(throwError(() => error));

      component.view = 'edit';
      component['editId'] = 1;
      component.onSubmit();
      tick();

      expect(component.error).toContain('Failed to update product');
      expect(mockToastr.error).toHaveBeenCalled();
    }));

    it('should delete product successfully', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockProductService.deleteProduct.and.returnValue(of(void 0));
      mockProductService.getAllProducts.and.returnValue(of([mockProducts[1]]));

      component.deleteProduct(1);
      tick();

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(1);
      expect(mockToastr.success).toHaveBeenCalledWith('Product deleted successfully', 'Success');
    }));

    it('should handle delete product error', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Delete failed');
      mockProductService.deleteProduct.and.returnValue(throwError(() => error));

      component.deleteProduct(1);
      tick();

      expect(component.error).toContain('Failed to delete product');
      expect(mockToastr.error).toHaveBeenCalled();
    }));

    it('should not delete product if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteProduct(1);

      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should not submit if form is invalid', () => {
      component.productForm.patchValue({
        name: '', // Invalid
        price: '29.99',
        imageUrl: 'http://example.com/image.jpg',
        description: 'Test description',
        categoryId: '1',
        stock: '10'
      });

      component.onSubmit();

      expect(mockProductService.createProduct).not.toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalledWith(jasmine.stringMatching(/Product name is invalid/), 'Form Validation Error');
    });
  });

  describe('Edit Product', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should populate form when editing product', () => {
      const productToEdit = mockProducts[0];

      component.editProduct(productToEdit);

      expect(component.view).toBe('edit');
      expect(component['editId']).toBe(productToEdit.id);
      expect(component.productForm.get('name')?.value).toBe(productToEdit.name);
      expect(component.productForm.get('price')?.value).toBe(productToEdit.price.toString());
      expect(component.productForm.get('imageUrl')?.value).toBe(productToEdit.imageUrl);
      expect(component.productForm.get('description')?.value).toBe(productToEdit.description);
      expect(component.productForm.get('stock')?.value).toBe(productToEdit.stock.toString());
    });

    it('should populate carousel URLs when editing product', () => {
      const productToEdit = mockProducts[0];

      component.editProduct(productToEdit);

      expect(component.carouselUrl.length).toBe(1); // One additional URL (excluding main image)
      expect(component.carouselUrl.at(0).value).toBe('http://example.com/image2.jpg');
    });

    it('should handle product without carousel URLs', () => {
      const productToEdit = { ...mockProducts[0], carouselUrl: undefined };

      component.editProduct(productToEdit);

      expect(component.carouselUrl.length).toBe(0);
    });
  });

  describe('Form Management', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should add image URL to carousel', () => {
      const initialLength = component.carouselUrl.length;

      component.addImageUrl();

      expect(component.carouselUrl.length).toBe(initialLength + 1);
    });

    it('should remove image URL from carousel', () => {
      component.addImageUrl();
      component.addImageUrl();
      const initialLength = component.carouselUrl.length;

      component.removeImageUrl(1);

      expect(component.carouselUrl.length).toBe(initialLength - 1);
    });

    it('should not remove first image URL', () => {
      component.addImageUrl();
      const initialLength = component.carouselUrl.length;

      component.removeImageUrl(0);

      expect(component.carouselUrl.length).toBe(initialLength);
    });

    it('should cancel and reset form', () => {
      component.view = 'edit';
      component['editId'] = 1;
      component.productForm.patchValue({ name: 'Test' });

      component.cancel();

      expect(component.view).toBe('list');
      expect(component['editId']).toBeNull();
      expect(component.productForm.get('name')?.value).toBe('');
      expect(component.error).toBe(null);
    });

    it('should set add view and reset form', () => {
      component.view = 'edit';
      component['editId'] = 1;
      component.productForm.patchValue({ name: 'Test' });

      component.setAddView();

      expect(component.view).toBe('add');
      expect(component['editId']).toBeNull();
      expect(component.productForm.get('name')?.value).toBe('');
    });
  });

  describe('Input Formatting', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of([]));
      mockCategoryService.getCategories.and.returnValue(of([]));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should format price input correctly', () => {
      const event = { target: { value: '0029.999' } } as any;

      component.formatPriceInput(event);

      expect(event.target.value).toBe('29.99');
    });

    it('should handle price input with leading zeros', () => {
      const event = { target: { value: '000123.45' } } as any;

      component.formatPriceInput(event);

      expect(event.target.value).toBe('123.45');
    });

    it('should handle price input starting with decimal point', () => {
      const event = { target: { value: '.99' } } as any;

      component.formatPriceInput(event);

      expect(event.target.value).toBe('0.99');
    });

    it('should limit price to 2 decimal places', () => {
      const event = { target: { value: '29.999' } } as any;

      component.formatPriceInput(event);

      expect(event.target.value).toBe('29.99');
    });

    it('should format stock input correctly', () => {
      const event = { target: { value: 'abc123def' } } as any;

      component.formatStockInput(event);

      expect(event.target.value).toBe('123');
    });

    it('should remove leading zeros from stock', () => {
      const event = { target: { value: '00123' } } as any;

      component.formatStockInput(event);

      expect(event.target.value).toBe('123');
    });

    it('should limit stock to maximum value', () => {
      const event = { target: { value: '99999' } } as any;

      component.formatStockInput(event);

      expect(event.target.value).toBe('9999');
    });
  });

  describe('Keyboard Event Handling', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should allow valid keys for price input', () => {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', '1', '.'];

      allowedKeys.forEach(key => {
        const mockInput = { value: '10.50' } as HTMLInputElement;
        const event = {
          key,
          target: mockInput,
          preventDefault: jasmine.createSpy('preventDefault')
        } as unknown as KeyboardEvent;

        component.onPriceKeydown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should block invalid keys for price input', () => {
      const invalidKeys = ['a', 'b', 'c', '!', '@', '#'];

      invalidKeys.forEach(key => {
        const mockInput = { value: '10.50' } as HTMLInputElement;
        const event = {
          key,
          target: mockInput,
          preventDefault: jasmine.createSpy('preventDefault')
        } as unknown as KeyboardEvent;

        component.onPriceKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    it('should allow only one decimal point in price input', () => {
      const event = new KeyboardEvent('keydown', { key: '.' });
      const target = { value: '29.99' } as HTMLInputElement;
      Object.defineProperty(event, 'target', { value: target });
      spyOn(event, 'preventDefault');

      component.onPriceKeydown(event);

      expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should allow valid keys for stock input', () => {
      const allowedKeys = ['Backspace', 'Delete', 'Tab', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

      allowedKeys.forEach(key => {
        const mockInput = { value: '10' } as HTMLInputElement;
        const event = {
          key,
          target: mockInput,
          preventDefault: jasmine.createSpy('preventDefault')
        } as unknown as KeyboardEvent;

        component.onStockKeydown(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should block invalid keys for stock input', () => {
      const invalidKeys = ['a', '.', '!', '@'];

      invalidKeys.forEach(key => {
        const mockInput = { value: '10' } as HTMLInputElement;
        const event = {
          key,
          target: mockInput,
          preventDefault: jasmine.createSpy('preventDefault')
        } as unknown as KeyboardEvent;

        component.onStockKeydown(event);

        expect(event.preventDefault).toHaveBeenCalled();
      });
    });
  });

  describe('Image Upload', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should check if Supabase is configured', () => {
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);

      expect(component.isSupabaseConfigured).toBe(true);
    });

    it('should validate image before upload', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;

      mockImageUploadService.validateImage.and.returnValue({ valid: false, error: 'Invalid file' });

      await component.onMainImageSelected(event);

      expect(mockToastr.error).toHaveBeenCalledWith('Invalid file', 'Invalid Image');
      expect(event.target.value).toBe('');
    });

    it('should upload main image successfully', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;

      mockImageUploadService.validateImage.and.returnValue({ valid: true });
      mockImageUploadService.uploadImage.and.returnValue(Promise.resolve('http://example.com/uploaded.jpg'));

      await component.onMainImageSelected(event);

      expect(component.productForm.get('imageUrl')?.value).toBe('http://example.com/uploaded.jpg');
      expect(mockToastr.success).toHaveBeenCalledWith('Main image uploaded successfully!', 'Success');
    });

    it('should handle main image upload error', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;

      mockImageUploadService.validateImage.and.returnValue({ valid: true });
      mockImageUploadService.uploadImage.and.returnValue(Promise.reject(new Error('Upload failed')));

      await component.onMainImageSelected(event);

      expect(mockToastr.error).toHaveBeenCalledWith('Upload failed', 'Upload Error');
    });

    it('should upload carousel image successfully', async () => {
      component.addImageUrl();
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;

      mockImageUploadService.validateImage.and.returnValue({ valid: true });
      mockImageUploadService.uploadImage.and.returnValue(Promise.resolve('http://example.com/carousel.jpg'));

      await component.onCarouselImageSelected(event, 0);

      expect(component.carouselUrl.at(0).value).toBe('http://example.com/carousel.jpg');
      expect(mockToastr.success).toHaveBeenCalledWith('Carousel image 1 uploaded successfully!', 'Success');
    });

    it('should clear main image', () => {
      component.productForm.patchValue({ imageUrl: 'http://example.com/image.jpg' });

      component.clearMainImage();

      expect(component.productForm.get('imageUrl')?.value).toBe('');
    });

    it('should clear carousel image', () => {
      component.addImageUrl();
      component.carouselUrl.at(0).setValue('http://example.com/image.jpg');

      component.clearCarouselImage(0);

      expect(component.carouselUrl.at(0).value).toBe('');
    });

    it('should get image file name', () => {
      const url = 'http://example.com/path/to/very-long-image-file-name-that-should-be-truncated.jpg';

      const fileName = component.getImageFileName(url);

      expect(fileName).toBe('very-long-image-file-name-tha...');
    });

    it('should return empty string for empty URL', () => {
      const fileName = component.getImageFileName('');

      expect(fileName).toBe('');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should filter products by name', () => {
      component.searchQuery = 'Test Product 1';

      component.onSearch();

      expect(component.products.length).toBe(1);
      expect(component.products[0].name).toBe('Test Product 1');
    });

    it('should filter products by description', () => {
      component.searchQuery = 'Description 2';

      component.onSearch();

      expect(component.products.length).toBe(1);
      expect(component.products[0].description).toBe('Test Description 2');
    });

    it('should filter products by category', () => {
      component.searchQuery = 'Hoodies';

      component.onSearch();

      expect(component.products.length).toBe(1);
      expect(component.products[0].category).toBe('Hoodies');
    });

    it('should clear search and show all products', () => {
      component.searchQuery = 'Test';
      component.onSearch();

      component.clearSearch();

      expect(component.searchQuery).toBe('');
      expect(component.products).toEqual(mockProducts);
    });

    it('should show all products when search query is empty', () => {
      component.searchQuery = '';

      component.onSearch();

      expect(component.products).toEqual(mockProducts);
    });

    it('should be case insensitive', () => {
      component.searchQuery = 'test product 1';

      component.onSearch();

      expect(component.products.length).toBe(1);
      expect(component.products[0].name).toBe('Test Product 1');
    });
  });

  describe('Utility Methods', () => {
    beforeEach(() => {
      mockProductService.getAllProducts.and.returnValue(of(mockProducts));
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
      mockImageUploadService.isSupabaseConfigured.and.returnValue(true);
      component.ngOnInit();
    });

    it('should get category name by ID', () => {
      const categoryName = component.getCategoryName(1);

      expect(categoryName).toBe('T-shirts');
    });

    it('should return "Unknown" for invalid category ID', () => {
      const categoryName = component.getCategoryName(999);

      expect(categoryName).toBe('Unknown');
    });

    it('should validate price and set error for zero value', () => {
      component.productForm.get('price')?.setValue('0');

      component.validatePrice();

      expect(component.productForm.get('price')?.hasError('min')).toBe(true);
    });

    it('should validate price and set error for value too high', () => {
      component.productForm.get('price')?.setValue('100000');

      component.validatePrice();

      expect(component.productForm.get('price')?.hasError('max')).toBe(true);
    });

    it('should hide image on error', () => {
      const img = document.createElement('img');
      const event = { target: img } as any;

      component.hideImage(event);

      expect(img.style.display).toBe('none');
    });

    it('should show image on load', () => {
      const img = document.createElement('img');
      const event = { target: img } as any;

      component.showImage(event);

      expect(img.style.display).toBe('block');
    });
  });

  describe('Logout', () => {
    it('should logout and navigate to admin login', () => {
      component.logout();

      expect(mockAuthService.clearAuthData).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin-login']);
      expect(mockToastr.info).toHaveBeenCalledWith('Admin logged out successfully', 'Logout');
    });
  });

  describe('Error Handling', () => {
    it('should handle form errors correctly', () => {
      spyOn(component as any, 'markFormGroupTouched');
      spyOn(component as any, 'getFormErrors').and.returnValue({
        name: { required: true },
        price: { pattern: true }
      });

      component.productForm.setErrors({ invalid: true });
      component.onSubmit();

      expect(component['markFormGroupTouched']).toHaveBeenCalled();
      expect(mockToastr.error).toHaveBeenCalled();
    });

    it('should get form errors correctly', () => {
      component.productForm.get('name')?.setErrors({ required: true });
      component.productForm.get('price')?.setErrors({ pattern: true });

      const errors = component['getFormErrors']();

      expect(errors.name).toEqual({ required: true });
      expect(errors.price).toEqual({ pattern: true });
    });
  });
});
