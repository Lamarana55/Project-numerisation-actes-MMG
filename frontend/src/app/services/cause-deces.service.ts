import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CauseDeces {
  id: number;
  libelle: string;
}

@Injectable({ providedIn: 'root' })
export class CauseDecesService {
  private readonly apiUrl = `${environment.apiURL}/causes-deces`;
  private cache$?: Observable<CauseDeces[]>;

  constructor(private http: HttpClient) {}

  getCausesDeces(): Observable<CauseDeces[]> {
    if (!this.cache$) {
      this.cache$ = this.http.get<CauseDeces[]>(this.apiUrl).pipe(shareReplay(1));
    }
    return this.cache$;
  }
}
