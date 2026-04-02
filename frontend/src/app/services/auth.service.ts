import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GeodataService } from './geodata.service';
import { ActivityService } from './activity.service';

interface LoginCredentials {
  username: string;
  password: string;
}

interface JwtResponse {
  accessToken: string;
  name: string;
  username: string;
  authorities: any[];
  // Profil métier
  profil?: string;
  profilLibelle?: string;
  niveauAdministratif?: string;
  // Territoire
  regionId?: string;
  regionNom?: string;
  prefectureId?: string;
  prefectureNom?: string;
  communeId?: string;
  communeNom?: string;
  // Sécurité
  mustChangePassword?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiURL}/auth`;
  private tokenKey = 'accessToken';
  private userKey = 'user';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  private currentUserSubject = new BehaviorSubject<any>(this.getCurrentUserFromStorage());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private geodataService: GeodataService,
    private activityService: ActivityService
  ) {}

  /**
   * Connexion utilisateur
   */
  login(username: string, password: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/signin`, { username, password })
      .pipe(
        tap(response => {
          this.setSession(response);
          this.geodataService.clearCache();
          // Tracer la connexion dans l'historique local
          this.activityService.add(
            response.username,
            'login',
            'Connexion réussie',
            `Connexion au système le ${new Date().toLocaleString('fr-FR')}`
          );
          if (response.mustChangePassword) {
            this.router.navigate(['/change-password']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
        })
      );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    console.log("Déconnexion....")
    this.router.navigate(['/login']);
  }

  /**
   * Envoyer email de réinitialisation
   */
  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-email`, { email });
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  get isAuthenticated(): boolean {
    const hasValidToken = this.hasValidToken();
    return hasValidToken;
  }

  /**
   * Obtenir le token JWT
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Obtenir l'ID de l'utilisateur actuel
   */
  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Obtenir le nom d'utilisateur
   */
  get username(): string {
    const user = this.getCurrentUser();
    return user ? user.name : '';
  }

  /**
   * Obtenir les rôles de l'utilisateur
   */
  get roles(): string[] {
    const user = this.getCurrentUser();
    if (!user || !user.authorities) {
      return [];
    }

    return user.authorities.map((auth: any) => {
      if (typeof auth === 'string') {
        return auth;
      }
      return auth.authority || auth.name || auth;
    });
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): boolean {
    return this.roles.includes(permission);
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // ── Profil métier ────────────────────────────────────────────────────────

  /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR) */
  get profil(): string | null {
    return this.getCurrentUser()?.profil ?? null;
  }

  /** Libellé affiché (ex: Super-Administrateur) */
  get profilLibelle(): string | null {
    return this.getCurrentUser()?.profilLibelle ?? null;
  }

  /** Niveau administratif (CENTRAL | REGIONAL | PREFECTORAL | COMMUNAL) */
  get niveauAdministratif(): string | null {
    return this.getCurrentUser()?.niveauAdministratif ?? null;
  }

  get isCentral(): boolean     { return this.niveauAdministratif === 'CENTRAL'; }
  get isRegional(): boolean    { return this.niveauAdministratif === 'REGIONAL'; }
  get isPrefectoral(): boolean { return this.niveauAdministratif === 'PREFECTORAL'; }
  get isCommunal(): boolean    { return this.niveauAdministratif === 'COMMUNAL'; }

  // ── Territoire ───────────────────────────────────────────────────────────

  get regionId(): string | null    { return this.getCurrentUser()?.regionId    ?? null; }
  get regionNom(): string | null   { return this.getCurrentUser()?.regionNom   ?? null; }
  get prefectureId(): string | null{ return this.getCurrentUser()?.prefectureId?? null; }
  get prefectureNom(): string | null{ return this.getCurrentUser()?.prefectureNom?? null; }
  get communeId(): string | null   { return this.getCurrentUser()?.communeId   ?? null; }
  get communeNom(): string | null  { return this.getCurrentUser()?.communeNom  ?? null; }

  // ── Profil (auto-modification) ────────────────────────────────────────────

  /** Initiales de l'utilisateur (2 lettres max) pour l'avatar */
  get initials(): string {
    const name = this.getCurrentUser()?.name || '';
    const parts = name.trim().split(/\s+/).filter((p: string) => p.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /** Retourne le profil complet de l'utilisateur connecté (GET /auth/me) */
  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  /** Met à jour les informations personnelles (PATCH /auth/me) et rafraîchit la session */
  updateMyProfile(data: {
    nom: string; prenom: string; email?: string; telephone?: string; fonction?: string;
  }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/me`, data).pipe(
      tap((updated: any) => {
        const user = this.getCurrentUser();
        if (user && updated) {
          // Rafraîchir le nom affiché dans la toolbar sans déconnexion
          user.name = `${updated.prenom || ''} ${updated.nom || ''}`.trim();
          sessionStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next({ ...user });
        }
      })
    );
  }

  // ── Sécurité ─────────────────────────────────────────────────────────────

  /** `true` si l'utilisateur doit obligatoirement changer son mot de passe. */
  get mustChangePassword(): boolean {
    return this.getCurrentUser()?.mustChangePassword ?? false;
  }

  /**
   * Appelé après un changement de mot de passe réussi pour effacer le flag
   * dans la session sans forcer une reconnexion complète.
   */
  clearMustChangePassword(): void {
    const user = this.getCurrentUser();
    if (user) {
      user.mustChangePassword = false;
      sessionStorage.setItem(this.userKey, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Changement obligatoire du mot de passe (première connexion / réinitialisation admin).
   */
  changeFirstPassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-first-password`, { currentPassword, newPassword });
  }

  /**
   * Mettre à jour les informations de l'utilisateur connecté
   */
  updateCurrentUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Vérifier si on a un token valide - VERSION CORRIGÉE
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp;
      const now = Math.floor(Date.now() / 1000);

      if (!expiration || now >= expiration) {
        console.log('Token expiré');
        this.clearExpiredSession(); // méthode personnalisée à définir
        return false;
      }

      console.log('Token valide');
      return true;
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      return false;
    }
}

  /**
   * Vérifier si le token est expiré - VERSION CORRIGÉE
   */
  private isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    if (!tokenToCheck) return true;

    try {
      // Vérifier le format du token
      const tokenParts = tokenToCheck.split('.');
      // if (tokenParts.length !== 3) {
      //   console.error('Token JWT mal formé - ne contient pas 3 parties');
      //   return true;
      // }

      // Décoder le payload (partie centrale du JWT)
      const payload = JSON.parse(atob(tokenParts[1]));

      // Vérifier si le payload contient une date d'expiration
      if (!payload.exp) {
        console.warn('Token sans date d\'expiration');
        // Si pas d'expiration définie, considérer comme valide
        // ou vous pouvez changer cette logique selon vos besoins
        return false;
      }

      // Vérifier l'expiration (exp est en secondes, Date.now() en millisecondes)
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;

      console.log('Token exp:', payload.exp, 'Current time:', currentTime, 'Expired:', isExpired);
      return isExpired;

    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      // En cas d'erreur de décodage, considérer le token comme invalide
      return true;
    }
  }

  /**
   * Nettoyer la session expirée
   */
  private clearExpiredSession(): void {
    console.log('Nettoyage de la session expirée');
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Définir la session utilisateur
   */
  private setSession(authResult: JwtResponse): void {
    sessionStorage.setItem(this.tokenKey, authResult.accessToken);

    const userData = {
      username:           authResult.username,
      name:               authResult.name,
      authorities:        authResult.authorities,
      // Profil métier
      profil:             authResult.profil,
      profilLibelle:      authResult.profilLibelle,
      niveauAdministratif: authResult.niveauAdministratif,
      // Territoire
      regionId:           authResult.regionId,
      regionNom:          authResult.regionNom,
      prefectureId:       authResult.prefectureId,
      prefectureNom:      authResult.prefectureNom,
      communeId:          authResult.communeId,
      communeNom:         authResult.communeNom,
      // Sécurité
      mustChangePassword: authResult.mustChangePassword ?? false,
    };

    sessionStorage.setItem(this.userKey, JSON.stringify(userData));
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(userData);
  }

  /**
   * Récupérer l'utilisateur depuis le stockage local
   */
  private getCurrentUserFromStorage(): any {
    try {
      const userData = sessionStorage.getItem(this.userKey);
      if (!userData) {
        return null;
      }

      const user = JSON.parse(userData);

      // Vérifier si on a un token valide pour cet utilisateur
      if (!this.hasValidToken()) {
        console.log('Token invalide, suppression des données utilisateur');
        localStorage.removeItem(this.userKey);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      // En cas d'erreur, nettoyer les données corrompues
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  /**
   * Obtenir les en-têtes d'autorisation
   */
  getAuthHeaders(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Déconnecter de tous les appareils
   */
  logoutAllDevices(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout-all`, {})
      .pipe(
        tap(() => {
          this.logout();
        })
      );
  }

  /**
   * Vérifier la force du mot de passe
   */
  checkPasswordStrength(password: string): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Le mot de passe doit contenir au moins 8 caractères');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Ajoutez des lettres minuscules');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Ajoutez des lettres majuscules');

    if (/\d/.test(password)) score++;
    else feedback.push('Ajoutez des chiffres');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Ajoutez des caractères spéciaux');

    return { score, feedback };
  }

  /**
   * Méthode pour rafraîchir le token (si votre backend le supporte)
   */
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refresh-token`, {})
      .pipe(
        tap((response: any) => {
          if (response.jwt) {
            localStorage.setItem(this.tokenKey, response.jwt);
          }
        })
      );
  }

  /**
   * Vérifier périodiquement l'état du token
   */
  startTokenExpirationCheck(): void {
    setInterval(() => {
      if (this.getToken() && this.isTokenExpired()) {
        console.log('Token expiré détecté, déconnexion automatique');
        this.logout();
      }
    }, 60000); // Vérifier toutes les minutes
  }

  /**
   * Méthode utilitaire pour débugger l'état de l'authentification
   */
  debugAuthState(): void {
    console.log('=== DEBUG AUTH STATE ===');
    const token = this.getToken();
    console.log('Token valid:', this.hasValidToken());
    if (token) {
      console.log('Token expired:', this.isTokenExpired());
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
      } catch (e) {
        console.log('Erreur décodage token:', e);
      }
    }
    console.log('User:', this.getCurrentUser());
    console.log('IsAuthenticated:', this.isAuthenticated);
    console.log('Roles:', this.roles);
    console.log('========================');
  }
}
