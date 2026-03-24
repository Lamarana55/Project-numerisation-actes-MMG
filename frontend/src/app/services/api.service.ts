import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiURL;

  constructor(private httpClient: HttpClient) {}

  saveActe(payload: any): Observable<any> {
  return this.httpClient.post(`${this.apiUrl}/actes/indexation`, payload, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  });
}

  getActe(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/ravec/info`).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Erreur lors de la connexion:', error);
        return throwError(() => error);
      })
    );
  }

  getSansActe(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/ravec/judgment`).pipe(
      map((response) => response),
      catchError((error) => {
        console.error('Erreur lors de la connexion:', error);
        return throwError(() => error);
      })
    );
  }


}
