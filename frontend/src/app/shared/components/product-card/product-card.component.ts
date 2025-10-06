import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() imageUrl!: string;
  @Input() title!: string;
  @Input() price!: number;
  @Input() productId!: number;

  constructor(private readonly router: Router) {}

  goToDetails() {
    this.router.navigate(['/product', this.productId]);
  }
}
