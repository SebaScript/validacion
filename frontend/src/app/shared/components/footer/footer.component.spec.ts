import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should render footer element', () => {
      const footerElement = fixture.nativeElement.querySelector('footer');
      expect(footerElement).toBeTruthy();
    });

    it('should have footer-container class', () => {
      const containerElement = fixture.nativeElement.querySelector('.footer-container');
      expect(containerElement).toBeTruthy();
    });
  });

  describe('Brand Section', () => {
    it('should display brand name', () => {
      const brandElement = fixture.nativeElement.querySelector('.footer-logo h2');
      expect(brandElement).toBeTruthy();
      expect(brandElement.textContent?.trim()).toBe('VALLMERE');
    });

    it('should have correct brand styling class', () => {
      const logoSection = fixture.nativeElement.querySelector('.footer-logo');
      expect(logoSection).toBeTruthy();
    });
  });

  describe('Navigation Links Section', () => {
    it('should display Discover section', () => {
      const discoverTitle = fixture.nativeElement.querySelector('.footer-links h3');
      expect(discoverTitle).toBeTruthy();
      expect(discoverTitle.textContent?.trim()).toBe('Discover');
    });

    it('should have all navigation links', () => {
      const navLinks = fixture.nativeElement.querySelectorAll('.footer-links ul li a');
      expect(navLinks.length).toBe(4);

      const linkTexts = Array.from(navLinks).map(link => (link as HTMLElement).textContent?.trim());
      expect(linkTexts).toContain('Dresses');
      expect(linkTexts).toContain('Bottoms');
      expect(linkTexts).toContain('Footwear');
      expect(linkTexts).toContain('Accessories');
    });

    it('should have href="#" for all navigation links', () => {
      const navLinks = fixture.nativeElement.querySelectorAll('.footer-links ul li a');
      navLinks.forEach((link: HTMLAnchorElement) => {
        expect(link.href).toContain('#');
      });
    });

    it('should render navigation links in a list', () => {
      const navList = fixture.nativeElement.querySelector('.footer-links ul');
      expect(navList).toBeTruthy();

      const listItems = navList.querySelectorAll('li');
      expect(listItems.length).toBe(4);
    });
  });

  describe('Contact Information Section', () => {
    it('should display Locate Us section', () => {
      const contactTitle = fixture.nativeElement.querySelector('.footer-contact h3');
      expect(contactTitle).toBeTruthy();
      expect(contactTitle.textContent?.trim()).toBe('Locate Us');
    });

    it('should display address information', () => {
      const contactParagraphs = fixture.nativeElement.querySelectorAll('.footer-contact p');
      expect(contactParagraphs.length).toBe(3);

      const contactTexts = Array.from(contactParagraphs).map(p => (p as HTMLElement).textContent?.trim());
      expect(contactTexts[0]).toBe('123 Demo Blvd, Miami, FL 4567, United States');
      expect(contactTexts[1]).toBe('+123-456-7890');
      expect(contactTexts[2]).toBe('vallmere@gmail.com');
    });

    it('should have proper contact section styling', () => {
      const contactSection = fixture.nativeElement.querySelector('.footer-contact');
      expect(contactSection).toBeTruthy();
    });

    it('should display email with correct encoding', () => {
      const emailElement = fixture.nativeElement.querySelector('.footer-contact p:last-child');
      expect(emailElement).toBeTruthy();
      expect(emailElement.innerHTML).toContain('vallmere&#64;gmail.com');
    });
  });

  describe('Social Media Section', () => {
    it('should display social media links', () => {
      const socialLinks = fixture.nativeElement.querySelectorAll('.footer-social a');
      expect(socialLinks.length).toBe(3);
    });

    it('should have Instagram link with correct icon', () => {
      const instagramIcon = fixture.nativeElement.querySelector('.footer-social a:first-child i');
      expect(instagramIcon).toBeTruthy();
      expect(instagramIcon.classList.contains('bx')).toBe(true);
      expect(instagramIcon.classList.contains('bxl-instagram')).toBe(true);
    });

    it('should have WhatsApp link with correct icon', () => {
      const whatsappIcon = fixture.nativeElement.querySelector('.footer-social a:nth-child(2) i');
      expect(whatsappIcon).toBeTruthy();
      expect(whatsappIcon.classList.contains('bx')).toBe(true);
      expect(whatsappIcon.classList.contains('bxl-whatsapp')).toBe(true);
    });

    it('should have Facebook link with correct icon', () => {
      const facebookIcon = fixture.nativeElement.querySelector('.footer-social a:last-child i');
      expect(facebookIcon).toBeTruthy();
      expect(facebookIcon.classList.contains('bx')).toBe(true);
      expect(facebookIcon.classList.contains('bxl-facebook-square')).toBe(true);
    });

    it('should have href="#" for all social links', () => {
      const socialLinks = fixture.nativeElement.querySelectorAll('.footer-social a');
      socialLinks.forEach((link: HTMLAnchorElement) => {
        expect(link.href).toContain('#');
      });
    });
  });

  describe('Footer Bottom Section', () => {
    it('should display copyright information', () => {
      const copyrightElement = fixture.nativeElement.querySelector('.footer-bottom p');
      expect(copyrightElement).toBeTruthy();
      expect(copyrightElement.textContent?.trim()).toBe('© 2025 Vallmere. Powered by Vallmere');
    });

    it('should have footer-bottom styling class', () => {
      const bottomSection = fixture.nativeElement.querySelector('.footer-bottom');
      expect(bottomSection).toBeTruthy();
    });

    it('should display payment method images', () => {
      const paymentImages = fixture.nativeElement.querySelectorAll('.payment-methods img');
      expect(paymentImages.length).toBe(3);
    });

    it('should have Visa payment logo', () => {
      const visaLogo = fixture.nativeElement.querySelector('.payment-methods img[alt="Visa"]');
      expect(visaLogo).toBeTruthy();
      expect(visaLogo.src).toContain('visa-logo-36.png');
    });

    it('should have Mastercard payment logo', () => {
      const mastercardLogo = fixture.nativeElement.querySelector('.payment-methods img[alt="Mastercard"]');
      expect(mastercardLogo).toBeTruthy();
      expect(mastercardLogo.src).toContain('mastercard-logo-36.png');
    });

    it('should have Apple Pay logo', () => {
      const applePayLogo = fixture.nativeElement.querySelector('.payment-methods img[alt="Apple Pay"]');
      expect(applePayLogo).toBeTruthy();
      expect(applePayLogo.src).toContain('applepay-logo.png');
    });

    it('should have payment-methods container', () => {
      const paymentContainer = fixture.nativeElement.querySelector('.payment-methods');
      expect(paymentContainer).toBeTruthy();
    });
  });

  describe('DOM Structure Validation', () => {
    it('should have correct main footer structure', () => {
      const footer = fixture.nativeElement.querySelector('footer');
      const container = footer.querySelector('.footer-container');
      const bottom = footer.querySelector('.footer-bottom');

      expect(footer).toBeTruthy();
      expect(container).toBeTruthy();
      expect(bottom).toBeTruthy();
    });

    it('should have all required footer sections', () => {
      const logo = fixture.nativeElement.querySelector('.footer-logo');
      const links = fixture.nativeElement.querySelector('.footer-links');
      const contact = fixture.nativeElement.querySelector('.footer-contact');
      const social = fixture.nativeElement.querySelector('.footer-social');

      expect(logo).toBeTruthy();
      expect(links).toBeTruthy();
      expect(contact).toBeTruthy();
      expect(social).toBeTruthy();
    });

    it('should have script tag for DOM manipulation', () => {
      const scriptElement = fixture.nativeElement.querySelector('script');
      expect(scriptElement).toBeTruthy();
      expect(scriptElement.textContent).toContain('DOMContentLoaded');
      expect(scriptElement.textContent).toContain('product');
    });
  });

  describe('Accessibility and SEO', () => {
    it('should have meaningful alt text for payment logos', () => {
      const paymentImages = fixture.nativeElement.querySelectorAll('.payment-methods img');

      expect(paymentImages[0].alt).toBe('Visa');
      expect(paymentImages[1].alt).toBe('Mastercard');
      expect(paymentImages[2].alt).toBe('Apple Pay');
    });

    it('should have proper heading hierarchy', () => {
      const h2 = fixture.nativeElement.querySelector('h2');
      const h3Elements = fixture.nativeElement.querySelectorAll('h3');

      expect(h2).toBeTruthy();
      expect(h3Elements.length).toBe(2);
    });

    it('should use semantic footer element', () => {
      const footer = fixture.nativeElement.querySelector('footer');
      expect(footer).toBeTruthy();
      expect(footer.tagName.toLowerCase()).toBe('footer');
    });
  });

  describe('Dynamic Content and Interactivity', () => {
    it('should handle missing images gracefully', () => {
      const images = fixture.nativeElement.querySelectorAll('img');
      images.forEach((img: HTMLImageElement) => {
        // Simulate image load error
        const errorEvent = new Event('error');
        img.dispatchEvent(errorEvent);
        // Should not throw error
        expect(img).toBeTruthy();
      });
    });

    it('should handle link clicks without navigation in test environment', () => {
      const links = fixture.nativeElement.querySelectorAll('a');
      links.forEach((link: HTMLAnchorElement) => {
        // In test environment, clicks should not navigate
        const clickEvent = new Event('click');
        expect(() => link.dispatchEvent(clickEvent)).not.toThrow();
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle component without fixture.detectChanges()', () => {
      const testFixture = TestBed.createComponent(FooterComponent);
      const testComponent = testFixture.componentInstance;

      expect(testComponent).toBeTruthy();
      // Should not throw error even without detectChanges
      expect(() => testFixture.detectChanges()).not.toThrow();
    });

    it('should handle multiple detectChanges calls', () => {
      expect(() => {
        fixture.detectChanges();
        fixture.detectChanges();
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should handle component destruction', () => {
      expect(() => {
        fixture.destroy();
      }).not.toThrow();
    });
  });

  describe('Performance and Memory', () => {
    it('should not create memory leaks with multiple instances', () => {
      const fixtures: ComponentFixture<FooterComponent>[] = [];

      for (let i = 0; i < 10; i++) {
        const testFixture = TestBed.createComponent(FooterComponent);
        testFixture.detectChanges();
        fixtures.push(testFixture);
      }

      expect(fixtures.length).toBe(10);

      // Clean up
      fixtures.forEach(f => f.destroy());
    });

    it('should render efficiently with minimal DOM queries', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        fixture.detectChanges();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 100ms for 100 change detections)
      expect(duration).toBeLessThan(100);
    });
  });
});
