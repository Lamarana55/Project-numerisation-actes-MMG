import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Profession {
  code: number;
  masculin: string;
  feminin: string;
}

@Injectable({ providedIn: 'root' })
export class ProfessionService {
  private readonly apiUrl = `${environment.apiURL}/professions`;
  private cache$?: Observable<Profession[]>;

  constructor(private http: HttpClient) {}

  getProfessions(): Observable<Profession[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<Profession[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }

  getProfessionBySex(code: number, sexe: 'M' | 'F', professions: Profession[]): string {
    const prof = professions.find(p => p.code === code);
    if (!prof) return '';
    return sexe === 'F' ? prof.feminin : prof.masculin;
  }

  getLabel(value: string | undefined | null): string {
    return value?.trim() || '—';
  }
}
