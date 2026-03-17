import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

// ✅ Pas de providedIn:'root' — les interceptors se déclarent dans AppModule
@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  // ✅ URLs publiques qui ne nécessitent pas de token
  private readonly publicUrls: string[] = [
    '/auth/signin',
    '/auth/send-email',
    '/auth/reset-password',
  ];

  constructor(
    // ✅ Injecter AuthService pour centraliser la gestion du token
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // ✅ Vérifie si l'URL est publique (pas besoin de token)
    const isPublicUrl = this.publicUrls.some(url => req.url.includes(url));
    if (isPublicUrl) {
      return next.handle(req);
    }

    // ✅ Récupère le token via AuthService, pas directement sessionStorage
    const token = this.authService.getToken();

    // ✅ Clone et attache le token si disponible
    const authReq = token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            'Content-Type': req.headers.has('Content-Type')
              ? req.headers.get('Content-Type')!
              : 'application/json',
          },
        })
      : req;

    // ✅ Gestion centralisée des erreurs HTTP
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {

    // ✅ Log uniquement en développement
    if (!environment.production) {
      console.error(`[HTTP Error] ${error.status} — ${error.url}`, error.message);
    }

    switch (error.status) {
      case 401:
        // Token expiré ou invalide → déconnexion automatique
        this.authService.logout();
        break;

      case 403:
        // Accès refusé → rediriger vers une page d'accès interdit
        this.router.navigate(['/forbidden']);
        break;

      case 0:
        // Serveur injoignable (réseau coupé, CORS bloqué)
        console.error('Serveur inaccessible — vérifiez votre connexion');
        break;

      // 500, 503... : laissés remonter au composant pour affichage
    }

    // ✅ Remonte l'erreur pour que les composants puissent l'afficher si besoin
    return throwError(() => error);
  }
}
