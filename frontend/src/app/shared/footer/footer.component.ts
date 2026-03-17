import { Component, inject, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  authService = inject(AuthService)
  @Input() isAuthenticated: boolean = false;
  currentYear = new Date().getFullYear();

}
