import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Permission } from '../models/permission';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiURL}/permissions`;

  constructor(private http: HttpClient) { }

  /**
   * Obtenir toutes les permissions
   */
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);
  }

  /**
   * Obtenir une permission par ID
   */
  getPermissionById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer une nouvelle permission
   */
  createPermission(permission: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.apiUrl, permission);
  }

  /**
   * Mettre à jour une permission
   */
  updatePermission(id: string, permission: Permission): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/${id}`, permission);
  }

  /**
   * Supprimer une permission
   */
  deletePermission(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  /**
   * Rechercher une permission par nom
   */
  findPermissionByNom(nom: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/findByNom?nom=${nom}`);
  }

  /**
   * Créer plusieurs permissions en lot
   */
  createMultiplePermissions(permissions: Permission[]): Observable<Permission[]> {
    return this.http.post<Permission[]>(`${this.apiUrl}/batch`, permissions);
  }

  /**
   * Obtenir les permissions par catégorie
   */
  getPermissionsByCategory(category: string): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/category/${category}`);
  }
}
