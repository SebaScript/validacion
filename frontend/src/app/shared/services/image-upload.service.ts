import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private supabase: SupabaseClient | null = null;
  private isConfigured = false;

  constructor() {
    this.initializeSupabase();
  }

  private initializeSupabase(): void {
    try {
      // Check if Supabase credentials are properly configured
      if (this.isValidSupabaseConfig()) {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseKey
        );
        this.isConfigured = true;
        console.log('Supabase client initialized successfully');
      } else {
        console.warn('Supabase not configured. Image upload functionality will be disabled.');
        this.isConfigured = false;
      }
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      this.isConfigured = false;
    }
  }

  private isValidSupabaseConfig(): boolean {
    return !!(
      environment.supabaseUrl &&
      environment.supabaseKey &&
      environment.supabaseUrl !== 'YOUR_SUPABASE_URL' &&
      environment.supabaseKey !== 'YOUR_SUPABASE_ANON_KEY' &&
      environment.supabaseUrl.startsWith('http')
    );
  }

  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    if (!this.isConfigured || !this.supabase) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials in environment.ts');
    }

    try {
      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      console.log('Uploading image:', fileName);

      // Upload file to Supabase Storage
      const { error } = await this.supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully:', publicUrl);
      return publicUrl;

    } catch (error) {
      console.error('Error in uploadImage:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files: File[], folder: string = 'products'): Promise<string[]> {
    try {
      const uploadPromises = Array.from(files).map(file => this.uploadImage(file, folder));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  async deleteImage(url: string): Promise<void> {
    if (!this.isConfigured || !this.supabase) {
      throw new Error('Supabase is not configured. Please set up your Supabase credentials in environment.ts');
    }

    try {
      // Extract file path from URL
      const urlParts = url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // folder/filename

      const { error } = await this.supabase.storage
        .from('images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('Image deleted successfully:', filePath);
    } catch (error) {
      console.error('Error in deleteImage:', error);
      throw error;
    }
  }

  // Validate file type and size
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, and WebP images are allowed'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { valid: true };
  }

  // Check if Supabase is properly configured
  isSupabaseConfigured(): boolean {
    return this.isConfigured;
  }

  getConfigurationMessage(): string {
    if (this.isConfigured) {
      return 'Supabase is configured and ready for image uploads.';
    }
    return 'Image upload requires Supabase configuration. Please update your environment.ts file with valid Supabase credentials.';
  }
}
