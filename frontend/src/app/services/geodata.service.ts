// ✅ APRÈS — cache invalidé si erreur 401, + clearCache() appelé au login

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of, shareReplay } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CommuneDTO, PaysDTO, PrefectureDTO,
  QuartierDTO, RegionDTO, VilleDTO,
} from '../models/geodata';

@Injectable({ providedIn: 'root' })
export class GeodataService {

  private readonly API_URL = `${environment.apiURL}/geodata`;

  // Cache — initialisé à undefined, rempli au premier appel réussi
  private regionsCache$?: Observable<RegionDTO[]>;
  private paysCache$?: Observable<PaysDTO[]>;

  constructor(private http: HttpClient) {}

  getAllRegions(): Observable<RegionDTO[]> {
    if (!this.regionsCache$) {
      this.regionsCache$ = this.http.get<RegionDTO[]>(`${this.API_URL}/regions`).pipe(
        shareReplay(1),
        catchError((error: HttpErrorResponse) => {
          // ✅ Si 401 : vider le cache pour que le prochain appel (avec token) refasse la requête
          if (error.status === 401) {
            this.regionsCache$ = undefined;
          }
          return this.handleError('getAllRegions', [])(error);
        })
      );
    }
    return this.regionsCache$;
  }

  getAllPays(): Observable<PaysDTO[]> {
    if (!this.paysCache$) {
      this.paysCache$ = this.http.get<PaysDTO[]>(`${this.API_URL}/pays`).pipe(
        shareReplay(1),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.paysCache$ = undefined;
          }
          return this.handleError('getAllPays', [])(error);
        })
      );
    }
    return this.paysCache$;
  }

  getPrefecturesByRegion(codeRegion: string): Observable<PrefectureDTO[]> {
    return this.http
      .get<PrefectureDTO[]>(`${this.API_URL}/regions/${codeRegion}/prefectures`)
      .pipe(catchError(this.handleError('getPrefecturesByRegion', [])));
  }

  getCommunesByPrefecture(codePrefecture: string): Observable<CommuneDTO[]> {
    return this.http
      .get<CommuneDTO[]>(`${this.API_URL}/prefectures/${codePrefecture}/communes`)
      .pipe(catchError(this.handleError('getCommunesByPrefecture', [])));
  }

  getQuartiersByCommune(codeCommune: string): Observable<QuartierDTO[]> {
    return this.http
      .get<QuartierDTO[]>(`${this.API_URL}/communes/${codeCommune}/quartiers`)
      .pipe(catchError(this.handleError('getQuartiersByCommune', [])));
  }

  getVillesByPays(codePays: string): Observable<VilleDTO[]> {
    return this.http
      .get<VilleDTO[]>(`${this.API_URL}/pays/${codePays}/villes`)
      .pipe(catchError(this.handleError('getVillesByPays', [])));
  }

  // ✅ Appeler cette méthode depuis AuthService.login() après connexion réussie
  clearCache(): void {
    this.regionsCache$ = undefined;
    this.paysCache$ = undefined;
  }

  checkApiHealth(): Observable<boolean> {
    return this.http.get(`${this.API_URL}/regions`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (!environment.production) {
        console.error(`❌ ${operation} échoué [${error.status}]:`, error.message);
      }
      return of(result as T);
    };
  }
}
