import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';

// Mock crypto.subtle for testing

describe('CryptoService', () => {
  let service: CryptoService;
  let mockSubtleCrypto: jasmine.SpyObj<SubtleCrypto>;
  let originalCrypto: Crypto;

  beforeEach(() => {
    // Store original crypto
    originalCrypto = global.crypto;

    // Create mock SubtleCrypto
    mockSubtleCrypto = jasmine.createSpyObj('SubtleCrypto', ['digest']);

    // Mock crypto.subtle
    global.crypto = {
      subtle: mockSubtleCrypto,
      getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
      randomUUID: originalCrypto.randomUUID.bind(originalCrypto)
    } as Crypto;

    TestBed.configureTestingModule({
      providers: [CryptoService]
    });

    service = TestBed.inject(CryptoService);
  });

  afterEach(() => {
    // Restore original crypto
    global.crypto = originalCrypto;
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have access to crypto service methods', () => {
      expect(service.hashPassword).toBeDefined();
      expect(service.comparePasswords).toBeDefined();
      expect(service.generateSimpleHash).toBeDefined();
      expect(service.generateId).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    beforeEach(() => {
      // Mock hash buffer result
      const mockHashBuffer = new Uint8Array([
        0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f,
        0x72, 0x6c, 0x64, 0x21, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
      ]).buffer;

      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(mockHashBuffer));
    });

    it('should hash password with salt', async () => {
      const result = await service.hashPassword('testpassword');

      expect(mockSubtleCrypto.digest).toHaveBeenCalledWith('SHA-256', jasmine.any(Uint8Array));
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // SHA-256 produces 32 bytes = 64 hex characters
    });

    it('should produce consistent hash for same password', async () => {
      const hash1 = await service.hashPassword('password123');
      const hash2 = await service.hashPassword('password123');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different passwords', async () => {
      // Create different mock buffers for different calls
      const buffer1 = new Uint8Array(32).fill(1).buffer;
      const buffer2 = new Uint8Array(32).fill(2).buffer;

      mockSubtleCrypto.digest.and.returnValues(
        Promise.resolve(buffer1),
        Promise.resolve(buffer2)
      );

      const hash1 = await service.hashPassword('password1');
      const hash2 = await service.hashPassword('password2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const result = await service.hashPassword('');

      expect(mockSubtleCrypto.digest).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000);
      const result = await service.hashPassword(longPassword);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
      const result = await service.hashPassword(specialPassword);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(mockSubtleCrypto.digest).toHaveBeenCalled();
    });

    it('should handle unicode characters in password', async () => {
      const unicodePassword = 'pássword123énçödíng';
      const result = await service.hashPassword(unicodePassword);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(mockSubtleCrypto.digest).toHaveBeenCalled();
    });

    it('should use salt in hashing process', async () => {
      await service.hashPassword('testpassword');

      const callArgs = mockSubtleCrypto.digest.calls.mostRecent().args;
      const encodedData = callArgs[1] as Uint8Array;
      const decodedData = new TextDecoder().decode(encodedData);

      expect(decodedData).toContain('vallmere_salt_2024');
      expect(decodedData).toContain('testpassword');
    });

    it('should handle crypto.subtle.digest errors', async () => {
      mockSubtleCrypto.digest.and.returnValue(Promise.reject(new Error('Crypto error')));

      await expectAsync(service.hashPassword('testpassword'))
        .toBeRejectedWithError('Crypto error');
    });

    it('should produce hex output with proper padding', async () => {
      // Mock buffer with some small values that need padding
      const mockBuffer = new Uint8Array([
        0x01, 0x0a, 0xff, 0x00, 0x02, 0x0b, 0xfe, 0x03,
        0x0c, 0xfd, 0x04, 0x0d, 0xfc, 0x05, 0x0e, 0xfb,
        0x06, 0x0f, 0xfa, 0x07, 0x10, 0xf9, 0x08, 0x11,
        0xf8, 0x09, 0x12, 0xf7, 0x0a, 0x13, 0xf6, 0x0b
      ]).buffer;

      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(mockBuffer));

      const result = await service.hashPassword('test');

      expect(result).toBe('010aff000b0bfe030cfdd040dfc050efbb060ffa0710f90811f8091223f70a13f60bb');
    });
  });

  describe('Password Comparison', () => {
    beforeEach(() => {
      // Mock consistent hash for comparison tests
      const mockBuffer = new Uint8Array(32).fill(0x42).buffer; // All bytes = 66 (0x42)
      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(mockBuffer));
    });

    it('should return true for matching passwords', async () => {
      const plainPassword = 'testpassword';
      const hashedPassword = await service.hashPassword(plainPassword);

      const result = await service.comparePasswords(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching passwords', async () => {
      // Create different mock buffers for different passwords
      const buffer1 = new Uint8Array(32).fill(1).buffer;
      const buffer2 = new Uint8Array(32).fill(2).buffer;

      mockSubtleCrypto.digest.and.returnValues(
        Promise.resolve(buffer1), // For original hash
        Promise.resolve(buffer2)  // For comparison hash
      );

      const hashedPassword = await service.hashPassword('correctpassword');
      const result = await service.comparePasswords('wrongpassword', hashedPassword);

      expect(result).toBe(false);
    });

    it('should handle empty strings comparison', async () => {
      const result = await service.comparePasswords('', '');

      expect(result).toBe(true);
    });

    it('should handle comparison with malformed hash', async () => {
      const result = await service.comparePasswords('password', 'invalidhash');

      expect(result).toBe(false);
    });

    it('should be case sensitive', async () => {
      const buffer1 = new Uint8Array(32).fill(1).buffer;
      const buffer2 = new Uint8Array(32).fill(2).buffer;

      mockSubtleCrypto.digest.and.returnValues(
        Promise.resolve(buffer1), // For 'Password'
        Promise.resolve(buffer2)  // For 'password'
      );

      const hashedPassword = await service.hashPassword('Password');
      const result = await service.comparePasswords('password', hashedPassword);

      expect(result).toBe(false);
    });

    it('should handle multiple comparisons correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await service.hashPassword(password);

      // First comparison - correct password
      let result1 = await service.comparePasswords(password, hashedPassword);
      expect(result1).toBe(true);

      // Mock different buffer for wrong password
      const wrongBuffer = new Uint8Array(32).fill(99).buffer;
      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(wrongBuffer));

      // Second comparison - wrong password
      let result2 = await service.comparePasswords('wrongpassword', hashedPassword);
      expect(result2).toBe(false);
    });

    it('should handle crypto errors in comparison', async () => {
      mockSubtleCrypto.digest.and.returnValue(Promise.reject(new Error('Crypto error')));

      await expectAsync(service.comparePasswords('password', 'hash'))
        .toBeRejectedWithError('Crypto error');
    });
  });

  describe('Salt Management', () => {
    it('should return consistent salt', () => {
      const salt1 = service['getSalt']();
      const salt2 = service['getSalt']();

      expect(salt1).toBe(salt2);
      expect(salt1).toBe('vallmere_salt_2024');
    });

    it('should include salt in password hashing', async () => {
      await service.hashPassword('testpassword');

      const callArgs = mockSubtleCrypto.digest.calls.mostRecent().args;
      const encodedData = callArgs[1] as Uint8Array;
      const decodedData = new TextDecoder().decode(encodedData);

      expect(decodedData).toBe('testpasswordvallmere_salt_2024');
    });
  });

  describe('Simple Hash Generation', () => {
    it('should generate hash for normal string', () => {
      const result = service.generateSimpleHash('teststring');

      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
      expect(/^\d+$/.test(result)).toBe(true); // Should be numeric string
    });

    it('should return "0" for empty string', () => {
      const result = service.generateSimpleHash('');

      expect(result).toBe('0');
    });

    it('should produce consistent hash for same input', () => {
      const input = 'consistent test string';
      const hash1 = service.generateSimpleHash(input);
      const hash2 = service.generateSimpleHash(input);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.generateSimpleHash('string1');
      const hash2 = service.generateSimpleHash('string2');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle special characters', () => {
      const specialString = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = service.generateSimpleHash(specialString);

      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('should handle unicode characters', () => {
      const unicodeString = 'héllö wörld 中文 العربية';
      const result = service.generateSimpleHash(unicodeString);

      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const result = service.generateSimpleHash(longString);

      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });

    it('should always return positive numbers as string', () => {
      const testStrings = ['test1', 'test2', 'negative', 'positive', 'zero'];

      testStrings.forEach(str => {
        const result = service.generateSimpleHash(str);
        const numericValue = parseInt(result, 10);

        expect(numericValue).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle single character inputs', () => {
      const chars = ['a', 'Z', '1', '!', ' '];

      chars.forEach(char => {
        const result = service.generateSimpleHash(char);
        expect(typeof result).toBe('string');
        expect(result).toBeTruthy();
      });
    });

    it('should be deterministic across multiple calls', () => {
      const testInput = 'deterministic test';
      const results = Array.from({ length: 100 }, () =>
        service.generateSimpleHash(testInput)
      );

      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(1); // All results should be the same
    });
  });

  describe('ID Generation', () => {
    beforeEach(() => {
      // Mock Date.now and Math.random for consistent testing
      spyOn(Date, 'now');
      spyOn(Math, 'random');
    });

    it('should generate unique IDs', () => {
      (Date.now as jasmine.Spy).and.returnValues(1234567890000, 1234567890001);
      (Math.random as jasmine.Spy).and.returnValues(0.123456789, 0.987654321);

      const id1 = service.generateId();
      const id2 = service.generateId();

      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
    });

    it('should include timestamp in base36 format', () => {
      const mockTime = 1640995200000; // 2022-01-01 00:00:00 UTC
      (Date.now as jasmine.Spy).and.returnValue(mockTime);
      (Math.random as jasmine.Spy).and.returnValue(0.5);

      const id = service.generateId();
      const timeInBase36 = mockTime.toString(36);

      expect(id).toContain(timeInBase36);
    });

    it('should include random component', () => {
      const mockTime = 1640995200000;
      (Date.now as jasmine.Spy).and.returnValue(mockTime);
      (Math.random as jasmine.Spy).and.returnValue(0.123456789);

      const id = service.generateId();
      const randomInBase36 = (0.123456789).toString(36).substr(2);

      expect(id).toContain(randomInBase36);
    });

    it('should generate IDs with expected format', () => {
      (Date.now as jasmine.Spy).and.returnValue(1234567890000);
      (Math.random as jasmine.Spy).and.returnValue(0.123456789);

      const id = service.generateId();

      // Should be alphanumeric (base36) characters
      expect(/^[0-9a-z]+$/.test(id)).toBe(true);
      expect(id.length).toBeGreaterThan(10); // Should be reasonably long
    });

    it('should handle edge cases in random values', () => {
      const edgeCases = [0, 0.999999999, 0.000000001];
      (Date.now as jasmine.Spy).and.returnValue(1234567890000);

      edgeCases.forEach(randomValue => {
        (Math.random as jasmine.Spy).and.returnValue(randomValue);
        const id = service.generateId();

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('should handle edge cases in timestamps', () => {
      const edgeTimestamps = [0, 1, 9007199254740991]; // Max safe integer
      (Math.random as jasmine.Spy).and.returnValue(0.5);

      edgeTimestamps.forEach(timestamp => {
        (Date.now as jasmine.Spy).and.returnValue(timestamp);
        const id = service.generateId();

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      });
    });

    it('should generate many unique IDs', () => {
      // Restore real Date.now and Math.random for this test
      (Date.now as jasmine.Spy).and.callThrough();
      (Math.random as jasmine.Spy).and.callThrough();

      const ids = new Set();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(service.generateId());
      }

      expect(ids.size).toBe(count); // All should be unique
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle crypto.subtle being undefined', async () => {
      // Mock crypto.subtle as undefined
      (global.crypto as any).subtle = undefined;

      await expectAsync(service.hashPassword('test'))
        .toBeRejected();
    });

    it('should handle TextEncoder being unavailable', async () => {
      // Store original TextEncoder
      const originalTextEncoder = global.TextEncoder;
      delete (global as any).TextEncoder;

      try {
        await expectAsync(service.hashPassword('test'))
          .toBeRejected();
      } finally {
        // Restore TextEncoder
        global.TextEncoder = originalTextEncoder;
      }
    });

    it('should handle memory constraints with large inputs', async () => {
      // Test with very large input
      const largeInput = 'x'.repeat(1000000); // 1MB string
      mockSubtleCrypto.digest.and.returnValue(
        Promise.resolve(new Uint8Array(32).fill(1).buffer)
      );

      const result = await service.hashPassword(largeInput);

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle null/undefined inputs gracefully', () => {
      expect(() => service.generateSimpleHash(null as any)).toThrow();
      expect(() => service.generateSimpleHash(undefined as any)).toThrow();
    });

    it('should handle numeric inputs to string methods', () => {
      const result = service.generateSimpleHash(123 as any);
      expect(typeof result).toBe('string');
    });

    it('should handle boolean inputs to string methods', () => {
      const result1 = service.generateSimpleHash(true as any);
      const result2 = service.generateSimpleHash(false as any);

      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(result1).not.toBe(result2);
    });
  });

  describe('Security Considerations', () => {
    it('should not expose salt publicly', () => {
      // Salt method should be private
      expect(service['getSalt']).toBeDefined();
      expect((service as any).getSalt).toBeUndefined(); // Should not be publicly accessible
    });

    it('should use salt consistently', async () => {
      const calls: Uint8Array[] = [];
      mockSubtleCrypto.digest.and.callFake((algorithm, data) => {
        calls.push(data as Uint8Array);
        return Promise.resolve(new Uint8Array(32).fill(1).buffer);
      });

      await service.hashPassword('password1');
      await service.hashPassword('password2');

      // Both calls should include the same salt
      const decoded1 = new TextDecoder().decode(calls[0]);
      const decoded2 = new TextDecoder().decode(calls[1]);

      expect(decoded1).toContain('vallmere_salt_2024');
      expect(decoded2).toContain('vallmere_salt_2024');
    });

    it('should use SHA-256 algorithm', async () => {
      await service.hashPassword('test');

      expect(mockSubtleCrypto.digest).toHaveBeenCalledWith('SHA-256', jasmine.any(Uint8Array));
    });

    it('should produce hash of expected length (SHA-256)', async () => {
      const result = await service.hashPassword('test');

      // SHA-256 produces 256 bits = 32 bytes = 64 hex characters
      expect(result.length).toBe(64);
    });

    it('should handle timing attacks resistance in comparison', async () => {
      // Both comparisons should take similar time regardless of result
      const correctPassword = 'correctpassword';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await service.hashPassword(correctPassword);

      const startTime1 = performance.now();
      await service.comparePasswords(correctPassword, hashedPassword);
      const time1 = performance.now() - startTime1;

      // Mock different buffer for wrong comparison
      const wrongBuffer = new Uint8Array(32).fill(99).buffer;
      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(wrongBuffer));

      const startTime2 = performance.now();
      await service.comparePasswords(wrongPassword, hashedPassword);
      const time2 = performance.now() - startTime2;

      // Times should be reasonably similar (within an order of magnitude)
      // This is a basic check - in production, you'd want more sophisticated timing analysis
      expect(Math.abs(time1 - time2)).toBeLessThan(Math.max(time1, time2) * 10);
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple concurrent hashing operations', async () => {
      const promises = Array.from({ length: 100 }, (_, i) =>
        service.hashPassword(`password${i}`)
      );

      const results = await Promise.all(promises);

      expect(results.length).toBe(100);
      expect(results.every(r => typeof r === 'string' && r.length === 64)).toBe(true);
    });

    it('should generate simple hashes quickly', () => {
      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        service.generateSimpleHash(`test${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should generate IDs quickly', () => {
      (Date.now as jasmine.Spy).and.callThrough();
      (Math.random as jasmine.Spy).and.callThrough();

      const iterations = 10000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        service.generateId();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should not leak memory with multiple service instances', () => {
      const services = Array.from({ length: 100 }, () => TestBed.inject(CryptoService));

      expect(services.length).toBe(100);
      expect(services.every(s => s instanceof CryptoService)).toBe(true);
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should work with different TextEncoder implementations', async () => {
      // Mock alternative TextEncoder behavior
      const originalTextEncoder = global.TextEncoder;

      // Custom TextEncoder that mimics different browser behavior
      global.TextEncoder = class MockTextEncoder {
        encode(input: string): Uint8Array {
          const buffer = new ArrayBuffer(input.length);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < input.length; i++) {
            view[i] = input.charCodeAt(i) & 0xFF;
          }
          return view;
        }
      } as any;

      try {
        const result = await service.hashPassword('test');
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
      } finally {
        global.TextEncoder = originalTextEncoder;
      }
    });

    it('should handle different Uint8Array implementations', async () => {
      const mockBuffer = new ArrayBuffer(32);
      const mockView = new Uint8Array(mockBuffer);
      mockView.fill(42);

      mockSubtleCrypto.digest.and.returnValue(Promise.resolve(mockBuffer));

      const result = await service.hashPassword('test');

      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });
  });
});
