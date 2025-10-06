import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { AdminComponent } from './admin.component';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService, Category } from '../../shared/services/category.service';
import { AuthService } from '../../shared/services/auth.service';
import { ImageUploadService } from '../../shared/services/image-upload.service';
import { Product } from '../../shared/interfaces/product.interface';

type ArrangeOptions = {
  products?: Product[];
  categories?: Category[];
  productError?: Error;
  categoryError?: Error;
  supabaseConfigured?: boolean;
};

type ValidFormOverrides = {
  name?: string;
  price?: string;
  imageUrl?: string;
  description?: string;
  categoryId?: string;
  stock?: string;
  carouselUrls?: string[];
};

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockImageUploadService: jasmine.SpyObj<ImageUploadService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const createProduct = (overrides: Partial<Product> = {}): Product => ({
    id: 1,
    name: 'Mock Product',
    description: 'Mock description with enough length',
    price: 29.99,
    stock: 10,
    imageUrl: 'http://example.com/main.jpg',
    carouselUrl: ['http://example.com/main.jpg', 'http://example.com/extra.jpg'],
    categoryId: 1,
    category: 'T-shirts',
    ...overrides
  });

  const createCategory = (overrides: Partial<Category> = {}): Category => ({
    id: 1,
    name: 'T-shirts',
    ...overrides
  });

  const DEFAULT_PRODUCTS: Product[] = [
    createProduct(),
    createProduct({
      id: 2,
      name: 'Mock Hoodie',
      price: 49.99,
      stock: 5,
      categoryId: 2,
      category: 'Hoodies',
      carouselUrl: ['http://example.com/hoodie-main.jpg', 'http://example.com/hoodie-alt.jpg']
    })
  ];

  const DEFAULT_CATEGORIES: Category[] = [
    createCategory({ id: 1, name: 'T-shirts' }),
    createCategory({ id: 2, name: 'Hoodies' }),
    createCategory({ id: 3, name: 'Bottoms' })
  ];

  const arrangeComponent = (options: ArrangeOptions = {}): void => {
    const {
      products = DEFAULT_PRODUCTS,
      categories = DEFAULT_CATEGORIES,
      productError,
      categoryError,
      supabaseConfigured = true
    } = options;

    if (productError) {
      mockProductService.getAllProducts.and.returnValue(throwError(() => productError));
    } else {
      mockProductService.getAllProducts.and.returnValue(of(products));
    }

    if (categoryError) {
      mockCategoryService.getCategories.and.returnValue(throwError(() => categoryError));
    } else {
      mockCategoryService.getCategories.and.returnValue(of(categories));
    }

    mockImageUploadService.isSupabaseConfigured.and.returnValue(supabaseConfigured);

    component.ngOnInit();
    fixture.detectChanges();
  };

  const fillFormWithValidData = (overrides: ValidFormOverrides = {}): void => {
    const values = {
      name: overrides.name ?? 'Valid Product',
      price: overrides.price ?? '29.99',
      imageUrl: overrides.imageUrl ?? 'http://example.com/new.jpg',
      description: overrides.description ?? 'Valid product description',
      categoryId: overrides.categoryId ?? '1',
      stock: overrides.stock ?? '10'
    };

    component.productForm.patchValue(values);

    while (component.carouselUrl.length) {
      component.carouselUrl.removeAt(0);
    }

    (overrides.carouselUrls ?? ['http://example.com/second.jpg']).forEach(url => {
      component.addImageUrl();
      component.carouselUrl.at(component.carouselUrl.length - 1).setValue(url);
    });
  };

  const expectToast = (spy: jasmine.Spy, message: string, title: string): void => {
    expect(spy)
      .withContext(`Expected toast ${title} with message: ${message}`)
      .toHaveBeenCalledWith(message, title);
  };

  const createKeyboardEvent = (key: string, value: string): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key });
    Object.defineProperty(event, 'target', {
      value: { value, selectionStart: value.length, selectionEnd: value.length },
      writable: false
    });
    spyOn(event, 'preventDefault');
    return event;
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj<ProductService>('ProductService', [
      'getAllProducts',
      'createProduct',
      'updateProduct',
      'deleteProduct'
    ]);

    mockCategoryService = jasmine.createSpyObj<CategoryService>('CategoryService', [
      'getCategories'
    ]);

    mockAuthService = jasmine.createSpyObj<AuthService>('AuthService', [
      'clearAuthData'
    ]);

    mockImageUploadService = jasmine.createSpyObj<ImageUploadService>('ImageUploadService', [
      'isSupabaseConfigured',
      'validateImage',
      'uploadImage'
    ]);

    mockToastr = jasmine.createSpyObj<ToastrService>('ToastrService', [
      'success',
      'error',
      'warning',
      'info'
    ]);

    mockRouter = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AdminComponent, ReactiveFormsModule, FormsModule],
      providers: [
        FormBuilder,
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ImageUploadService, useValue: mockImageUploadService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  describe('component creation', () => {
    it('should start with the expected default state', () => {
      // Arrange
      // Act
      const actualState = {
        products: component.products,
        categories: component.categories,
        view: component.view,
        loading: component.loading,
        error: component.error,
        searchQuery: component.searchQuery,
        carouselLength: component.carouselUrl.length
      };

      // Assert
      expect(component).withContext('Component instance should exist').toBeTruthy();
      expect(actualState.products).withContext('Products should start empty').toEqual([]);
      expect(actualState.categories).withContext('Categories should start empty').toEqual([]);
      expect(actualState.view).withContext('Default view should be list').toBe('list');
      expect(actualState.loading).withContext('Loading should default to false').toBeFalse();
      expect(actualState.error).withContext('Error should default to null').toBeNull();
      expect(actualState.searchQuery).withContext('Search query should start empty').toBe('');
      expect(actualState.carouselLength).withContext('Carousel array should start empty').toBe(0);
      expect(component.productForm).withContext('Product form should be created').toBeDefined();
    });
  });

  describe('ngOnInit behaviour', () => {
    it('should load products and categories on success', () => {
      // Arrange
      arrangeComponent();

      // Act
      const state = {
        products: component.products,
        categories: component.categories,
        filtered: component.filteredProducts,
        allProducts: component.allProducts,
        loading: component.loading,
        error: component.error
      };

      // Assert
      expect(mockProductService.getAllProducts).withContext('Products should be requested once').toHaveBeenCalledTimes(1);
      expect(mockCategoryService.getCategories).withContext('Categories should be requested once').toHaveBeenCalledTimes(1);
      expect(mockImageUploadService.isSupabaseConfigured).withContext('Supabase configuration should be checked').toHaveBeenCalled();
      expect(state.products).withContext('Products should match service response').toEqual(DEFAULT_PRODUCTS);
      expect(state.categories).withContext('Categories should match service response').toEqual(DEFAULT_CATEGORIES);
      expect(state.filtered).withContext('Filtered products should mirror products initially').toEqual(DEFAULT_PRODUCTS);
      expect(state.allProducts).withContext('All products should mirror products').toEqual(DEFAULT_PRODUCTS);
      expect(state.loading).withContext('Loading should reset after success').toBeFalse();
      expect(state.error).withContext('Error should remain null on success').toBeNull();
    });

    it('should surface an error when products fail to load', () => {
      // Arrange
      const error = new Error('Network down');
      arrangeComponent({ productError: error });

      // Act
      const state = {
        loading: component.loading,
        error: component.error
      };

      // Assert
      expect(state.loading).withContext('Loading should reset after failure').toBeFalse();
      expect(state.error).withContext('Error message should be user friendly').toBe('Failed to load products');
      expectToast(mockToastr.error, 'Failed to load products', 'Error');
    });

    it('should surface an error when categories fail to load', () => {
      // Arrange
      const error = new Error('Category endpoint failed');
      arrangeComponent({ categoryError: error });

      // Act
      const { error: currentError } = component;

      // Assert
      expect(currentError).withContext('Error should reflect category failure').toBe('Failed to load categories');
      expectToast(mockToastr.error, 'Failed to load categories', 'Error');
    });
  });

  describe('form validation', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should require mandatory fields', () => {
      // Arrange
      const controls = ['name', 'price', 'imageUrl', 'description', 'categoryId', 'stock']
        .map(control => component.productForm.get(control));

      // Act
      const isValid = component.productForm.valid;

      // Assert
      controls.forEach(control => {
        expect(control?.valid).withContext('Control should be invalid when empty').toBeFalse();
      });
      expect(isValid).withContext('Form should not be valid without values').toBeFalse();
    });

    it('should become valid with acceptable data', () => {
      // Arrange
      fillFormWithValidData();

      // Act
      const isValid = component.productForm.valid;

      // Assert
      expect(isValid).withContext('Form should be valid with correct data').toBeTrue();
    });

    it('should enforce control-specific rules', () => {
      // Arrange
      const nameControl = component.productForm.get('name');
      const priceControl = component.productForm.get('price');
      const stockControl = component.productForm.get('stock');
      const descriptionControl = component.productForm.get('description');

      // Act
      nameControl?.setValue('ab');
      priceControl?.setValue('0');
      stockControl?.setValue('-1');
      descriptionControl?.setValue('short');

      // Assert
      expect(nameControl?.valid).withContext('Name requires minimum length').toBeFalse();
      expect(priceControl?.valid).withContext('Price should fail pattern/min validation').toBeFalse();
      expect(stockControl?.valid).withContext('Stock cannot be negative').toBeFalse();
      expect(descriptionControl?.valid).withContext('Description must respect minimum length').toBeFalse();
    });
  });

  describe('create/update workflows', () => {
    beforeEach(() => {
      arrangeComponent();
      fillFormWithValidData();
    });

    it('should create a product successfully', fakeAsync(() => {
      // Arrange
      const newProduct = createProduct({ id: 3, name: 'Brand New Product' });
      mockProductService.createProduct.and.returnValue(of(newProduct));
      mockProductService.getAllProducts.and.returnValue(of([...DEFAULT_PRODUCTS, newProduct]));
      component.setAddView();

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(mockProductService.createProduct)
        .withContext('Create service should receive payload')
        .toHaveBeenCalledTimes(1);
      expectToast(mockToastr.success, 'Product created successfully', 'Success');
      expect(component.view).withContext('View should return to list after creation').toBe('list');
      expect(component.loading).withContext('Loading should reset after creation').toBeFalse();
    }));

    it('should handle errors during product creation', fakeAsync(() => {
      // Arrange
      const error = new Error('Create failed');
      mockProductService.createProduct.and.returnValue(throwError(() => error));
      component.setAddView();

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(component.error)
        .withContext('Create failure should surface friendly message')
        .toContain('Failed to create product');
      expect(mockToastr.error).withContext('Error toast should appear for create failure').toHaveBeenCalled();
      expect(component.loading).withContext('Loading should reset after failure').toBeFalse();
    }));

    it('should update an existing product successfully', fakeAsync(() => {
      // Arrange
      const updatedProduct = createProduct({ id: 1, name: 'Updated Name' });
      mockProductService.updateProduct.and.returnValue(of(updatedProduct));
      mockProductService.getAllProducts.and.returnValue(of([updatedProduct, DEFAULT_PRODUCTS[1]]));
      component.editProduct(DEFAULT_PRODUCTS[0]);

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(mockProductService.updateProduct)
        .withContext('Update service should be called with edit id')
        .toHaveBeenCalledWith(1, jasmine.any(Object));
      expectToast(mockToastr.success, 'Product updated successfully', 'Success');
      expect(component.view).withContext('View should return to list after update').toBe('list');
    }));

    it('should handle errors during product update', fakeAsync(() => {
      // Arrange
      const error = new Error('Update failed');
      mockProductService.updateProduct.and.returnValue(throwError(() => error));
      component.editProduct(DEFAULT_PRODUCTS[0]);

      // Act
      component.onSubmit();
      tick();

      // Assert
      expect(component.error)
        .withContext('Update failure should surface friendly message')
        .toContain('Failed to update product');
      expect(mockToastr.error).withContext('Error toast should appear for update failure').toHaveBeenCalled();
    }));

    it('should block submission when the form is invalid', () => {
      // Arrange
      component.setAddView();
      component.productForm.patchValue({ name: '' });

      // Act
      component.onSubmit();

      // Assert
      expect(mockProductService.createProduct)
        .withContext('Create service should not execute with invalid form')
        .not.toHaveBeenCalled();
      expect(mockToastr.error)
        .withContext('User should be notified about validation issues')
        .toHaveBeenCalledWith(jasmine.stringMatching(/Product name is invalid/), 'Form Validation Error');
    });
  });

  describe('delete workflow', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should delete a product when user confirms', fakeAsync(() => {
      // Arrange
      const confirmSpy = spyOn(window, 'confirm').and.returnValue(true);
      mockProductService.deleteProduct.and.returnValue(of(void 0));

      // Act
      component.deleteProduct(1);
      tick();

      // Assert
      expect(confirmSpy).withContext('Confirmation dialog should appear').toHaveBeenCalled();
      expect(mockProductService.deleteProduct)
        .withContext('Delete service should receive the id')
        .toHaveBeenCalledWith(1);
      expectToast(mockToastr.success, 'Product deleted successfully', 'Success');
    }));

    it('should skip deletion when user cancels', () => {
      // Arrange
      spyOn(window, 'confirm').and.returnValue(false);

      // Act
      component.deleteProduct(1);

      // Assert
      expect(mockProductService.deleteProduct)
        .withContext('Delete service should not run when cancelled')
        .not.toHaveBeenCalled();
    });

    it('should handle errors during deletion', fakeAsync(() => {
      // Arrange
      spyOn(window, 'confirm').and.returnValue(true);
      const error = new Error('Delete failed');
      mockProductService.deleteProduct.and.returnValue(throwError(() => error));

      // Act
      component.deleteProduct(1);
      tick();

      // Assert
      expect(component.error)
        .withContext('Delete failure should surface friendly message')
        .toContain('Failed to delete product');
      expect(mockToastr.error).withContext('Error toast should appear for delete failure').toHaveBeenCalled();
    }));
  });

  describe('form management helpers', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should populate form when editing', () => {
      // Arrange
      const productToEdit = DEFAULT_PRODUCTS[0];

      // Act
      component.editProduct(productToEdit);

      // Assert
      expect(component.view).withContext('View should switch to edit').toBe('edit');
      expect(component.productForm.get('name')?.value).withContext('Name control should match product').toBe(productToEdit.name);
      expect(component.productForm.get('price')?.value).withContext('Price should be stringified').toBe(productToEdit.price.toString());
      expect(component.carouselUrl.length)
        .withContext('Carousel array should include additional images only')
        .toBe(productToEdit.carouselUrl!.length - 1);
    });

    it('should reset the form on cancel', () => {
      // Arrange
      component.editProduct(DEFAULT_PRODUCTS[0]);
      component.productForm.patchValue({ name: 'Different' });

      // Act
      component.cancel();

      // Assert
      expect(component.view).withContext('View should revert to list').toBe('list');
      expect(component.productForm.get('name')?.value).withContext('Name should reset').toBe('');
      expect(component.error).withContext('Error should clear').toBeNull();
    });

    it('should prepare the form for adding', () => {
      component.editProduct(DEFAULT_PRODUCTS[0]);

      component.setAddView();

      expect(component.view).withContext('View should be add').toBe('add');
      expect(component.productForm.get('name')?.value).withContext('Form should clear name field').toBe('');
      expect(component.carouselUrl.length).withContext('Carousel array should reset').toBe(0);
    });
  });

  describe('input formatting utilities', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should format price input correctly', () => {
      const event = { target: { value: '0029.999' } } as unknown as Event;

      component.formatPriceInput(event);

      expect((event.target as HTMLInputElement).value)
        .withContext('Price should remove leading zeros and trim decimals')
        .toBe('29.99');
    });

    it('should format stock input correctly', () => {
      const event = { target: { value: 'abc123def' } } as unknown as Event;

      component.formatStockInput(event);

      expect((event.target as HTMLInputElement).value)
        .withContext('Stock should strip non-numeric characters')
        .toBe('123');
    });

    it('should prevent duplicate decimals in price field', () => {
      const event = createKeyboardEvent('.', '29.99');

      component.onPriceKeydown(event);

      expect(event.preventDefault)
        .withContext('Repeated decimal point should be prevented')
        .toHaveBeenCalled();
    });

    it('should block non-numeric input for stock field', () => {
      const event = createKeyboardEvent('a', '10');

      component.onStockKeydown(event);

      expect(event.preventDefault)
        .withContext('Alphabetic key should be prevented in stock input')
        .toHaveBeenCalled();
    });
  });

  describe('image upload workflow', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should validate image before uploading main image', async () => {

      const file = new File(['content'], 'invalid.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;
      mockImageUploadService.validateImage.and.returnValue({ valid: false, error: 'Invalid file' });

      await component.onMainImageSelected(event);

      expectToast(mockToastr.error, 'Invalid file', 'Invalid Image');
      expect(event.target.value).withContext('Input should reset after invalid image').toBe('');
    });

    it('should upload main image successfully', async () => {
      const file = new File(['content'], 'valid.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;
      mockImageUploadService.validateImage.and.returnValue({ valid: true });
      mockImageUploadService.uploadImage.and.returnValue(Promise.resolve('http://example.com/uploaded.jpg'));

      await component.onMainImageSelected(event);

      expect(component.productForm.get('imageUrl')?.value)
        .withContext('Form should capture uploaded URL')
        .toBe('http://example.com/uploaded.jpg');
      expectToast(mockToastr.success, 'Main image uploaded successfully!', 'Success');
    });

    it('should upload carousel image successfully', async () => {
      component.addImageUrl();
      const file = new File(['content'], 'carousel.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file], value: '' } } as any;
      mockImageUploadService.validateImage.and.returnValue({ valid: true });
      mockImageUploadService.uploadImage.and.returnValue(Promise.resolve('http://example.com/carousel.jpg'));

      await component.onCarouselImageSelected(event, 0);

      expect(component.carouselUrl.at(0).value)
        .withContext('Carousel control should capture uploaded URL')
        .toBe('http://example.com/carousel.jpg');
      expectToast(mockToastr.success, 'Carousel image 1 uploaded successfully!', 'Success');
    });

    it('should clear images when requested', () => {
      component.productForm.patchValue({ imageUrl: 'http://example.com/main.jpg' });
      component.addImageUrl();
      component.carouselUrl.at(0).setValue('http://example.com/extra.jpg');

      component.clearMainImage();
      component.clearCarouselImage(0);

      expect(component.productForm.get('imageUrl')?.value)
        .withContext('Main image should reset')
        .toBe('');
      expect(component.carouselUrl.at(0).value)
        .withContext('Carousel image should reset')
        .toBe('');
    });
  });

  describe('search capability', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should filter products by name', () => {
      component.searchQuery = 'Mock Product';

      component.onSearch();

      expect(component.products.length).withContext('Should match one product by name').toBe(1);
      expect(component.products[0].name).withContext('Result should reflect query').toBe('Mock Product');
    });

    it('should clear search results when requested', () => {
      component.searchQuery = 'Mock';
      component.onSearch();

      component.clearSearch();

      expect(component.searchQuery).withContext('Search query should reset').toBe('');
      expect(component.products).withContext('All products should be restored').toEqual(DEFAULT_PRODUCTS);
    });

    it('should be case insensitive', () => {
      component.searchQuery = 'mock hoodie';

      component.onSearch();

      expect(component.products.length).withContext('Should match regardless of case').toBe(1);
      expect(component.products[0].name).withContext('Result should be hoodie').toBe('Mock Hoodie');
    });
  });

  describe('utility helpers', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should map category id to name', () => {
      const categoryId = 1;

      const name = component.getCategoryName(categoryId);

      expect(name).withContext('Should return matching category name').toBe('T-shirts');
    });

    it('should return Unknown for missing category', () => {
      const categoryId = 999;

      const name = component.getCategoryName(categoryId);

      expect(name).withContext('Missing categories should fallback to Unknown').toBe('Unknown');
    });

    it('should hide and show images via DOM events', () => {
      const img = document.createElement('img');
      const hideEvent = { target: img } as any;
      const showEvent = { target: img } as any;

      component.hideImage(hideEvent);
      component.showImage(showEvent);

      expect(img.style.display).withContext('Image should be visible after show').toBe('block');
    });
  });

  describe('logout', () => {
    it('should clear auth data and navigate away', () => {
      component.logout();

      expect(mockAuthService.clearAuthData).withContext('Auth data should be cleared').toHaveBeenCalled();
      expect(mockRouter.navigate).withContext('Should redirect to login').toHaveBeenCalledWith(['/admin-login']);
      expectToast(mockToastr.info, 'Admin logged out successfully', 'Logout');
    });
  });

  describe('error handling helpers', () => {
    beforeEach(() => {
      arrangeComponent();
    });

    it('should mark controls and show toast on invalid submit', () => {
      spyOn(component as any, 'markFormGroupTouched').and.callThrough();
      spyOn(component as any, 'getFormErrors').and.returnValue({ name: { required: true } });
      component.productForm.setErrors({ invalid: true });

      component.onSubmit();

      expect((component as any).markFormGroupTouched)
        .withContext('Form controls should be marked touched')
        .toHaveBeenCalled();
      expect(mockToastr.error).withContext('Toast should notify about invalid form').toHaveBeenCalled();
    });

    it('should read form errors correctly', () => {
      const nameControl = component.productForm.get('name');
      const priceControl = component.productForm.get('price');
      nameControl?.setErrors({ required: true });
      priceControl?.setErrors({ pattern: true });

      const errors = (component as any).getFormErrors();

      expect(errors.name).withContext('Name errors should surface').toEqual({ required: true });
      expect(errors.price).withContext('Price errors should surface').toEqual({ pattern: true });
    });
  });
});
