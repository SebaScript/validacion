import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { By } from '@angular/platform-browser';

import { HeaderComponent } from './header.component';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CartComponent } from '../cart/cart.component';
import { User } from '../../interfaces/user.interface';
import { Product } from '../../interfaces/product.interface';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser: User = {
    userId: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'client'
  };

  const mockAdminUser: User = {
    userId: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  };

  const mockProducts: Product[] = [
    {
      id: 1,
      name: 'Test Product 1',
      description: 'Test description 1',
      price: 99.99,
      stock: 10,
      categoryId: 1,
      imageUrl: 'test1.jpg',
      carouselUrl: []
    },
    {
      id: 2,
      name: 'Another Product',
      description: 'Another description',
      price: 49.99,
      stock: 5,
      categoryId: 2,
      imageUrl: 'test2.jpg',
      carouselUrl: []
    },
    {
      id: 3,
      name: 'Special Item',
      description: 'Special test description',
      price: 199.99,
      stock: 1,
      categoryId: 1,
      imageUrl: '',
      carouselUrl: []
    }
  ];

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(null);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated'], {
      currentUser$: currentUserSubject.asObservable()
    });
    const productServiceSpy = jasmine.createSpyObj('ProductService', ['getAllProducts']);
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['totalItems']);
    const toastrSpy = jasmine.createSpyObj('ToastrService', ['error']);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        CommonModule,
        FormsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    })
    .overrideComponent(HeaderComponent, {
      set: {
        imports: [CommonModule, FormsModule],
        template: `
          <header class="app-header">
            <div class="header-content">
              <div class="search-container">
                <i class="material-icons">search</i>
                <input type="text" placeholder="Search" [(ngModel)]="query" (input)="onSearch()" />
                <button *ngIf="results.length || query" class="close-btn" (click)="clearSearch()">×</button>
                <ul class="search-results" *ngIf="results.length > 0">
                  <li *ngFor="let item of results" (click)="goToProduct(item.id)">
                    <img [src]="item.imageUrl" [alt]="item.name" class="thumb" />
                    <span class="name">{{ item.name }}</span>
                  </li>
                </ul>
              </div>
              <div class="actions">
                <div class="action-item cart-icon" (click)="toggleCart()">
                  <i class="material-icons">shopping_cart</i>
                  <span class="badge" *ngIf="cartService.totalItems() > 0">{{ cartService.totalItems() }}</span>
                </div>
                <div class="action-item user-icon" (click)="handleUserClick()">
                  <i class="material-icons">person</i>
                </div>
              </div>
            </div>
          </header>
        `
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockProductService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    mockCartService = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    mockToastr = TestBed.inject(ToastrService) as jasmine.SpyObj<ToastrService>;

    // Default setup
    mockProductService.getAllProducts.and.returnValue(of(mockProducts));
    mockCartService.totalItems.and.returnValue(3);
    mockAuthService.isAuthenticated.and.returnValue(false);
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.query).toBe('');
      expect(component.results).toEqual([]);
      expect(component.currentUser).toBeNull();
      expect(component.isAuthenticated).toBeFalse();
      expect(component.isAdmin).toBeFalse();
      expect(component.isCartOpen).toBeFalse();
      expect(component.cartCount).toBe(0);
    });

    it('should load products on init', () => {
      component.ngOnInit();

      expect(mockProductService.getAllProducts).toHaveBeenCalled();
      expect(component['allProducts']).toEqual(mockProducts);
    });

    it('should handle product loading error', () => {
      const consoleSpy = spyOn(console, 'error');
      mockProductService.getAllProducts.and.returnValue(throwError(() => new Error('Load error')));

      component.ngOnInit();

      expect(consoleSpy).toHaveBeenCalledWith('Error loading products for search:', jasmine.any(Error));
    });

    it('should subscribe to currentUser$ and update authentication state', () => {
      component.ngOnInit();

      // Test null user
      currentUserSubject.next(null);
      expect(component.currentUser).toBeNull();
      expect(component.isAuthenticated).toBeFalse();
      expect(component.isAdmin).toBeFalse();

      // Test regular user
      currentUserSubject.next(mockUser);
      expect(component.currentUser).toEqual(mockUser);
      expect(component.isAuthenticated).toBeTrue();
      expect(component.isAdmin).toBeFalse();

      // Test admin user
      currentUserSubject.next(mockAdminUser);
      expect(component.currentUser).toEqual(mockAdminUser);
      expect(component.isAuthenticated).toBeTrue();
      expect(component.isAdmin).toBeTrue();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should clear results when query is empty', () => {
      component.query = '';
      component.onSearch();

      expect(component.results).toEqual([]);
    });

    it('should clear results when query is only whitespace', () => {
      component.query = '   ';
      component.onSearch();

      expect(component.results).toEqual([]);
    });

    it('should search products by name', () => {
      component.query = 'Test';
      component.onSearch();

      expect(component.results).toHaveSize(1);
      expect(component.results[0]).toEqual({
        id: 1,
        name: 'Test Product 1',
        imageUrl: 'test1.jpg'
      });
    });

    it('should search products by description', () => {
      component.query = 'special';
      component.onSearch();

      expect(component.results).toHaveSize(1);
      expect(component.results[0]).toEqual({
        id: 3,
        name: 'Special Item',
        imageUrl: ''
      });
    });

    it('should be case insensitive', () => {
      component.query = 'ANOTHER';
      component.onSearch();

      expect(component.results).toHaveSize(1);
      expect(component.results[0].name).toBe('Another Product');
    });

    it('should limit results to 5 items', () => {
      // Add more products to test limit
      const manyProducts = Array.from({ length: 10 }, (_, i) => ({
        id: i + 10,
        name: `Test Product ${i + 10}`,
        description: 'Test description',
        price: 99.99,
        stock: 10,
        categoryId: 1,
        imageUrl: 'test.jpg',
        carouselUrl: []
      }));

      component['allProducts'] = manyProducts;
      component.query = 'Test';
      component.onSearch();

      expect(component.results).toHaveSize(5);
    });

    it('should handle products without descriptions gracefully', () => {
      const productWithoutDesc = {
        id: 99,
        name: 'No Description Product',
        description: undefined,
        price: 99.99,
        stock: 10,
        categoryId: 1,
        imageUrl: 'test.jpg',
        carouselUrl: []
      } as Product;

      component['allProducts'] = [productWithoutDesc];
      component.query = 'description';

      expect(() => component.onSearch()).not.toThrow();
      expect(component.results).toEqual([]);
    });
  });

  describe('Search Interaction', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should navigate to product when goToProduct is called', () => {
      component.goToProduct(123);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/product', 123]);
      expect(component.query).toBe('');
      expect(component.results).toEqual([]);
    });

    it('should clear search when clearSearch is called', () => {
      component.query = 'test';
      component.results = [{ id: 1, name: 'Test', imageUrl: 'test.jpg' }];

      component.clearSearch();

      expect(component.query).toBe('');
      expect(component.results).toEqual([]);
    });

    it('should clear search on outside click', () => {
      component.query = 'test';
      component.results = [{ id: 1, name: 'Test', imageUrl: 'test.jpg' }];

      const mockElement = document.createElement('div');
      spyOn(mockElement, 'closest').and.returnValue(null);

      component.onOutsideClick(mockElement);

      expect(component.query).toBe('');
      expect(component.results).toEqual([]);
    });

    it('should not clear search on inside click', () => {
      component.query = 'test';
      component.results = [{ id: 1, name: 'Test', imageUrl: 'test.jpg' }];

      const mockElement = document.createElement('div');
      const mockSearchContainer = document.createElement('div');
      mockSearchContainer.classList.add('search-container');
      spyOn(mockElement, 'closest').and.returnValue(mockSearchContainer);

      component.onOutsideClick(mockElement);

      expect(component.query).toBe('test');
      expect(component.results).toHaveSize(1);
    });
  });

  describe('Cart Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should toggle cart when user is authenticated', () => {
      mockAuthService.isAuthenticated.and.returnValue(true);
      component.isCartOpen = false;

      component.toggleCart();

      expect(component.isCartOpen).toBeTrue();
      expect(mockToastr.error).not.toHaveBeenCalled();
    });

    it('should show error when user is not authenticated', () => {
      mockAuthService.isAuthenticated.and.returnValue(false);

      component.toggleCart();

      expect(component.isCartOpen).toBeFalse();
      expect(mockToastr.error).toHaveBeenCalledWith(
        'Please log in to view your cart',
        'Authentication Required'
      );
    });

    it('should close cart when closeCart is called', () => {
      component.isCartOpen = true;

      component.closeCart();

      expect(component.isCartOpen).toBeFalse();
    });

    it('should toggle cart state correctly', () => {
      mockAuthService.isAuthenticated.and.returnValue(true);

      // First toggle - open
      component.isCartOpen = false;
      component.toggleCart();
      expect(component.isCartOpen).toBeTrue();

      // Second toggle - close
      component.toggleCart();
      expect(component.isCartOpen).toBeFalse();
    });
  });

  describe('User Navigation', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should navigate to login when user is not authenticated', () => {
      component.isAuthenticated = false;

      component.handleUserClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should navigate to admin when user is admin', () => {
      component.isAuthenticated = true;
      component.isAdmin = true;

      component.handleUserClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should navigate to profile when user is regular client', () => {
      component.isAuthenticated = true;
      component.isAdmin = false;

      component.handleUserClick();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
    });
  });

  describe('Template Integration', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should display search input', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      expect(searchInput).toBeTruthy();
      expect(searchInput.nativeElement.placeholder).toBe('Search');
    });

    it('should bind search query to input', () => {
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));
      component.query = 'test query';
      fixture.detectChanges();

      expect(searchInput.nativeElement.value).toBe('test query');
    });

    it('should show close button when query exists', () => {
      component.query = 'test';
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.close-btn'));
      expect(closeButton).toBeTruthy();
    });

    it('should show close button when results exist', () => {
      component.results = [{ id: 1, name: 'Test', imageUrl: 'test.jpg' }];
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.close-btn'));
      expect(closeButton).toBeTruthy();
    });

    it('should not show close button when no query and no results', () => {
      component.query = '';
      component.results = [];
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.close-btn'));
      expect(closeButton).toBeFalsy();
    });

    it('should display search results', () => {
      component.results = [
        { id: 1, name: 'Test Product 1', imageUrl: 'test1.jpg' },
        { id: 2, name: 'Test Product 2', imageUrl: 'test2.jpg' }
      ];
      fixture.detectChanges();

      const resultsList = fixture.debugElement.query(By.css('.search-results'));
      const resultItems = fixture.debugElement.queryAll(By.css('.search-results li'));

      expect(resultsList).toBeTruthy();
      expect(resultItems).toHaveSize(2);
    });

    it('should show cart badge when items exist', () => {
      mockCartService.totalItems.and.returnValue(5);
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.badge'));
      expect(badge).toBeTruthy();
      expect(badge.nativeElement.textContent.trim()).toBe('5');
    });

    it('should not show cart badge when no items', () => {
      mockCartService.totalItems.and.returnValue(0);
      fixture.detectChanges();

      const badge = fixture.debugElement.query(By.css('.badge'));
      expect(badge).toBeFalsy();
    });

    it('should trigger search on input', () => {
      spyOn(component, 'onSearch');
      const searchInput = fixture.debugElement.query(By.css('input[type="text"]'));

      searchInput.nativeElement.value = 'test';
      searchInput.triggerEventHandler('input', { target: searchInput.nativeElement });

      expect(component.onSearch).toHaveBeenCalled();
    });

    it('should trigger clearSearch on close button click', () => {
      spyOn(component, 'clearSearch');
      component.query = 'test';
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(By.css('.close-btn'));
      closeButton.triggerEventHandler('click', null);

      expect(component.clearSearch).toHaveBeenCalled();
    });

    it('should trigger goToProduct on result item click', () => {
      spyOn(component, 'goToProduct');
      component.results = [{ id: 1, name: 'Test', imageUrl: 'test.jpg' }];
      fixture.detectChanges();

      const resultItem = fixture.debugElement.query(By.css('.search-results li'));
      resultItem.triggerEventHandler('click', null);

      expect(component.goToProduct).toHaveBeenCalledWith(1);
    });

    it('should trigger toggleCart on cart icon click', () => {
      spyOn(component, 'toggleCart');

      const cartIcon = fixture.debugElement.query(By.css('.cart-icon'));
      cartIcon.triggerEventHandler('click', null);

      expect(component.toggleCart).toHaveBeenCalled();
    });

    it('should trigger handleUserClick on user icon click', () => {
      spyOn(component, 'handleUserClick');

      const userIcon = fixture.debugElement.query(By.css('.user-icon'));
      userIcon.triggerEventHandler('click', null);

      expect(component.handleUserClick).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should handle empty products array', () => {
      component['allProducts'] = [];
      component.query = 'test';

      component.onSearch();

      expect(component.results).toEqual([]);
    });

    it('should handle special characters in search', () => {
      component.query = '@#$%';

      expect(() => component.onSearch()).not.toThrow();
      expect(component.results).toEqual([]);
    });

    it('should handle very long search queries', () => {
      component.query = 'a'.repeat(1000);

      expect(() => component.onSearch()).not.toThrow();
    });

    it('should handle Unicode characters in search', () => {
      const unicodeProduct = {
        id: 100,
        name: 'Café Latté',
        description: 'Delicious café with milk',
        price: 5.99,
        stock: 10,
        categoryId: 1,
        imageUrl: 'cafe.jpg',
        carouselUrl: []
      };

      component['allProducts'] = [unicodeProduct];
      component.query = 'café';
      component.onSearch();

      expect(component.results).toHaveSize(1);
      expect(component.results[0].name).toBe('Café Latté');
    });

    it('should handle null imageUrl in search results', () => {
      const productWithNullImage = {
        id: 101,
        name: 'No Image Product',
        description: 'Product without image',
        price: 99.99,
        stock: 10,
        categoryId: 1,
        imageUrl: null as any,
        carouselUrl: []
      };

      component['allProducts'] = [productWithNullImage];
      component.query = 'no image';
      component.onSearch();

      expect(component.results).toHaveSize(1);
      expect(component.results[0].imageUrl).toBe('');
    });
  });
});
