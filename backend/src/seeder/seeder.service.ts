import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ProductService } from '../product/product.service';
import { CategoryService } from '../category/category.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  async onModuleInit() {
    this.logger.log('Seeding database...');
    await this.seedCategories();
    await this.seedAdmin();
    await this.seedProducts();
    this.logger.log('Database seeding completed');
  }

  private async seedCategories() {
    const categories = [
      { name: 'T-shirts' },
      { name: 'Hoodies' },
      { name: 'Bottoms' },
      { name: 'Hats' },
      { name: 'Accesories' },
    ];

    try {
      // Check if categories already exist
      const existingCategories = await this.categoryService.findAll();
      if (existingCategories.length === 0) {
        for (const category of categories) {
          await this.categoryService.create(category);
          this.logger.log(`Created category: ${category.name}`);
        }
      } else {
        this.logger.log('Categories already exist, skipping seed');
      }
    } catch (error) {
      this.logger.error('Error seeding categories:', error);
    }
  }

  private async seedAdmin() {
    try {
      // Try to find admin by email
      try {
        const existingAdmin = await this.userService.findByEmail('admin@example.com');
        
        if (existingAdmin.password === 'admin') {
          await this.userService.update(existingAdmin.userId, {
            password: 'admin123'
          });
          this.logger.log('Updated admin password to encrypted version');
        } else {
          this.logger.log('Admin user already exists with encrypted password, skipping seed');
        }
      } catch (error) {

        const admin = await this.userService.create({
          name: 'Admin',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin',
        });
        this.logger.log(`Created admin user: ${admin.email}`);
      }
    } catch (error) {
      this.logger.error('Error seeding admin user:', error);
    }
  }

  private async seedProducts() {
    try {
      // Check if products already exist
      const existingProducts = await this.productService.findAll();
      if (existingProducts.length > 0) {
        this.logger.log('Products already exist, skipping seed');
        return;
      }

      // Get categories to link to products
      const categories = await this.categoryService.findAll();
      if (categories.length === 0) {
        this.logger.error('No categories found, cannot seed products');
        return;
      }

      // Create category map for easy lookup
      const categoryMap = new Map(
        categories.map(category => [category.name, category.categoryId])
      );

      // Get default category ID to use as fallback
      const defaultCategoryId = categories[0].categoryId;

      const products = [
        {
          name: 'Allstarz Sunglasses',
          description: 'Stylish sunglasses for all occasions.',
          categoryId: categoryMap.get('Accesories') || defaultCategoryId,
          stock: 10,
          price: 49.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_02.png?v=1726478831',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_02.png?v=1726478831',
            'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_03.png?v=1726478840&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/Sunglasses_Yellow_01.png?v=1726478849&width=1024',
          ]
        },
        {
          name: 'Allstarz Socks',
          description: 'Stylish and comfortable socks for everyday use.',
          categoryId: categoryMap.get('Bottoms') || defaultCategoryId,
          stock: 10,
          price: 29.99,
          image: 'https://www.crtz.xyz/cdn/shop/products/image_8d6da066-54b2-4388-927b-d5e1a5da5cec.png?v=1679066389',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/products/image_8d6da066-54b2-4388-927b-d5e1a5da5cec.png?v=1679066389',
            'https://www.crtz.xyz/cdn/shop/products/image_7aa9657c-255e-4f29-9778-12102be696e2.png?v=1679066415&width=1024',
          ]
        },
        {
          name: 'Allstarz Contrast Hoodie',
          description: 'Warm and stylish hoodie for cooler days.',
          categoryId: categoryMap.get('Hoodies') || defaultCategoryId,
          stock: 10,
          price: 69.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/95RTWContstrastHoodie_BlackYellow_01.png?v=1741944335',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/95RTWContstrastHoodie_BlackYellow_01.png?v=1741944335'
          ]
        },
        {
          name: 'Premium Allstarz Trucker Cap',
          description: 'Stylish cap for sun protection and fashion.',
          categoryId: categoryMap.get('Hats') || defaultCategoryId,
          stock: 10,
          price: 19.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/CRTZTruckerCap_BlackYellow_01_1.png?v=1702917901',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/CRTZTruckerCap_BlackYellow_01_1.png?v=1702917901',
            'https://www.crtz.xyz/cdn/shop/files/CRTZTruckerCap_BlackYellow_02.png?v=1702917901&width=1024',
          ]
        },
        {
          name: 'Nike Allstarz',
          description: 'Premium Nike shoes for sports and casual wear.',
          categoryId: categoryMap.get('Bottoms') || defaultCategoryId,
          stock: 10,
          price: 179.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_E_1X1_7b4d2a11-dfc1-455a-b02b-a682a1b6237f.png?v=1743515541',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_E_1X1_7b4d2a11-dfc1-455a-b02b-a682a1b6237f.png?v=1743515541',
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_D_1X1_8af76b72-5051-471f-acf3-5d1034ba27c9.png?v=1743515541&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_9Y_1X1_0c77c57d-5542-4361-8ced-c6cee8ab0df8.png?v=1743515541&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_F_1X1_1bc7058d-53cf-434e-bcc3-a46f72a721ef.png?v=1743515541&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_H_1X1_452b8087-70f0-4fb1-8045-c5ec34f2c359.png?v=1743515541&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/FB2709-003_400730681_D_K_1X1_01ae8df4-27f2-4521-8565-3bd27316a1d4.png?v=1743515541&width=1024'
          ]
        },
        {
          name: 'Black Allstarz Cap',
          description: 'Classic black cap for everyday wear.',
          categoryId: categoryMap.get('Hats') || defaultCategoryId,
          stock: 10,
          price: 19.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/LiteworkCap_Black_01.png?v=1738230492',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/LiteworkCap_Black_01.png?v=1738230492'
          ]
        },
        {
          name: 'Mesh RTW Shorts',
          description: 'Breathable mesh shorts for active lifestyles.',
          categoryId: categoryMap.get('Bottoms') || defaultCategoryId,
          stock: 10,
          price: 29.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/RTWMESHSHORTS_BLACK_01.png?v=1721727314',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/RTWMESHSHORTS_BLACK_01.png?v=1721727314',
            'https://www.crtz.xyz/cdn/shop/files/RTWMESHSHORTS_BLACK_02.png?v=1741189744&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/RTWMESHSHORTS_BLACK_03.png?v=1741189744&width=1024'
          ]
        },
        {
          name: 'Reversible 95 Men Shirt',
          description: 'Versatile reversible shirt for multiple looks.',
          categoryId: categoryMap.get('T-shirts') || defaultCategoryId,
          stock: 10,
          price: 69.99,
          image: 'https://www.crtz.xyz/cdn/shop/files/jerseydouble.png?v=1745928740',
          carouselImages: [
            'https://www.crtz.xyz/cdn/shop/files/jerseydouble.png?v=1745928740',
            'https://www.crtz.xyz/cdn/shop/files/95RevesibleMeshJersey_BlackYellow_01.png?v=1745928740&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/95RevesibleMeshJersey_BlackYellow_02.png?v=1745928740&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/95RevesibleMeshJersey_BlackYellow_03.png?v=1745928740&width=1024',
            'https://www.crtz.xyz/cdn/shop/files/95RevesibleMeshJersey_BlackYellow_04.png?v=1745928740&width=1024'
          ]
        },
      ];

      for (const product of products) {
        await this.productService.create(product);
        this.logger.log(`Created product: ${product.name}`);
      }
    } catch (error) {
      this.logger.error('Error seeding products:', error);
    }
  }
} 