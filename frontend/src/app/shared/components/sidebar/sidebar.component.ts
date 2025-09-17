import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    private readonly catSvc: CategoryService,
    public router: Router) {}

  selectCategory(cat: string) {
    if (this.router.url !== '/') {
      this.router.navigateByUrl('/');
    }
    this.catSvc.setCategory(cat);
}
}
