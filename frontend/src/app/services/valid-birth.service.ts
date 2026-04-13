import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ValidBirth,
  ValidBirthPage,
  ValidationActionRequest,
  ValidationStatut,
} from '../models/valid-birth.model';

@Injectable({ providedIn: 'root' })
export class ValidBirthService {
  private readonly apiUrl = `${environment.apiURL}/valid-births`;

  constructor(private http: HttpClient) {}

  /**
   * Liste paginée avec filtres optionnels.
   * Le périmètre territorial est appliqué côté serveur selon le JWT.
   */
  getAll(filters: {
    statut?: ValidationStatut | '';
    region?: string;
    prefecture?: string;
    commune?: string;
    page?: number;
    size?: number;
  } = {}): Observable<ValidBirthPage> {
    let params = new HttpParams();
    if (filters.statut)     params = params.set('statut',     filters.statut);
    if (filters.region)     params = params.set('region',     filters.region);
    if (filters.prefecture) params = params.set('prefecture', filters.prefecture);
    if (filters.commune)    params = params.set('commune',    filters.commune);
    params = params.set('page', String(filters.page ?? 0));
    params = params.set('size', String(filters.size ?? 25));

    return this.http.get<ValidBirthPage>(this.apiUrl, { params });
  }

  /** Détail d'un acte par son ID. */
  getById(id: string): Observable<ValidBirth> {
    return this.http.get<ValidBirth>(`${this.apiUrl}/${id}`);
  }

  /** Valider un acte EN_ATTENTE. */
  valider(id: string): Observable<ValidBirth> {
    return this.http.post<ValidBirth>(`${this.apiUrl}/${id}/valider`, {});
  }

  /** Rejeter un acte EN_ATTENTE avec un motif obligatoire. */
  rejeter(id: string, request: ValidationActionRequest): Observable<ValidBirth> {
    return this.http.post<ValidBirth>(`${this.apiUrl}/${id}/rejeter`, request);
  }

  /** Remettre un acte REJETÉ en attente après correction (AGENT). */
  corriger(id: string): Observable<ValidBirth> {
    return this.http.post<ValidBirth>(`${this.apiUrl}/${id}/corriger`, {});
  }

  /** Télécharger la copie intégrale PDF d'un acte validé. */
  getPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, {
      responseType: 'blob',
    });
  }
}
