import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Nationalite {
  code: string;
  libelleFeminin: string;
  libelleMasculin: string;
}

@Injectable({ providedIn: 'root' })
export class NationaliteService {
  private readonly apiUrl = `${environment.apiURL}/nationalites`;
  private cache$?: Observable<Nationalite[]>;

  constructor(private http: HttpClient) {}

  getNationalites(): Observable<Nationalite[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Nationalite[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }

  getLibelle(code: string | undefined | null, sexe: 'M' | 'F' = 'F', list: Nationalite[]): string {
    if (!code) return '—';
    const n = list.find(x => x.code === code.trim().toUpperCase());
    if (!n) return code;
    return sexe === 'F' ? n.libelleFeminin : n.libelleMasculin;
  }
}
