import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/role';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = `${environment.apiURL}/roles`;

  constructor(private http: HttpClient) { }

  /**
   * Obtenir tous les rôles
   */
  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  /**
   * Obtenir un rôle par ID
   */
  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau rôle
   */
  createRole(role: Role): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, role);
  }

  /**
   * Mettre à jour un rôle
   */
  updateRole(id: string, role: Role): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, role);
  }

  /**
   * Supprimer un rôle
   */
  deleteRole(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  /**
   * Rechercher un rôle par nom
   */
  findRoleByNom(nom: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/findByCode?nom=${nom}`);
  }

  /**
   * Assigner des permissions à un rôle
   */
  assignPermissionsToRole(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/${roleId}/permissions`, { permissionIds });
  }

  /**
   * Retirer des permissions d'un rôle
   */
  removePermissionsFromRole(roleId: string, permissionIds: string[]): Observable<Role> {
    return this.http.delete<Role>(`${this.apiUrl}/${roleId}/permissions`, {
      body: { permissionIds }
    });
  }

  /**
   * Obtenir les rôles avec une permission spécifique
   */
  getRolesWithPermission(permissionNom: string): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/with-permission/${permissionNom}`);
  }
}
