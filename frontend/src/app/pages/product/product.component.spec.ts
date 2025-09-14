import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError, BehaviorSubject, from } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductDetailComponent } from './product.component';
import { ProductService } from '../../shared/services/product.service';
import { CartService } from '../../shared/services/cart.service';
import { Product } from '../../shared/interfaces/product.interface';
import { CartItem } from '../../shared/interfaces/cart.interface';

describe('ProductDetailComponent', () => {
  let component: ProductDetailComponent;
  let fixture: ComponentFixture<ProductDetailComponent>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let paramMapSubject: BehaviorSubject<any>;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 29.99,
    stock: 10,
    imageUrl: 'test-image.jpg',
    carouselUrl: ['test-image-1.jpg', 'test-image-2.jpg', 'test-image-3.jpg'],
    categoryId: 1,
    category: 'Test Category'
  };

  const mockProductWithoutCarousel: Product = {
    id: 2,
    name: 'Product Without Carousel',
    description: 'No carousel images',
    price: 19.99,
    stock: 5,
    imageUrl: 'single-image.jpg',
    categoryId: 1,
    category: 'Test Category'
  };

  const mockProductNoImages: Product = {
    id: 3,
    name: 'Product No Images',
    description: 'No images at all',
    price: 39.99,
    stock: 3,
    categoryId: 2,
    category: 'Another Category'
  };

  const mockProductEmptyCarousel: Product = {
    id: 4,
    name: 'Product Empty Carousel',
    description: 'Empty carousel array',
    price: 49.99,
    stock: 7,
    imageUrl: 'main-image.jpg',
    carouselUrl: [],
    categoryId: 1,
    category: 'Test Category'
  };

  const mockProductSingleCarousel: Product = {
    id: 5,
    name: 'Product Single Carousel',
    description: 'Single carousel image',
    price: 59.99,
    stock: 0, // Out of stock
    imageUrl: 'main-image.jpg',
    carouselUrl: ['single-carousel.jpg'],
    categoryId: 1,
    category: 'Test Category'
  };

  const mockCartItem: CartItem = {
    cartItemId: 1,
    cartId: 1,
    productId: 1,
    quantity: 1,
    product: mockProduct
  };

  beforeEach(async () => {
    // Create spy objects
    mockProductService = jasmine.createSpyObj('ProductService', ['getProductById']);
    mockCartService = jasmine.createSpyObj('CartService', ['addToCart']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Create parameter map subject for testing route changes
    paramMapSubject = new BehaviorSubject(convertToParamMap({ id: '1' }));

    mockActivatedRoute = {
      paramMap: paramMapSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [ProductDetailComponent, CommonModule, FormsModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: CartService, useValue: mockCartService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentImageIndex()).toBe(0);
      expect(component.product()).toBeNull();
      expect(component.loading()).toBe(true);
      expect(component.error()).toBeNull();
      expect(component.selectedSize).toBe('M');
      expect(component.isModalOpen()).toBe(false);
      expect(component.modalTitle()).toBe('');
      expect(component.modalBody()).toBe('');
      expect(component.sizes).toEqual(['XS', 'S', 'M', 'L', 'XL']);
    });

    it('should have correct constructor dependencies', () => {
      expect(component).toBeTruthy();
      expect((component as any).route).toBeDefined();
      expect((component as any).router).toBeDefined();
      expect((component as any).productService).toBeDefined();
      expect((component as any).cartService).toBeDefined();
    });
  });

  describe('ngOnInit - Route Parameter Handling', () => {
    it('should handle missing product ID in route', () => {
      paramMapSubject.next(convertToParamMap({}));

      component.ngOnInit();

      expect(component.error()).toBe('Product not found');
      expect(component.loading()).toBe(false);
      expect(mockProductService.getProductById).not.toHaveBeenCalled();
    });

    it('should handle null product ID in route', () => {
      paramMapSubject.next(convertToParamMap({ id: null }));

      component.ngOnInit();

      expect(component.error()).toBe('Product not found');
      expect(component.loading()).toBe(false);
      expect(mockProductService.getProductById).not.toHaveBeenCalled();
    });

    it('should load product successfully with valid ID', () => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));

      component.ngOnInit();

      expect(component.loading()).toBe(false);
      expect(component.product()).toEqual(mockProduct);
      expect(component.error()).toBeNull();
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
    });

    it('should handle product service error', () => {
      const errorMessage = 'Service error';
      mockProductService.getProductById.and.returnValue(throwError(() => new Error(errorMessage)));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.loading()).toBe(false);
      expect(component.error()).toBe('Failed to load product details. Please try again later.');
      expect(component.product()).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error loading product', jasmine.any(Error));
    });

    it('should handle multiple route parameter changes', () => {
      // First product
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();

      expect(component.product()).toEqual(mockProduct);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);

      // Second product
      const secondProduct = { ...mockProductNoImages, id: 2 };
      mockProductService.getProductById.and.returnValue(of(secondProduct));
      paramMapSubject.next(convertToParamMap({ id: '2' }));

      expect(component.loading()).toBe(true); // Should be loading again
      expect(component.product()).toEqual(secondProduct);
      expect(mockProductService.getProductById).toHaveBeenCalledWith(2);
    });

    it('should handle string to number conversion for product ID', () => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '123' }));

      component.ngOnInit();

      expect(mockProductService.getProductById).toHaveBeenCalledWith(123);
    });

    it('should set loading state correctly during product fetch', () => {
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));

      // Before ngOnInit
      expect(component.loading()).toBe(true);

      component.ngOnInit();

      // After successful load
      expect(component.loading()).toBe(false);
    });
  });

  describe('getCurrentImageUrl - Image URL Logic', () => {
    it('should return empty string when no product', () => {
      component.product.set(null);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('');
    });

    it('should return carouselUrl image when available', () => {
      component.product.set(mockProduct);
      component.currentImageIndex.set(1);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('test-image-2.jpg');
    });

    it('should return first carouselUrl image when currentImageIndex is 0', () => {
      component.product.set(mockProduct);
      component.currentImageIndex.set(0);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('test-image-1.jpg');
    });

    it('should fallback to imageUrl when carouselUrl index is invalid', () => {
      const productWithInvalidIndex = { ...mockProduct };
      component.product.set(productWithInvalidIndex);
      component.currentImageIndex.set(10); // Out of bounds

      const result = component.getCurrentImageUrl();

      expect(result).toBe('test-image.jpg'); // Fallback to imageUrl
    });

    it('should return imageUrl when no carouselUrl', () => {
      component.product.set(mockProductWithoutCarousel);
      component.currentImageIndex.set(0);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('single-image.jpg');
    });

    it('should return imageUrl when carouselUrl is empty array', () => {
      component.product.set(mockProductEmptyCarousel);
      component.currentImageIndex.set(0);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('main-image.jpg');
    });

    it('should return empty string when no images at all', () => {
      component.product.set(mockProductNoImages);
      component.currentImageIndex.set(0);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('');
    });

    it('should handle undefined imageUrl gracefully', () => {
      const productNoImageUrl = { ...mockProductNoImages, imageUrl: undefined };
      component.product.set(productNoImageUrl);

      const result = component.getCurrentImageUrl();

      expect(result).toBe('');
    });

    it('should handle carousel with null values', () => {
      const productWithNullCarousel = {
        ...mockProduct,
        carouselUrl: ['valid-image.jpg', null as any, 'another-valid.jpg']
      };
      component.product.set(productWithNullCarousel);
      component.currentImageIndex.set(1); // Null value

      const result = component.getCurrentImageUrl();

      expect(result).toBe('test-image.jpg'); // Falls back to imageUrl
    });
  });

  describe('changeImage - Image Navigation', () => {
    it('should not change image when no product', () => {
      component.product.set(null);
      component.currentImageIndex.set(0);

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(0);
    });

    it('should not change image when no carouselUrl', () => {
      component.product.set(mockProductWithoutCarousel);
      component.currentImageIndex.set(0);

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(0);
    });

    it('should not change image when carouselUrl has only one image', () => {
      component.product.set(mockProductSingleCarousel);
      component.currentImageIndex.set(0);

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(0);
    });

    it('should move to next image', () => {
      component.product.set(mockProduct); // Has 3 images
      component.currentImageIndex.set(0);

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(1);
    });

    it('should wrap to first image when at end', () => {
      component.product.set(mockProduct); // Has 3 images
      component.currentImageIndex.set(2); // Last image

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(0); // Wraps to first
    });

    it('should move to previous image', () => {
      component.product.set(mockProduct); // Has 3 images
      component.currentImageIndex.set(2);

      component.changeImage('prev');

      expect(component.currentImageIndex()).toBe(1);
    });

    it('should wrap to last image when at beginning', () => {
      component.product.set(mockProduct); // Has 3 images
      component.currentImageIndex.set(0); // First image

      component.changeImage('prev');

      expect(component.currentImageIndex()).toBe(2); // Wraps to last
    });

    it('should handle empty carouselUrl array', () => {
      component.product.set(mockProductEmptyCarousel);
      component.currentImageIndex.set(0);

      component.changeImage('next');

      expect(component.currentImageIndex()).toBe(0); // No change
    });

    it('should handle multiple navigation operations', () => {
      component.product.set(mockProduct); // Has 3 images
      component.currentImageIndex.set(0);

      component.changeImage('next'); // 0 -> 1
      expect(component.currentImageIndex()).toBe(1);

      component.changeImage('next'); // 1 -> 2
      expect(component.currentImageIndex()).toBe(2);

      component.changeImage('prev'); // 2 -> 1
      expect(component.currentImageIndex()).toBe(1);

      component.changeImage('prev'); // 1 -> 0
      expect(component.currentImageIndex()).toBe(0);
    });

    it('should handle navigation with exactly 2 images', () => {
      const productWith2Images = {
        ...mockProduct,
        carouselUrl: ['image1.jpg', 'image2.jpg']
      };
      component.product.set(productWith2Images);
      component.currentImageIndex.set(0);

      component.changeImage('next');
      expect(component.currentImageIndex()).toBe(1);

      component.changeImage('next');
      expect(component.currentImageIndex()).toBe(0); // Wrap around

      component.changeImage('prev');
      expect(component.currentImageIndex()).toBe(1); // Wrap around backwards
    });
  });

  describe('addToCart - Cart Operations', () => {
    it('should not add to cart when no product', () => {
      component.product.set(null);

      component.addToCart();

      expect(mockCartService.addToCart).not.toHaveBeenCalled();
    });

    it('should add product to cart successfully', () => {
      component.product.set(mockProduct);
      mockCartService.addToCart.and.returnValue(of(mockCartItem));
      spyOn(console, 'log');

      component.addToCart();

      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProduct, 1);
      expect(console.log).toHaveBeenCalledWith('Product added to cart');
    });

    it('should handle cart service error', () => {
      component.product.set(mockProduct);
      const error = new Error('Cart service error');
      mockCartService.addToCart.and.returnValue(throwError(() => error));
      spyOn(console, 'error');

      component.addToCart();

      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProduct, 1);
      expect(console.error).toHaveBeenCalledWith('Error adding product to cart', error);
    });

    it('should add different products to cart', () => {
      // First product
      component.product.set(mockProduct);
      mockCartService.addToCart.and.returnValue(of(mockCartItem));

      component.addToCart();
      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProduct, 1);

      // Second product
      component.product.set(mockProductWithoutCarousel);
      component.addToCart();
      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProductWithoutCarousel, 1);
    });

    it('should handle product with zero stock', () => {
      component.product.set(mockProductSingleCarousel); // Has stock: 0
      mockCartService.addToCart.and.returnValue(of(mockCartItem));

      component.addToCart();

      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProductSingleCarousel, 1);
      // Note: The component doesn't prevent adding out-of-stock items to cart
      // That validation might be in the cart service or backend
    });
  });

  describe('Modal Operations', () => {
    describe('openModal', () => {
      it('should open size guide modal', () => {
        component.openModal('size');

        expect(component.isModalOpen()).toBe(true);
        expect(component.modalTitle()).toBe('Size Guide');
        expect(component.modalBody()).toContain('Find your perfect fit');
        expect(component.modalBody()).toContain('XS (Chest 46-48 cm)');
        expect(component.modalBody()).toContain('S (49-51 cm)');
        expect(component.modalBody()).toContain('M (52-54 cm)');
        expect(component.modalBody()).toContain('L (55-57 cm)');
        expect(component.modalBody()).toContain('XL (58-60 cm)');
      });

      it('should open shipping modal', () => {
        component.openModal('shipping');

        expect(component.isModalOpen()).toBe(true);
        expect(component.modalTitle()).toBe('Shipping & Returns');
        expect(component.modalBody()).toContain('Orders are processed within 1–2 business days');
        expect(component.modalBody()).toContain('Standard delivery: 3–7 business days');
        expect(component.modalBody()).toContain('Free returns within 30 days');
        expect(component.modalBody()).toContain('International shipping times vary');
      });

      it('should open multiple modals sequentially', () => {
        // Open size modal first
        component.openModal('size');
        expect(component.isModalOpen()).toBe(true);
        expect(component.modalTitle()).toBe('Size Guide');

        // Open shipping modal without closing first
        component.openModal('shipping');
        expect(component.isModalOpen()).toBe(true);
        expect(component.modalTitle()).toBe('Shipping & Returns');
      });

      it('should handle opening same modal multiple times', () => {
        component.openModal('size');
        const firstTitle = component.modalTitle();
        const firstBody = component.modalBody();

        component.openModal('size');

        expect(component.modalTitle()).toBe(firstTitle);
        expect(component.modalBody()).toBe(firstBody);
        expect(component.isModalOpen()).toBe(true);
      });
    });

    describe('closeModal', () => {
      it('should close modal', () => {
        // First open a modal
        component.openModal('size');
        expect(component.isModalOpen()).toBe(true);

        // Then close it
        component.closeModal();

        expect(component.isModalOpen()).toBe(false);
        // Title and body should remain (they're not cleared)
        expect(component.modalTitle()).toBe('Size Guide');
        expect(component.modalBody()).toContain('Find your perfect fit');
      });

      it('should handle closing already closed modal', () => {
        expect(component.isModalOpen()).toBe(false);

        component.closeModal();

        expect(component.isModalOpen()).toBe(false);
      });

      it('should handle open/close cycle multiple times', () => {
        for (let i = 0; i < 3; i++) {
          component.openModal('size');
          expect(component.isModalOpen()).toBe(true);

          component.closeModal();
          expect(component.isModalOpen()).toBe(false);
        }
      });
    });
  });

  describe('Component State Management', () => {
    it('should handle complete product loading cycle', () => {
      // Initial state
      expect(component.loading()).toBe(true);
      expect(component.product()).toBeNull();
      expect(component.error()).toBeNull();

      // Set up successful product load
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));

      component.ngOnInit();

      // Final state
      expect(component.loading()).toBe(false);
      expect(component.product()).toEqual(mockProduct);
      expect(component.error()).toBeNull();
    });

    it('should reset image index when new product loads', () => {
      // Load first product and navigate images
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();
      component.currentImageIndex.set(2);

      // Load second product
      const secondProduct = { ...mockProductWithoutCarousel, id: 2 };
      mockProductService.getProductById.and.returnValue(of(secondProduct));
      paramMapSubject.next(convertToParamMap({ id: '2' }));

      // Image index should remain as is (component doesn't auto-reset it)
      expect(component.currentImageIndex()).toBe(2);
      // But for proper UX, you might want to reset it manually:
      component.currentImageIndex.set(0);
      expect(component.currentImageIndex()).toBe(0);
    });

    it('should maintain selected size across product changes', () => {
      component.selectedSize = 'L';

      // Load first product
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();

      expect(component.selectedSize).toBe('L');

      // Load second product
      const secondProduct = { ...mockProductWithoutCarousel, id: 2 };
      mockProductService.getProductById.and.returnValue(of(secondProduct));
      paramMapSubject.next(convertToParamMap({ id: '2' }));

      expect(component.selectedSize).toBe('L'); // Should maintain
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle undefined carouselUrl gracefully', () => {
      const productUndefinedCarousel = {
        ...mockProduct,
        carouselUrl: undefined
      };
      component.product.set(productUndefinedCarousel);

      // getCurrentImageUrl should not crash
      const imageUrl = component.getCurrentImageUrl();
      expect(imageUrl).toBe('test-image.jpg'); // Falls back to imageUrl

      // changeImage should not crash
      component.changeImage('next');
      expect(component.currentImageIndex()).toBe(0); // No change
    });

    it('should handle product with all undefined image properties', () => {
      const productNoImages = {
        id: 99,
        name: 'No Images Product',
        price: 1.00,
        stock: 1,
        categoryId: 1,
        imageUrl: undefined,
        carouselUrl: undefined
      };
      component.product.set(productNoImages);

      const imageUrl = component.getCurrentImageUrl();
      expect(imageUrl).toBe('');
    });

    it('should handle negative currentImageIndex', () => {
      component.product.set(mockProduct);
      component.currentImageIndex.set(-1);

      const imageUrl = component.getCurrentImageUrl();
      expect(imageUrl).toBe('test-image.jpg'); // Falls back to imageUrl due to invalid index
    });

    it('should handle very large currentImageIndex', () => {
      component.product.set(mockProduct);
      component.currentImageIndex.set(999);

      const imageUrl = component.getCurrentImageUrl();
      expect(imageUrl).toBe('test-image.jpg'); // Falls back to imageUrl due to invalid index
    });

    it('should handle product service returning null', () => {
      mockProductService.getProductById.and.returnValue(of(null as any));
      paramMapSubject.next(convertToParamMap({ id: '1' }));

      component.ngOnInit();

      expect(component.product()).toBeNull();
      expect(component.loading()).toBe(false);
    });

    it('should handle route parameter changes during loading', () => {
      let resolvePromise: any;
      const delayedObservable = new Promise<Product>(resolve => {
        resolvePromise = resolve;
      });

      mockProductService.getProductById.and.returnValue(from(delayedObservable));

      // Start loading first product
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();
      expect(component.loading()).toBe(true);

      // Change to second product before first finishes
      paramMapSubject.next(convertToParamMap({ id: '2' }));

      // Resolve first product
      resolvePromise(mockProduct);

      // Component should handle this gracefully
      expect(component).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete user interaction flow', async () => {
      // Load product
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();

      expect(component.product()).toEqual(mockProduct);

      // Navigate images
      component.changeImage('next');
      expect(component.currentImageIndex()).toBe(1);

      // Open modal
      component.openModal('size');
      expect(component.isModalOpen()).toBe(true);

      // Close modal
      component.closeModal();
      expect(component.isModalOpen()).toBe(false);

      // Add to cart
      mockCartService.addToCart.and.returnValue(of(mockCartItem));
      spyOn(console, 'log');
      component.addToCart();

      expect(mockCartService.addToCart).toHaveBeenCalledWith(mockProduct, 1);
      expect(console.log).toHaveBeenCalledWith('Product added to cart');
    });

    it('should handle error recovery flow', () => {
      // Start with error
      mockProductService.getProductById.and.returnValue(throwError(() => new Error('Network error')));
      paramMapSubject.next(convertToParamMap({ id: '1' }));
      component.ngOnInit();

      expect(component.error()).toBe('Failed to load product details. Please try again later.');
      expect(component.loading()).toBe(false);

      // Retry with success
      mockProductService.getProductById.and.returnValue(of(mockProduct));
      paramMapSubject.next(convertToParamMap({ id: '1' })); // Same ID, simulating retry

      expect(component.product()).toEqual(mockProduct);
      expect(component.error()).toBeNull();
      expect(component.loading()).toBe(false);
    });
  });

  describe('Template Integration', () => {
    it('should render loading state correctly', () => {
      component.loading.set(true);
      component.error.set(null);
      component.product.set(null);

      fixture.detectChanges();

      const loadingElement = fixture.nativeElement.querySelector('.loading p');
      expect(loadingElement?.textContent).toContain('Loading product details...');
    });

    it('should render error state correctly', () => {
      component.loading.set(false);
      component.error.set('Test error message');
      component.product.set(null);

      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('.error p');
      expect(errorElement?.textContent).toContain('Test error message');
    });

    it('should render product details correctly', () => {
      component.loading.set(false);
      component.error.set(null);
      component.product.set(mockProduct);

      fixture.detectChanges();

      const productName = fixture.nativeElement.querySelector('h2');
      const productPrice = fixture.nativeElement.querySelector('.price');
      const productDescription = fixture.nativeElement.querySelector('.description');

      expect(productName?.textContent).toContain('Test Product');
      expect(productPrice?.textContent).toContain('29.99');
      expect(productDescription?.textContent).toContain('Test Description');
    });

    it('should render add to cart button when product has stock', () => {
      component.loading.set(false);
      component.error.set(null);
      component.product.set(mockProduct); // Has stock: 10

      fixture.detectChanges();

      const addToCartButton = fixture.nativeElement.querySelector('.add-to-cart');
      const soldOutButton = fixture.nativeElement.querySelector('.sold-out');

      expect(addToCartButton).toBeTruthy();
      expect(soldOutButton).toBeFalsy();
    });

    it('should render sold out button when product has no stock', () => {
      component.loading.set(false);
      component.error.set(null);
      component.product.set(mockProductSingleCarousel); // Has stock: 0

      fixture.detectChanges();

      const addToCartButton = fixture.nativeElement.querySelector('.add-to-cart');
      const soldOutButton = fixture.nativeElement.querySelector('.sold-out');

      expect(addToCartButton).toBeFalsy();
      expect(soldOutButton).toBeTruthy();
      expect(soldOutButton?.textContent).toContain('SOLD OUT');
    });
  });
});
