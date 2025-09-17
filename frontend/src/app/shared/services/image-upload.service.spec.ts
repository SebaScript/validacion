import { TestBed } from '@angular/core/testing';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ImageUploadService } from './image-upload.service';
import { environment } from '../../../environments/environment';

// Mock Supabase client
const mockSupabaseClient = {
  storage: {
    from: jasmine.createSpy('from').and.returnValue({
      upload: jasmine.createSpy('upload'),
      getPublicUrl: jasmine.createSpy('getPublicUrl'),
      remove: jasmine.createSpy('remove')
    })
  }
};

// Mock Supabase for testing

describe('ImageUploadService', () => {
  let service: ImageUploadService;
  let mockCreateClient: jasmine.Spy;
  let consoleLogSpy: jasmine.Spy;
  let consoleWarnSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
  const mockUrl = 'https://supabase.co/storage/v1/object/public/images/products/test.jpg';

  beforeEach(() => {
    // Setup console spies
    consoleLogSpy = spyOn(console, 'log');
    consoleWarnSpy = spyOn(console, 'warn');
    consoleErrorSpy = spyOn(console, 'error');

    mockCreateClient = spyOn({ createClient }, 'createClient').and.returnValue(mockSupabaseClient as any);

    TestBed.configureTestingModule({
      providers: [ImageUploadService]
    });
  });

  afterEach(() => {
    mockCreateClient.calls.reset();
    consoleLogSpy.calls.reset();
    consoleWarnSpy.calls.reset();
    consoleErrorSpy.calls.reset();
  });

  describe('Service Creation and Initialization', () => {
    describe('with valid Supabase configuration', () => {
      beforeEach(() => {
        // Mock valid environment
        (environment as any).originalSupabaseUrl = environment.supabaseUrl;
        (environment as any).originalSupabaseKey = environment.supabaseKey;
        environment.supabaseUrl = 'https://test.supabase.co';
        environment.supabaseKey = 'valid-key';

        service = TestBed.inject(ImageUploadService);
      });

      afterEach(() => {
        // Restore original values
        environment.supabaseUrl = (environment as any).originalSupabaseUrl;
        environment.supabaseKey = (environment as any).originalSupabaseKey;
      });

      it('should be created', () => {
        expect(service).toBeTruthy();
      });

      it('should initialize Supabase client', () => {
        expect(mockCreateClient).toHaveBeenCalledWith('https://test.supabase.co', 'valid-key');
        expect(consoleLogSpy).toHaveBeenCalledWith('Supabase client initialized successfully');
        expect(service.isSupabaseConfigured()).toBe(true);
      });

      it('should provide correct configuration message', () => {
        expect(service.getConfigurationMessage()).toBe('Supabase is configured and ready for image uploads.');
      });
    });

    describe('with invalid Supabase configuration', () => {
      const originalEnvironment = {
        supabaseUrl: environment.supabaseUrl,
        supabaseKey: environment.supabaseKey
      };

      afterEach(() => {
        environment.supabaseUrl = originalEnvironment.supabaseUrl;
        environment.supabaseKey = originalEnvironment.supabaseKey;
      });

      it('should handle missing supabaseUrl', () => {
        environment.supabaseUrl = '';
        environment.supabaseKey = 'valid-key';

        service = TestBed.inject(ImageUploadService);

        expect(consoleWarnSpy).toHaveBeenCalledWith('Supabase not configured. Image upload functionality will be disabled.');
        expect(service.isSupabaseConfigured()).toBe(false);
      });

      it('should handle missing supabaseKey', () => {
        environment.supabaseUrl = 'https://test.supabase.co';
        environment.supabaseKey = '';

        service = TestBed.inject(ImageUploadService);

        expect(service.isSupabaseConfigured()).toBe(false);
      });

      it('should handle placeholder values', () => {
        environment.supabaseUrl = 'YOUR_SUPABASE_URL';
        environment.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

        service = TestBed.inject(ImageUploadService);

        expect(service.isSupabaseConfigured()).toBe(false);
      });

      it('should handle invalid URL format', () => {
        environment.supabaseUrl = 'invalid-url';
        environment.supabaseKey = 'valid-key';

        service = TestBed.inject(ImageUploadService);

        expect(service.isSupabaseConfigured()).toBe(false);
      });

      it('should provide correct configuration message when not configured', () => {
        environment.supabaseUrl = '';
        environment.supabaseKey = '';

        service = TestBed.inject(ImageUploadService);

        expect(service.getConfigurationMessage()).toBe('Image upload requires Supabase configuration. Please update your environment.ts file with valid Supabase credentials.');
      });
    });

    describe('with initialization errors', () => {
      const originalEnvironment = {
        supabaseUrl: environment.supabaseUrl,
        supabaseKey: environment.supabaseKey
      };

      afterEach(() => {
        environment.supabaseUrl = originalEnvironment.supabaseUrl;
        environment.supabaseKey = originalEnvironment.supabaseKey;
      });

      it('should handle createClient throwing error', () => {
        environment.supabaseUrl = 'https://test.supabase.co';
        environment.supabaseKey = 'valid-key';
        mockCreateClient.and.throwError(new Error('Network error'));

        service = TestBed.inject(ImageUploadService);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to initialize Supabase client:', jasmine.any(Error));
        expect(service.isSupabaseConfigured()).toBe(false);
      });
    });
  });

  describe('Image Validation', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should validate JPEG files', () => {
      const jpegFile = new File(['test'], 'test.jpeg', { type: 'image/jpeg' });
      const result = service.validateImage(jpegFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate JPG files', () => {
      const jpgFile = new File(['test'], 'test.jpg', { type: 'image/jpg' });
      const result = service.validateImage(jpgFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate PNG files', () => {
      const pngFile = new File(['test'], 'test.png', { type: 'image/png' });
      const result = service.validateImage(pngFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate WebP files', () => {
      const webpFile = new File(['test'], 'test.webp', { type: 'image/webp' });
      const result = service.validateImage(webpFile);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File(['test'], 'test.gif', { type: 'image/gif' });
      const result = service.validateImage(invalidFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should reject non-image file types', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = service.validateImage(textFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Only JPEG, PNG, and WebP images are allowed');
    });

    it('should reject files larger than 5MB', () => {
      // Create a file object with size > 5MB
      const largeFileContent = new ArrayBuffer(6 * 1024 * 1024); // 6MB
      const largeFile = new File([largeFileContent], 'large.jpg', { type: 'image/jpeg' });

      const result = service.validateImage(largeFile);

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Image size must be less than 5MB');
    });

    it('should accept files at size limit (5MB)', () => {
      const maxSizeContent = new ArrayBuffer(5 * 1024 * 1024); // Exactly 5MB
      const maxSizeFile = new File([maxSizeContent], 'max.jpg', { type: 'image/jpeg' });

      const result = service.validateImage(maxSizeFile);

      expect(result.valid).toBe(true);
    });

    it('should accept very small files', () => {
      const smallFile = new File([''], 'small.jpg', { type: 'image/jpeg' });
      const result = service.validateImage(smallFile);

      expect(result.valid).toBe(true);
    });

    it('should handle file with no extension', () => {
      const noExtFile = new File(['test'], 'noext', { type: 'image/jpeg' });
      const result = service.validateImage(noExtFile);

      expect(result.valid).toBe(true);
    });
  });

  describe('Single Image Upload', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should upload image successfully with default folder', async () => {
      const mockUploadResponse = { data: { path: 'products/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      const result = await service.uploadImage(mockFile);

      expect(result).toBe(mockUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('images');
      expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
        jasmine.stringMatching(/^products\/\d+-[a-z0-9]+\.jpg$/),
        mockFile,
        { cacheControl: '3600', upsert: false }
      );
    });

    it('should upload image successfully with custom folder', async () => {
      const mockUploadResponse = { data: { path: 'avatars/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      const result = await service.uploadImage(mockFile, 'avatars');

      expect(result).toBe(mockUrl);
      expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
        jasmine.stringMatching(/^avatars\/\d+-[a-z0-9]+\.jpg$/),
        mockFile,
        { cacheControl: '3600', upsert: false }
      );
    });

    it('should generate unique filenames', async () => {
      const mockUploadResponse = { data: { path: 'products/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      // Mock Date and Math.random to ensure unique filename generation
      const mockTime = 1234567890;
      const mockRandom = 'abc123';
      spyOn(Date.prototype, 'getTime').and.returnValue(mockTime);
      spyOn(Math, 'random').and.returnValue(0.5);
      spyOn(Math.random().toString(36), 'substring').and.returnValue(mockRandom);

      await service.uploadImage(mockFile);

      expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
        `products/${mockTime}-${mockRandom}.jpg`,
        mockFile,
        { cacheControl: '3600', upsert: false }
      );
    });

    it('should handle files without extension', async () => {
      const fileWithoutExt = new File(['test'], 'test', { type: 'image/jpeg' });
      const mockUploadResponse = { data: { path: 'products/test' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      const result = await service.uploadImage(fileWithoutExt);

      expect(result).toBe(mockUrl);
      expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledWith(
        jasmine.stringMatching(/^products\/\d+-[a-z0-9]+\.undefined$/),
        fileWithoutExt,
        { cacheControl: '3600', upsert: false }
      );
    });

    it('should throw error when Supabase is not configured', async () => {
      const originalUrl = environment.supabaseUrl;
      environment.supabaseUrl = '';
      const unconfiguredService = TestBed.inject(ImageUploadService);

      await expectAsync(unconfiguredService.uploadImage(mockFile))
        .toBeRejectedWithError('Supabase is not configured. Please set up your Supabase credentials in environment.ts');

      // Restore
      environment.supabaseUrl = originalUrl;
    });

    it('should handle upload errors', async () => {
      const uploadError = { message: 'Storage quota exceeded' };
      const mockUploadResponse = { data: null, error: uploadError };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));

      await expectAsync(service.uploadImage(mockFile))
        .toBeRejectedWithError('Upload failed: Storage quota exceeded');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error uploading image:', uploadError);
    });

    it('should handle network errors during upload', async () => {
      const networkError = new Error('Network error');
      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.reject(networkError));

      await expectAsync(service.uploadImage(mockFile))
        .toBeRejectedWith(networkError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in uploadImage:', networkError);
    });

    it('should log upload progress', async () => {
      const mockUploadResponse = { data: { path: 'products/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      await service.uploadImage(mockFile);

      expect(consoleLogSpy).toHaveBeenCalledWith('Uploading image:', jasmine.any(String));
      expect(consoleLogSpy).toHaveBeenCalledWith('Image uploaded successfully:', mockUrl);
    });
  });

  describe('Multiple Image Upload', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should upload multiple images successfully', async () => {
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      const files = [mockFile, file2];

      const mockUploadResponse1 = { data: { path: 'products/test1.jpg' }, error: null };
      const mockUploadResponse2 = { data: { path: 'products/test2.png' }, error: null };
      const mockUrlResponse1 = { data: { publicUrl: 'url1' } };
      const mockUrlResponse2 = { data: { publicUrl: 'url2' } };

      mockSupabaseClient.storage.from().upload
        .and.returnValues(
          Promise.resolve(mockUploadResponse1),
          Promise.resolve(mockUploadResponse2)
        );
      mockSupabaseClient.storage.from().getPublicUrl
        .and.returnValues(mockUrlResponse1, mockUrlResponse2);

      const result = await service.uploadMultipleImages(files);

      expect(result).toEqual(['url1', 'url2']);
      expect(mockSupabaseClient.storage.from().upload).toHaveBeenCalledTimes(2);
    });

    it('should upload multiple images with custom folder', async () => {
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      const files = [mockFile, file2];

      spyOn(service, 'uploadImage').and.returnValues(
        Promise.resolve('url1'),
        Promise.resolve('url2')
      );

      const result = await service.uploadMultipleImages(files, 'gallery');

      expect(result).toEqual(['url1', 'url2']);
      expect(service.uploadImage).toHaveBeenCalledWith(mockFile, 'gallery');
      expect(service.uploadImage).toHaveBeenCalledWith(file2, 'gallery');
    });

    it('should handle empty file array', async () => {
      const result = await service.uploadMultipleImages([]);

      expect(result).toEqual([]);
    });

    it('should handle single file in array', async () => {
      spyOn(service, 'uploadImage').and.returnValue(Promise.resolve('single-url'));

      const result = await service.uploadMultipleImages([mockFile]);

      expect(result).toEqual(['single-url']);
      expect(service.uploadImage).toHaveBeenCalledWith(mockFile, 'products');
    });

    it('should fail if any upload fails', async () => {
      const file2 = new File(['test2'], 'test2.png', { type: 'image/png' });
      const files = [mockFile, file2];

      const error = new Error('Upload failed');
      spyOn(service, 'uploadImage').and.returnValues(
        Promise.resolve('url1'),
        Promise.reject(error)
      );

      await expectAsync(service.uploadMultipleImages(files))
        .toBeRejectedWith(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error uploading multiple images:', error);
    });

    it('should handle FileList input', async () => {
      // Create a mock FileList
      const fileList = {
        0: mockFile,
        1: new File(['test2'], 'test2.png', { type: 'image/png' }),
        length: 2
      } as any as FileList;

      spyOn(service, 'uploadImage').and.returnValues(
        Promise.resolve('url1'),
        Promise.resolve('url2')
      );

      const result = await service.uploadMultipleImages(Array.from(fileList));

      expect(result).toEqual(['url1', 'url2']);
    });

    it('should handle large number of files', async () => {
      const manyFiles = Array.from({ length: 10 }, (_, i) =>
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );

      spyOn(service, 'uploadImage').and.returnValue(Promise.resolve('url'));

      const result = await service.uploadMultipleImages(manyFiles);

      expect(result.length).toBe(10);
      expect(result.every(url => url === 'url')).toBe(true);
      expect(service.uploadImage).toHaveBeenCalledTimes(10);
    });
  });

  describe('Image Deletion', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should delete image successfully', async () => {
      const mockDeleteResponse = { error: null };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await service.deleteImage(mockUrl);

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('images');
      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith(['products/test.jpg']);
      expect(consoleLogSpy).toHaveBeenCalledWith('Image deleted successfully:', 'products/test.jpg');
    });

    it('should extract file path correctly from complex URLs', async () => {
      const complexUrl = 'https://iheybhuvhgvobdrodkid.supabase.co/storage/v1/object/public/images/avatars/profile.png';
      const mockDeleteResponse = { error: null };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await service.deleteImage(complexUrl);

      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith(['avatars/profile.png']);
    });

    it('should handle URLs with query parameters', async () => {
      const urlWithQuery = 'https://test.supabase.co/storage/v1/object/public/images/products/test.jpg?version=1';
      const mockDeleteResponse = { error: null };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await service.deleteImage(urlWithQuery);

      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith(['products/test.jpg?version=1']);
    });

    it('should throw error when Supabase is not configured', async () => {
      const originalUrl = environment.supabaseUrl;
      environment.supabaseUrl = '';
      const unconfiguredService = TestBed.inject(ImageUploadService);

      await expectAsync(unconfiguredService.deleteImage(mockUrl))
        .toBeRejectedWithError('Supabase is not configured. Please set up your Supabase credentials in environment.ts');

      // Restore
      environment.supabaseUrl = originalUrl;
    });

    it('should handle delete errors', async () => {
      const deleteError = { message: 'File not found' };
      const mockDeleteResponse = { error: deleteError };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await expectAsync(service.deleteImage(mockUrl))
        .toBeRejectedWithError('Delete failed: File not found');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting image:', deleteError);
    });

    it('should handle network errors during delete', async () => {
      const networkError = new Error('Network timeout');
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.reject(networkError));

      await expectAsync(service.deleteImage(mockUrl))
        .toBeRejectedWith(networkError);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in deleteImage:', networkError);
    });

    it('should handle malformed URLs', async () => {
      const malformedUrl = 'not-a-valid-url';
      const mockDeleteResponse = { error: null };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await service.deleteImage(malformedUrl);

      // Should still attempt deletion with extracted path
      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalled();
    });

    it('should handle empty URL', async () => {
      const mockDeleteResponse = { error: null };
      mockSupabaseClient.storage.from().remove.and.returnValue(Promise.resolve(mockDeleteResponse));

      await service.deleteImage('');

      expect(mockSupabaseClient.storage.from().remove).toHaveBeenCalledWith(['']);
    });
  });

  describe('Configuration Status Methods', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should return true when configured', () => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);

      expect(service.isSupabaseConfigured()).toBe(true);
    });

    it('should return false when not configured', () => {
      environment.supabaseUrl = '';
      environment.supabaseKey = '';
      service = TestBed.inject(ImageUploadService);

      expect(service.isSupabaseConfigured()).toBe(false);
    });

    it('should provide configuration message for configured state', () => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);

      expect(service.getConfigurationMessage()).toBe('Supabase is configured and ready for image uploads.');
    });

    it('should provide configuration message for unconfigured state', () => {
      environment.supabaseUrl = '';
      environment.supabaseKey = '';
      service = TestBed.inject(ImageUploadService);

      expect(service.getConfigurationMessage()).toBe('Image upload requires Supabase configuration. Please update your environment.ts file with valid Supabase credentials.');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should handle file with special characters in name', async () => {
      const specialFile = new File(['test'], 'tëst (1) & spéciál.jpg', { type: 'image/jpeg' });
      const mockUploadResponse = { data: { path: 'products/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      const result = await service.uploadImage(specialFile);

      expect(result).toBe(mockUrl);
    });

    it('should handle very long file names', async () => {
      const longName = 'a'.repeat(200) + '.jpg';
      const longFile = new File(['test'], longName, { type: 'image/jpeg' });
      const mockUploadResponse = { data: { path: 'products/test.jpg' }, error: null };
      const mockUrlResponse = { data: { publicUrl: mockUrl } };

      mockSupabaseClient.storage.from().upload.and.returnValue(Promise.resolve(mockUploadResponse));
      mockSupabaseClient.storage.from().getPublicUrl.and.returnValue(mockUrlResponse);

      const result = await service.uploadImage(longFile);

      expect(result).toBe(mockUrl);
    });

    it('should handle zero-byte files', () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });
      const result = service.validateImage(emptyFile);

      expect(result.valid).toBe(true);
    });

    it('should handle concurrent uploads', async () => {
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

      spyOn(service, 'uploadImage').and.returnValues(
        Promise.resolve('url1'),
        Promise.resolve('url2')
      );

      const [result1, result2] = await Promise.all([
        service.uploadImage(file1),
        service.uploadImage(file2)
      ]);

      expect(result1).toBe('url1');
      expect(result2).toBe('url2');
    });

    it('should handle null file input to validation', () => {
      expect(() => service.validateImage(null as any)).toThrow();
    });

    it('should handle undefined file input to validation', () => {
      expect(() => service.validateImage(undefined as any)).toThrow();
    });

    it('should maintain state across multiple configuration checks', () => {
      expect(service.isSupabaseConfigured()).toBe(true);
      expect(service.isSupabaseConfigured()).toBe(true);
      expect(service.getConfigurationMessage()).toBe('Supabase is configured and ready for image uploads.');
      expect(service.getConfigurationMessage()).toBe('Supabase is configured and ready for image uploads.');
    });
  });

  describe('Performance and Memory Tests', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    beforeEach(() => {
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';
      service = TestBed.inject(ImageUploadService);
    });

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should validate many files quickly', () => {
      const files = Array.from({ length: 1000 }, (_, i) =>
        new File([`test${i}`], `test${i}.jpg`, { type: 'image/jpeg' })
      );

      const startTime = performance.now();
      const results = files.map(file => service.validateImage(file));
      const endTime = performance.now();

      expect(results.every(result => result.valid)).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    it('should not leak memory with multiple service instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(ImageUploadService));

      expect(services.length).toBe(100);
      expect(services.every(s => s.isSupabaseConfigured())).toBe(true);
    });

    it('should handle rapid validation calls', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      for (let i = 0; i < 1000; i++) {
        const result = service.validateImage(file);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('Integration with Environment Configuration', () => {
    const originalEnvironment = {
      supabaseUrl: environment.supabaseUrl,
      supabaseKey: environment.supabaseKey
    };

    afterEach(() => {
      environment.supabaseUrl = originalEnvironment.supabaseUrl;
      environment.supabaseKey = originalEnvironment.supabaseKey;
    });

    it('should handle environment changes', () => {
      // Initially configured
      environment.supabaseUrl = 'https://test.supabase.co';
      environment.supabaseKey = 'valid-key';

      const service1 = TestBed.inject(ImageUploadService);
      expect(service1.isSupabaseConfigured()).toBe(true);

      // Create new service with different config (simulating environment change)
      environment.supabaseUrl = '';
      environment.supabaseKey = '';

      const service2 = TestBed.inject(ImageUploadService);
      expect(service2.isSupabaseConfigured()).toBe(false);
    });

    it('should handle various URL formats', () => {
      const validUrls = [
        'https://test.supabase.co',
        'http://localhost:54321',
        'https://project.supabase.com'
      ];

      validUrls.forEach(url => {
            const origUrl = environment.supabaseUrl;
            const origKey = environment.supabaseKey;
            environment.supabaseUrl = url;
            environment.supabaseKey = 'valid-key';

        const testService = TestBed.inject(ImageUploadService);
        expect(testService.isSupabaseConfigured()).toBe(true);
      });
    });

    it('should reject invalid URL formats', () => {
      const invalidUrls = [
        'ftp://test.com',
        'test.supabase.co',
        'mailto:test@example.com'
      ];

      invalidUrls.forEach(url => {
            const origUrl = environment.supabaseUrl;
            const origKey = environment.supabaseKey;
            environment.supabaseUrl = url;
            environment.supabaseKey = 'valid-key';

        const testService = TestBed.inject(ImageUploadService);
        expect(testService.isSupabaseConfigured()).toBe(false);
      });
    });
  });
});
