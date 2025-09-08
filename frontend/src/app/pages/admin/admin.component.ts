import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../shared/interfaces/product.interface';
import { ProductService } from '../../shared/services/product.service';
import { CategoryService, Category } from '../../shared/services/category.service';
import { AuthService } from '../../shared/services/auth.service';
import { ImageUploadService } from '../../shared/services/image-upload.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  view: 'list' | 'add' | 'edit' = 'list';
  productForm: FormGroup;
  loading = false;
  error: string | null = null;
  private editId: number | null = null;

  // Image upload properties
  isUploadingMainImage = false;
  isUploadingCarouselImages: boolean[] = [];
  uploadProgress: { [key: string]: number } = {};

  // Search properties
  searchQuery = '';
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];

  constructor(
    readonly fb: FormBuilder,
    readonly productService: ProductService,
    readonly categoryService: CategoryService,
    readonly authService: AuthService,
    readonly toastr: ToastrService,
    readonly imageUploadService: ImageUploadService,
    readonly router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.pattern(/^(?!0+$)(?!0+\.0*$)\d+(\.\d{1,2})?$/)]],
      imageUrl: ['', Validators.required],
      carouselUrl: this.fb.array([]),
      description: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', Validators.required],
      stock: ['', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.min(0), Validators.max(9999)]]
    });
  }

  get carouselUrl() {
    return this.productForm.get('carouselUrl') as FormArray;
  }

  addImageUrl() {
    this.carouselUrl.push(this.fb.control('', Validators.required));
  }

  removeImageUrl(index: number) {
    if (index === 0) {
      return;
    }
    this.carouselUrl.removeAt(index);
  }

  ngOnInit(): void {
    console.log('AdminComponent initialized');
    this.loadProducts();
    this.loadCategories();
    this.checkSupabaseConfiguration();
  }

  private checkSupabaseConfiguration(): void {
    if (!this.imageUploadService.isSupabaseConfigured()) {
      console.warn('Supabase not configured for image uploads');
      // Don't show error toast, just log for now
    }
  }

  private loadCategories(): void {
    console.log('Loading categories...');
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories';
        this.toastr.error('Failed to load categories', 'Error');
      }
    });
  }

  private loadProducts(): void {
    console.log('Loading products...');
    this.loading = true;
    this.error = null;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.products = products;
        this.allProducts = [...products];
        this.filteredProducts = [...products];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products';
        this.toastr.error('Failed to load products', 'Error');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    console.log('Form submitted');
    console.log('Form valid:', this.productForm.valid);
    console.log('Form value:', this.productForm.value);
    console.log('Form errors:', this.getFormErrors());

    if (this.productForm.invalid) {
      console.log('Form is invalid, marking fields as touched to show errors');
      this.markFormGroupTouched();

      // Show specific error message
      const errors = this.getFormErrors();
      const errorMessages = [];

      if (errors.name) errorMessages.push('Product name is invalid');
      if (errors.price) errorMessages.push('Price is invalid');
      if (errors.categoryId) errorMessages.push('Category is required');
      if (errors.imageUrl) errorMessages.push('Main image URL is required');
      if (errors.description) errorMessages.push('Description is invalid');
      if (errors.stock) errorMessages.push('Stock quantity is invalid');
      if (errors.carouselUrl) errorMessages.push('Additional image URLs are invalid');

      const errorMessage = errorMessages.length > 0
        ? errorMessages.join(', ')
        : 'Please fill all required fields correctly';

      this.toastr.error(errorMessage, 'Form Validation Error');
      return;
    }

    this.loading = true;
    this.error = null;
    const formValue = this.productForm.value;

    // Build carousel URLs array starting with main image
    const carouselUrls = [formValue.imageUrl];
    if (formValue.carouselUrl && Array.isArray(formValue.carouselUrl)) {
      const additionalUrls = formValue.carouselUrl.filter((url: string) => url && url.trim() !== '' && url !== formValue.imageUrl);
      carouselUrls.push(...additionalUrls);
    }

    const productData = {
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      stock: Number(formValue.stock),
      imageUrl: formValue.imageUrl,
      carouselUrl: carouselUrls,
      categoryId: Number(formValue.categoryId)
    };

    console.log('Product data to send:', productData);

    if (this.view === 'add') {
      this.productService.createProduct(productData).subscribe({
        next: (result) => {
          console.log('Product created successfully:', result);
          this.toastr.success('Product created successfully', 'Success');
          this.loadProducts();
          this.cancel();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.error = 'Failed to create product: ' + (err.error?.message || err.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    } else if (this.view === 'edit' && this.editId !== null) {
      this.productService.updateProduct(this.editId, productData).subscribe({
        next: (result) => {
          console.log('Product updated successfully:', result);
          this.toastr.success('Product updated successfully', 'Success');
          this.loadProducts();
          this.cancel();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error updating product:', err);
          this.error = 'Failed to update product: ' + (err.error?.message || err.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    }
  }

  editProduct(product: Product): void {
    console.log('Editing product:', product);
    this.view = 'edit';
    this.editId = product.id;

    // Clear existing URLs
    while (this.carouselUrl.length) {
      this.carouselUrl.removeAt(0);
    }

    // Find categoryId by name
    const category = this.categories.find(cat => cat.name === product.category);
    const categoryId = category ? category.id : '';

    this.productForm.patchValue({
      name: product.name,
      price: product.price.toString(),
      imageUrl: product.imageUrl,
      description: product.description,
      categoryId: categoryId,
      stock: product.stock.toString()
    });

    // Add additional carousel URLs (skipping the imageUrl)
    if (product.carouselUrl && Array.isArray(product.carouselUrl)) {
      product.carouselUrl.forEach(url => {
        if (url && url !== product.imageUrl) {
          this.carouselUrl.push(this.fb.control(url, Validators.required));
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('Product deleted successfully', 'Success');
          this.loadProducts();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          this.error = 'Failed to delete product: ' + (err.error?.message || err.message || 'Unknown error');
          this.toastr.error(this.error, 'Error');
          this.loading = false;
        }
      });
    }
  }

    cancel(): void {
    this.view = 'list';
    this.editId = null;
    this.error = null;
    this.loading = false;
    this.resetForm();
  }

  private resetForm(): void {
    console.log('Resetting form');

    // Reset the form with default values
    this.productForm.reset({
      name: '',
      price: '',
      imageUrl: '',
      description: '',
      categoryId: '',
      stock: ''
    });

    // Clear carousel URLs
    while (this.carouselUrl.length) {
      this.carouselUrl.removeAt(0);
    }

    // Mark all fields as untouched to hide validation errors
    this.productForm.markAsUntouched();
    this.productForm.markAsPristine();

    // Also mark each control as untouched
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsUntouched();
          arrayControl.markAsPristine();
        });
      }
    });
  }

  setAddView(): void {
    console.log('Switching to add view');
    this.view = 'add';
    this.editId = null;
    this.error = null;
    this.loading = false;
    this.resetForm();
  }

  logout(): void {
    this.authService.clearAuthData();
    this.router.navigate(['/admin-login']);
    this.toastr.info('Admin logged out successfully', 'Logout');
  }

    private markFormGroupTouched(): void {
    console.log('Marking form as touched to show validation errors');

    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
      control?.markAsDirty();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
          arrayControl.markAsDirty();
        });
      }
    });

    // Force change detection to update UI
    setTimeout(() => {
      console.log('Form validation state after marking touched:', this.getFormErrors());
    }, 0);
  }

  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      if (control && !control.valid) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

    formatPriceInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Remove all non-digit and non-decimal characters
    value = value.replace(/[^0-9.]/g, '');

    // Remove leading zeros (except when followed by decimal point)
    value = value.replace(/^0+(?=\d)/, '');

    // If starts with decimal point, add leading zero
    if (value.startsWith('.')) {
      value = '0' + value;
    }

    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('').replace(/\./g, '');
    }

    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Limit maximum value (optional - adjust as needed)
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue > 99999.99) {
      value = '99999.99';
    }

    // Prevent empty value, default to empty for user convenience
    if (value === '0' && target.value !== '0.') {
      // Allow single 0, but not multiple leading zeros
    }

    // Update the input value and form control
    target.value = value;
    this.productForm.get('price')?.setValue(value, { emitEvent: false });
  }

  validatePrice(): void {
    const priceControl = this.productForm.get('price');
    const value = priceControl?.value;

    if (value) {
      const numericValue = parseFloat(value);
      if (numericValue <= 0) {
        priceControl?.setErrors({ min: true });
      } else if (numericValue > 99999.99) {
        priceControl?.setErrors({ max: true });
      }
    }
  }

  // Image upload methods
  async onMainImageSelected(event: Event): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate image
    const validation = this.imageUploadService.validateImage(file);
    if (!validation.valid) {
      this.toastr.error(validation.error!, 'Invalid Image');
      target.value = ''; // Clear input
      return;
    }

    try {
      this.isUploadingMainImage = true;
      console.log('Uploading main image...');

      const imageUrl = await this.imageUploadService.uploadImage(file, 'products');

      this.productForm.patchValue({ imageUrl });
      this.toastr.success('Main image uploaded successfully!', 'Success');

    } catch (error: any) {
      console.error('Error uploading main image:', error);
      this.toastr.error(error.message || 'Failed to upload image', 'Upload Error');
    } finally {
      this.isUploadingMainImage = false;
      target.value = ''; // Clear input for next selection
    }
  }

  async onCarouselImageSelected(event: Event, index: number): Promise<void> {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) return;

    // Validate image
    const validation = this.imageUploadService.validateImage(file);
    if (!validation.valid) {
      this.toastr.error(validation.error!, 'Invalid Image');
      target.value = ''; // Clear input
      return;
    }

    try {
      this.isUploadingCarouselImages[index] = true;
      console.log(`Uploading carousel image ${index}...`);

      const imageUrl = await this.imageUploadService.uploadImage(file, 'products');

      // Update the specific carousel URL control
      this.carouselUrl.at(index).setValue(imageUrl);
      this.toastr.success(`Carousel image ${index + 1} uploaded successfully!`, 'Success');

    } catch (error: any) {
      console.error(`Error uploading carousel image ${index}:`, error);
      this.toastr.error(error.message || 'Failed to upload image', 'Upload Error');
    } finally {
      this.isUploadingCarouselImages[index] = false;
      target.value = ''; // Clear input for next selection
    }
  }

  getImageFileName(url: string): string {
    if (!url) return '';
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.length > 30 ? fileName.substring(0, 30) + '...' : fileName;
  }

  hideImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  showImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'block';
  }

  get isSupabaseConfigured(): boolean {
    return this.imageUploadService.isSupabaseConfigured();
  }

  clearMainImage(): void {
    this.productForm.patchValue({ imageUrl: '' });
  }

  clearCarouselImage(index: number): void {
    this.carouselUrl.at(index).setValue('');
  }

  onPriceKeydown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    const target = event.target as HTMLInputElement;
    const value = target.value;

    // Allow control keys
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // Allow digits
    if (/\d/.test(event.key)) {
      return;
    }

    // Allow decimal point only if there isn't one already
    if (event.key === '.' && !value.includes('.')) {
      return;
    }

    // Block all other keys
    event.preventDefault();
  }

  formatStockInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value;

    // Remove all non-digit characters
    value = value.replace(/[^0-9]/g, '');

    // Remove leading zeros (except for single 0)
    value = value.replace(/^0+(?=\d)/, '');

    // If empty after cleaning, leave empty (don't force 0)
    if (value === '') {
      value = '';
    }

    // Limit to maximum value
    const numericValue = parseInt(value);
    if (!isNaN(numericValue) && numericValue > 9999) {
      value = '9999';
    }

    // Update the input value and form control
    target.value = value;
    this.productForm.get('stock')?.setValue(value, { emitEvent: false });
  }

  onStockKeydown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];

    // Allow control keys
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    // Allow digits only
    if (/\d/.test(event.key)) {
      return;
    }

    // Block all other keys
    event.preventDefault();
  }

  // Search methods
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = [...this.allProducts];
      this.products = [...this.allProducts];
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    this.filteredProducts = this.allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description?.toLowerCase() || '').includes(query) ||
      (product.category?.toLowerCase() || '').includes(query)
    );
    this.products = [...this.filteredProducts];
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredProducts = [...this.allProducts];
    this.products = [...this.allProducts];
  }
}
