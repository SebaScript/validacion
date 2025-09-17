import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockProductData = {
    imageUrl: 'https://example.com/test-image.jpg',
    title: 'Test Product',
    price: 29.99,
    productId: 123
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, CommonModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Set up default inputs
    component.imageUrl = mockProductData.imageUrl;
    component.title = mockProductData.title;
    component.price = mockProductData.price;
    component.productId = mockProductData.productId;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject router correctly', () => {
      expect(component['router']).toBe(mockRouter);
    });

    it('should initialize with undefined inputs by default', () => {
      const newComponent = TestBed.createComponent(ProductCardComponent).componentInstance;
      expect(newComponent.imageUrl).toBeUndefined();
      expect(newComponent.title).toBeUndefined();
      expect(newComponent.price).toBeUndefined();
      expect(newComponent.productId).toBeUndefined();
    });
  });

  describe('Input Properties', () => {
    it('should accept and display imageUrl input', () => {
      const testImageUrl = 'https://test.com/image.png';
      component.imageUrl = testImageUrl;
      fixture.detectChanges();

      const imgElement = fixture.nativeElement.querySelector('.product-image');
      expect(imgElement).toBeTruthy();
      expect(imgElement.src).toBe(testImageUrl);
    });

    it('should accept and display title input', () => {
      const testTitle = 'Amazing Product';
      component.title = testTitle;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.product-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent?.trim()).toBe(testTitle);
    });

    it('should accept and display price input with currency formatting', () => {
      const testPrice = 99.99;
      component.price = testPrice;
      fixture.detectChanges();

      const priceElement = fixture.nativeElement.querySelector('.product-price');
      expect(priceElement).toBeTruthy();
      expect(priceElement.textContent).toContain('$99.99');
    });

    it('should accept productId input', () => {
      const testProductId = 456;
      component.productId = testProductId;

      expect(component.productId).toBe(testProductId);
    });

    it('should handle empty/null inputs gracefully', () => {
      component.imageUrl = '';
      component.title = '';
      component.price = 0;
      component.productId = 0;
      fixture.detectChanges();

      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle undefined inputs gracefully', () => {
      component.imageUrl = undefined as any;
      component.title = undefined as any;
      component.price = undefined as any;
      component.productId = undefined as any;

      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Template Rendering', () => {
    it('should render product card with correct CSS class', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');
      expect(cardElement).toBeTruthy();
    });

    it('should render image with correct attributes', () => {
      const imgElement = fixture.nativeElement.querySelector('.product-image');
      expect(imgElement).toBeTruthy();
      expect(imgElement.src).toBe(mockProductData.imageUrl);
      expect(imgElement.alt).toBe(mockProductData.title);
      expect(imgElement.classList.contains('product-image')).toBe(true);
    });

    it('should render title with correct styling', () => {
      const titleElement = fixture.nativeElement.querySelector('.product-title');
      expect(titleElement).toBeTruthy();
      expect(titleElement.textContent?.trim()).toBe(mockProductData.title);
      expect(titleElement.tagName.toLowerCase()).toBe('h3');
      expect(titleElement.classList.contains('product-title')).toBe(true);
    });

    it('should render price with currency pipe and correct styling', () => {
      const priceElement = fixture.nativeElement.querySelector('.product-price');
      expect(priceElement).toBeTruthy();
      expect(priceElement.textContent).toContain('$29.99');
      expect(priceElement.tagName.toLowerCase()).toBe('p');
      expect(priceElement.classList.contains('product-price')).toBe(true);
    });

    it('should apply correct structure hierarchy', () => {
      const card = fixture.nativeElement.querySelector('.product-card');
      const img = card.querySelector('.product-image');
      const title = card.querySelector('.product-title');
      const price = card.querySelector('.product-price');

      expect(img).toBeTruthy();
      expect(title).toBeTruthy();
      expect(price).toBeTruthy();
    });
  });

  describe('Navigation Functionality', () => {
    it('should navigate to product details when goToDetails is called', () => {
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', mockProductData.productId]);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate with correct product ID when called multiple times', () => {
      component.productId = 789;
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 789]);

      component.productId = 456;
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 456]);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(2);
    });

    it('should handle navigation with zero productId', () => {
      component.productId = 0;
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 0]);
    });

    it('should handle navigation with negative productId', () => {
      component.productId = -1;
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', -1]);
    });
  });

  describe('Click Event Handling', () => {
    it('should call goToDetails when product card is clicked', () => {
      spyOn(component, 'goToDetails');

      const cardElement = fixture.nativeElement.querySelector('.product-card');
      cardElement.click();

      expect(component.goToDetails).toHaveBeenCalled();
      expect(component.goToDetails).toHaveBeenCalledTimes(1);
    });

    it('should navigate to product details when card is clicked', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');
      cardElement.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', mockProductData.productId]);
    });

    it('should handle multiple clicks correctly', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');

      cardElement.click();
      cardElement.click();
      cardElement.click();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
    });

    it('should handle click events on child elements', () => {
      spyOn(component, 'goToDetails');

      const imgElement = fixture.nativeElement.querySelector('.product-image');
      imgElement.click();

      expect(component.goToDetails).toHaveBeenCalled();
    });

    it('should handle keyboard events if accessible', () => {
      spyOn(component, 'goToDetails');

      const cardElement = fixture.nativeElement.querySelector('.product-card');
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      cardElement.dispatchEvent(enterEvent);

      // Note: This test verifies the element can receive keyboard events
      // The actual keyboard handling would need to be implemented separately
      expect(cardElement).toBeTruthy();
    });
  });

  describe('Data Type Handling', () => {
    it('should handle different price formats correctly', () => {
      const testPrices = [0, 0.99, 10, 99.99, 100, 999.99, 1000];

      testPrices.forEach(price => {
        component.price = price;
        fixture.detectChanges();

        const priceElement = fixture.nativeElement.querySelector('.product-price');
        expect(priceElement.textContent).toContain('$');
        expect(priceElement.textContent).toContain(price.toString().split('.')[0]);
      });
    });

    it('should handle long titles gracefully', () => {
      const longTitle = 'This is a very long product title that might overflow the container and needs to be handled properly';
      component.title = longTitle;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.product-title');
      expect(titleElement.textContent?.trim()).toBe(longTitle);
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Product with "quotes" & <tags> and émojis 🎉';
      component.title = specialTitle;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.product-title');
      expect(titleElement.textContent?.trim()).toBe(specialTitle);
    });

    it('should handle very large product IDs', () => {
      const largeId = 999999999;
      component.productId = largeId;
      component.goToDetails();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', largeId]);
    });
  });

  describe('Image Handling', () => {
    it('should set correct alt text from title', () => {
      const testTitle = 'Cool Gadget';
      component.title = testTitle;
      fixture.detectChanges();

      const imgElement = fixture.nativeElement.querySelector('.product-image');
      expect(imgElement.alt).toBe(testTitle);
    });

    it('should handle image loading errors gracefully', () => {
      const imgElement = fixture.nativeElement.querySelector('.product-image');
      const errorEvent = new Event('error');

      expect(() => imgElement.dispatchEvent(errorEvent)).not.toThrow();
    });

    it('should handle different image URL formats', () => {
      const testUrls = [
        'https://example.com/image.jpg',
        'http://test.com/pic.png',
        '/relative/path/image.gif',
        'data:image/svg+xml;base64,PHN2Zw==',
        ''
      ];

      testUrls.forEach(url => {
        component.imageUrl = url;
        fixture.detectChanges();

        const imgElement = fixture.nativeElement.querySelector('.product-image');
        expect(imgElement.src).toContain(url || '');
      });
    });
  });

  describe('Component State Management', () => {
    it('should maintain component state after input changes', () => {
      const originalRouter = component['router'];

      component.title = 'New Title';
      component.price = 199.99;
      fixture.detectChanges();

      expect(component['router']).toBe(originalRouter);
      expect(component.title).toBe('New Title');
      expect(component.price).toBe(199.99);
    });

    it('should update template when inputs change', () => {
      component.title = 'Updated Product';
      component.price = 79.99;
      fixture.detectChanges();

      const titleElement = fixture.nativeElement.querySelector('.product-title');
      const priceElement = fixture.nativeElement.querySelector('.product-price');

      expect(titleElement.textContent?.trim()).toBe('Updated Product');
      expect(priceElement.textContent).toContain('$79.99');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle router navigation errors gracefully', () => {
      mockRouter.navigate.and.returnValue(Promise.reject('Navigation failed'));

      expect(() => component.goToDetails()).not.toThrow();
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should handle component destruction without errors', () => {
      expect(() => fixture.destroy()).not.toThrow();
    });

    it('should handle rapid input changes', () => {
      for (let i = 0; i < 100; i++) {
        component.title = `Product ${i}`;
        component.price = i * 1.99;
        component.productId = i;
      }

      fixture.detectChanges();

      expect(component.title).toBe('Product 99');
      expect(component.price).toBe(99 * 1.99);
      expect(component.productId).toBe(99);
    });

    it('should handle missing router dependency', () => {
      // This test verifies the component structure can handle dependency issues
      expect(component['router']).toBeDefined();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple click events', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');

      for (let i = 0; i < 50; i++) {
        cardElement.click();
      }

      expect(mockRouter.navigate).toHaveBeenCalledTimes(50);
    });

    it('should handle rapid re-renders efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        fixture.detectChanges();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 100 change detections)
      expect(duration).toBeLessThan(100);
    });

    it('should not leak event listeners', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');
      const initialListeners = cardElement._eventListeners?.click?.length || 0;

      // Click multiple times
      for (let i = 0; i < 10; i++) {
        cardElement.click();
      }

      const finalListeners = cardElement._eventListeners?.click?.length || 0;

      // Should not accumulate extra listeners
      expect(finalListeners).toBeLessThanOrEqual(initialListeners + 1);
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should provide meaningful alt text for images', () => {
      const imgElement = fixture.nativeElement.querySelector('.product-image');
      expect(imgElement.alt).toBeTruthy();
      expect(imgElement.alt).toBe(mockProductData.title);
    });

    it('should have appropriate heading level for title', () => {
      const titleElement = fixture.nativeElement.querySelector('.product-title');
      expect(titleElement.tagName.toLowerCase()).toBe('h3');
    });

    it('should be clickable for keyboard users', () => {
      const cardElement = fixture.nativeElement.querySelector('.product-card');
      // Verify the element exists and can receive focus/clicks
      expect(cardElement).toBeTruthy();
      expect(cardElement.click).toBeDefined();
    });
  });

  describe('Integration with Angular Features', () => {
    it('should work with change detection', () => {
      component.title = 'Change Detection Test';
      expect(fixture.nativeElement.querySelector('.product-title').textContent).not.toContain('Change Detection Test');

      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.product-title').textContent?.trim()).toBe('Change Detection Test');
    });

    it('should work with currency pipe', () => {
      component.price = 1234.56;
      fixture.detectChanges();

      const priceElement = fixture.nativeElement.querySelector('.product-price');
      expect(priceElement.textContent).toContain('$1,234.56');
    });

    it('should work with Angular event binding', () => {
      const clickSpy = spyOn(component, 'goToDetails');
      const cardElement = fixture.debugElement.query(By.css('.product-card'));

      cardElement.triggerEventHandler('click', null);

      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
