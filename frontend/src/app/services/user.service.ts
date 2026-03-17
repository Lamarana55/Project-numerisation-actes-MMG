import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiURL}/users`;

  constructor(private http: HttpClient) { }

  /**
   * Obtenir tous les utilisateurs
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Obtenir un utilisateur par ID
   */
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel utilisateur
   */
  createUser(user: User): Observable<User> {
    console.log(user)
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Mettre à jour un utilisateur
   */
  updateUser(id: string, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(id: string): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${id}`);
  }

  /**
   * Rechercher des utilisateurs par nom
   */
  searchUsersByNom(nom: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?nom=${nom}`);
  }

  /**
   * Rechercher des utilisateurs par prénom
   */
  searchUsersByPrenom(prenom: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/search?prenom=${prenom}`);
  }

  /**
   * Obtenir les utilisateurs par statut
   */
  getUsersByStatut(statut: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/statut/${statut}`);
  }

  /**
   * Assigner des rôles à un utilisateur
   */
  assignRolesToUser(userId: string, roleIds: string[]): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/${userId}/roles`, { roleIds });
  }

  /**
   * Retirer des rôles d'un utilisateur
   */
  removeRolesFromUser(userId: string, roleIds: string[]): Observable<User> {
    return this.http.delete<User>(`${this.apiUrl}/${userId}/roles`, {
      body: { roleIds }
    });
  }

  /**
   * Activer/désactiver un utilisateur
   */
  toggleUserStatus(userId: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/toggle-status`, {});
  }

  /**
   * Réinitialiser le mot de passe d'un utilisateur
   */
  resetUserPassword(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/reset-password`, {});
  }
}
