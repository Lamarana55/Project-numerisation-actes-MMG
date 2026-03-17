import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated) {
      this.router.navigateByUrl('/login');
      return false;
    }
    
    const requiredRoles: string[] = route.data['roles'] || [];
    const userRoles: string[] = this.authService.roles || [];

    console.log('Roles utilisateur :', userRoles);
    console.log('Rôles requis :', requiredRoles);

    // Vérifiez si l'utilisateur possède au moins un rôle requis
    const hasAccess = requiredRoles.some(role => userRoles.includes(role));

    if (!hasAccess) {
      console.warn('Accès refusé : rôles insuffisants');
      this.router.navigateByUrl('/forbidden'); // Redirigez vers une page "accès interdit"
      return false;
    }

    return true;
  }
}
