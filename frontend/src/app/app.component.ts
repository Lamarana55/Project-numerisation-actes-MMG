import { Component, inject } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
   authService = inject(AuthService)
  currentYear = new Date().getFullYear();

    get isAuthenticated(): boolean {
      return !!sessionStorage.getItem('accessToken');
    }
}
