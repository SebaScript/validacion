import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';

import { SidebarComponent } from './sidebar.component';
import { CategoryService } from '../../services/category.service';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;

  const categories = [
    'New',
    'T-shirts',
    'Hoodies',
    'Hats',
    'Bags',
    'Accesories',
    'Bottoms',
    'Sweatshirts',
    'Tops/Jerseys',
    'Denim',
    'Womens'
  ];

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    Object.defineProperty(routerSpy, 'url', { value: '/', writable: true });
    const categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['setCategory']);

    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CategoryService, useValue: categoryServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockCategoryService = TestBed.inject(CategoryService) as jasmine.SpyObj<CategoryService>;

    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject dependencies correctly', () => {
      expect(component['catSvc']).toBeTruthy();
      expect(component.router).toBeTruthy();
    });
  });

  describe('Category Selection', () => {
    it('should call setCategory when selectCategory is called', () => {
      component.selectCategory('T-shirts');

      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('T-shirts');
    });

    it('should not navigate when already on home page', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/', writable: true });

      component.selectCategory('Hoodies');

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('Hoodies');
    });

    it('should navigate to home when on different page', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/profile', writable: true });

      component.selectCategory('Hats');

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('Hats');
    });

    it('should handle category selection from product page', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/product/123', writable: true });

      component.selectCategory('Bags');

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('Bags');
    });

    it('should handle category selection from admin page', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/admin', writable: true });

      component.selectCategory('New');

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('New');
    });

    it('should handle category selection with query parameters on home', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/?search=test', writable: true });

      component.selectCategory('Accesories');

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('Accesories');
    });

    it('should handle category selection with fragments on home', () => {
      Object.defineProperty(mockRouter, 'url', { value: '/#section', writable: true });

      component.selectCategory('Bottoms');

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('Bottoms');
    });
  });

  describe('Template Integration', () => {
    it('should display logo with correct link', () => {
      const logoLink = fixture.debugElement.query(By.css('a[routerLink="/"]'));
      const logoImg = fixture.debugElement.query(By.css('img.logo'));

      expect(logoLink).toBeTruthy();
      expect(logoImg).toBeTruthy();
      expect(logoImg.nativeElement.src).toContain('/logo.png');
      expect(logoImg.nativeElement.alt).toBe('VLMR logo');
    });

    it('should display all category links', () => {
      const categoryLinks = fixture.debugElement.queryAll(By.css('.sidebar-link'));

      expect(categoryLinks).toHaveSize(categories.length);

      categoryLinks.forEach((link, index) => {
        expect(link.nativeElement.textContent.trim()).toBe(categories[index] === 'Accesories' ? 'Accessories' : categories[index]);
      });
    });

    it('should trigger selectCategory on click for each category', () => {
      spyOn(component, 'selectCategory');

      categories.forEach((category, index) => {
        const categoryLink = fixture.debugElement.queryAll(By.css('.sidebar-link'))[index];
        categoryLink.triggerEventHandler('click', null);

        expect(component.selectCategory).toHaveBeenCalledWith(category);
      });

      expect(component.selectCategory).toHaveBeenCalledTimes(categories.length);
    });

    it('should trigger selectCategory on Enter key for each category', () => {
      spyOn(component, 'selectCategory');

      categories.forEach((category, index) => {
        const categoryLink = fixture.debugElement.queryAll(By.css('.sidebar-link'))[index];
        categoryLink.triggerEventHandler('keydown.enter', null);

        expect(component.selectCategory).toHaveBeenCalledWith(category);
      });

      expect(component.selectCategory).toHaveBeenCalledTimes(categories.length);
    });

    it('should display Instagram icon and shipping policy link', () => {
      const igIcon = fixture.debugElement.query(By.css('#ig-icon'));
      const shippingLink = fixture.debugElement.query(By.css('.sidebar-footer a:not(#ig-icon)'));

      expect(igIcon).toBeTruthy();
      expect(igIcon.nativeElement.href).toBeDefined();
      expect(shippingLink).toBeTruthy();
      expect(shippingLink.nativeElement.textContent.trim()).toBe('Shipping policy');
    });

    it('should have correct navigation structure', () => {
      const nav = fixture.debugElement.query(By.css('.sidebar-nav'));
      const ul = fixture.debugElement.query(By.css('.sidebar-nav ul'));
      const liItems = fixture.debugElement.queryAll(By.css('.sidebar-nav li'));

      expect(nav).toBeTruthy();
      expect(ul).toBeTruthy();
      expect(liItems).toHaveSize(categories.length);
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation for all category links', () => {
      const categoryLinks = fixture.debugElement.queryAll(By.css('.sidebar-link'));

      categoryLinks.forEach(link => {
        expect(link.attributes['keydown.enter']).toBeDefined();
      });
    });

    it('should have proper alt text for logo', () => {
      const logoImg = fixture.debugElement.query(By.css('img.logo'));

      expect(logoImg.nativeElement.alt).toBe('VLMR logo');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty category string', () => {
      component.selectCategory('');

      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('');
    });

    it('should handle special characters in category', () => {
      const specialCategory = 'Tops/Jerseys';

      component.selectCategory(specialCategory);

      expect(mockCategoryService.setCategory).toHaveBeenCalledWith(specialCategory);
    });

    it('should handle category with spaces', () => {
      const categoryWithSpaces = '  T-shirts  ';

      component.selectCategory(categoryWithSpaces);

      expect(mockCategoryService.setCategory).toHaveBeenCalledWith(categoryWithSpaces);
    });

    it('should handle null router url', () => {
      (mockRouter as any).url = null;

      expect(() => component.selectCategory('New')).not.toThrow();
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('New');
    });

    it('should handle undefined router url', () => {
      (mockRouter as any).url = undefined;

      expect(() => component.selectCategory('New')).not.toThrow();
      expect(mockCategoryService.setCategory).toHaveBeenCalledWith('New');
    });

    it('should handle router navigation error gracefully', () => {
      mockRouter.navigateByUrl.and.throwError('Navigation error');
      Object.defineProperty(mockRouter, 'url', { value: '/profile', writable: true });

      expect(() => component.selectCategory('New')).toThrow();
    });

    it('should handle category service error gracefully', () => {
      mockCategoryService.setCategory.and.throwError('Category error');

      expect(() => component.selectCategory('New')).toThrow();
    });
  });

  describe('Category Flow Integration', () => {
    it('should complete full category selection flow from different pages', () => {
      const testCases = [
        { currentUrl: '/admin', category: 'T-shirts', shouldNavigate: true },
        { currentUrl: '/', category: 'Hoodies', shouldNavigate: false },
        { currentUrl: '/profile', category: 'Hats', shouldNavigate: true },
        { currentUrl: '/product/1', category: 'Bags', shouldNavigate: true },
        { currentUrl: '/login', category: 'New', shouldNavigate: true }
      ];

      testCases.forEach(testCase => {
        mockRouter.navigateByUrl.calls.reset();
        mockCategoryService.setCategory.calls.reset();
        Object.defineProperty(mockRouter, 'url', { value: testCase.currentUrl, writable: true });

        component.selectCategory(testCase.category);

        if (testCase.shouldNavigate) {
          expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/');
        } else {
          expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
        }
        expect(mockCategoryService.setCategory).toHaveBeenCalledWith(testCase.category);
      });
    });

    it('should handle multiple category selections in sequence', () => {
      const categorySequence = ['New', 'T-shirts', 'Hoodies'];

      categorySequence.forEach(category => {
        component.selectCategory(category);
      });

      expect(mockCategoryService.setCategory).toHaveBeenCalledTimes(categorySequence.length);
      categorySequence.forEach(category => {
        expect(mockCategoryService.setCategory).toHaveBeenCalledWith(category);
      });
    });
  });
});
