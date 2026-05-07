import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CommuneStatDTO {
  codeCommune:    string;
  nomCommune:     string;
  codePrefecture: string;
  actes:          number;
  naissance:      number;
  deces:          number;
  hommes:         number;
  femmes:         number;
}

export interface MoisStatDTO {
  annee:      number;
  mois:       number;
  label:      string;
  actes:      number;
  naissances: number;
  deces:      number;
}

export interface StatistiquesDTO {
  totalActes:       number;
  totalNaissance:   number;
  totalDeces:       number;
  totalHommes:      number;
  totalFemmes:      number;
  totalValides:     number;
  totalEnAttente:   number;
  totalRejetes:     number;
  naissanceHommes:  number;
  naissanceFemmes:  number;
  decesHommes:      number;
  decesFemmes:      number;
  parCommune:       CommuneStatDTO[];
  parMois:          MoisStatDTO[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private baseUrl = `${environment.apiURL}`;

  constructor(private http: HttpClient) {}

  getDashboardStats(): Observable<StatistiquesDTO> {
    return this.http.get<StatistiquesDTO>(`${this.baseUrl}/statistiques/dashboard`);
  }

  getRapport(dateDebut: string, dateFin: string): Observable<StatistiquesDTO> {
    return this.http.get<StatistiquesDTO>(`${this.baseUrl}/statistiques/rapport`, {
      params: { dateDebut, dateFin }
    });
  }
}
