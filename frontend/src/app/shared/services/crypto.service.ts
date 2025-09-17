import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + this.getSalt());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const hashedPlainPassword = await this.hashPassword(plainPassword);
    return hashedPlainPassword === hashedPassword;
  }

  private getSalt(): string {
    // Simple salt for demonstration - in production you'd want proper salt management
    return 'vallmere_salt_2024';
  }

  // Generate a simple hash for demonstration purposes
  generateSimpleHash(input: string): string {
    let hash = 0;
    if (input.length === 0) return hash.toString();
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  // Generate a random ID for entities
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
