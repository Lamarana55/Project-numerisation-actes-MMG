import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    console.log('AuthGuard - Vérification de l\'authentification...');
    console.log('URL demandée:', state.url);
    console.log('Token présent:', !!this.authService.getToken());
    console.log('IsAuthenticated:', this.authService.isAuthenticated);

    if (this.authService.isAuthenticated) {
      // Bloquer l'accès à tout sauf /change-password si le flag est actif
      if (this.authService.mustChangePassword && state.url !== '/change-password') {
        console.log('AuthGuard - Changement de mot de passe obligatoire, redirection vers /change-password');
        this.router.navigate(['/change-password']);
        return false;
      }
      console.log('AuthGuard - Utilisateur authentifié, accès autorisé');
      return true;
    } else {
      console.log('AuthGuard - Utilisateur non authentifié, redirection vers /login');

      // Sauvegarder l'URL de destination pour redirection après connexion
      const returnUrl = state.url !== '/admin' ? state.url : '/admin/dashboard';

      this.router.navigate(['/login'], {
        queryParams: { returnUrl }
      });
      return false;
    }
  }
}
