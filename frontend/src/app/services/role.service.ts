import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/role';

export interface RoleRequest {
  nom: string;
  description?: string;
  permissionIds: string[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = `${environment.apiURL}/roles`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.apiUrl);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/${id}`);
  }

  createRole(req: RoleRequest): Observable<Role> {
    return this.http.post<Role>(this.apiUrl, req);
  }

  updateRole(id: string, req: RoleRequest): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/${id}`, req);
  }

  deleteRole(id: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  findRoleByNom(nom: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/findByCode?nom=${nom}`);
  }
}
