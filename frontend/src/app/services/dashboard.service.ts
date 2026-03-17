import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces
export interface DashboardData {
  total_collectes: number;
  total_collecte_avec_actes: number;
  total_collecte_sans_actes: number;
  total_valid_acte: number;
  total_rejected_acte: number;
  communes_data: CommuneData[];
  total_population: number;
  taux_avec_actes: number;
  taux_sans_actes: number;
  taux_masculinite: number;
  total_hommes: number;
  total_femmes: number;
}

export interface CommuneData {
  nom_commune: string;
  code_commune: string;
  resultat_menages_commune: number;
  homme: number;
  femme: number;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = environment.apiURL || 'http://localhost:8083/api/v1';

  constructor(private http: HttpClient) {}

  /**
   * Récupère toutes les données du dashboard
   */
  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.baseUrl}/statistiques/dashboard`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère les données d'une commune spécifique
   */
  getCommuneDetails(codeCommune: string): Observable<CommuneData> {
    return this.http.get<CommuneData>(`${this.baseUrl}/statistiques/communes/${codeCommune}`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère le total des collectes
   */
  getTotalCollectes(): Observable<{ total_collectes: number; timestamp: string }> {
    return this.http.get<{ total_collectes: number; timestamp: string }>(`${this.baseUrl}/statistiques/collectes/total`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Récupère le total des actes validés
   */
  getTotalValidActe(): Observable<{ total_valid_acte: number; timestamp: string }> {
    return this.http.get<{ total_valid_acte: number; timestamp: string }>(`${this.baseUrl}/statistiques/actes/valides`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }

  /**
   * Vérifie l'état de santé de l'API
   */
  healthCheck(): Observable<{ status: string; database_connection: string; timestamp: string }> {
    return this.http.get<{ status: string; database_connection: string; timestamp: string }>(`${this.baseUrl}/statistiques/health`)
      .pipe(
        catchError(this.handleError) // Pas de retry pour le health check
      );
  }

  /**
   * Formate un nombre pour l'affichage
   */
  formatNumber(value: number): string {
    return new Intl.NumberFormat('fr-FR').format(value);
  }

  /**
   * Formate un pourcentage pour l'affichage
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calcule le taux de masculinité d'une commune
   */
  calculateTauxMasculinite(commune: CommuneData): number {
    const total = commune.homme + commune.femme;
    return total > 0 ? (commune.homme / total) * 100 : 0;
  }

  /**
   * Trouve la commune avec le plus de ménages
   */
  getTopCommuneByMenages(communes: CommuneData[]): CommuneData | null {
    if (!communes || communes.length === 0) {
      return null;
    }

    return communes.reduce((max, commune) =>
      commune.resultat_menages_commune > max.resultat_menages_commune ? commune : max
    );
  }

  /**
   * Trouve la commune avec le plus de population
   */
  getTopCommuneByPopulation(communes: CommuneData[]): CommuneData | null {
    if (!communes || communes.length === 0) {
      return null;
    }

    return communes.reduce((max, commune) => {
      const currentPop = commune.homme + commune.femme;
      const maxPop = max.homme + max.femme;
      return currentPop > maxPop ? commune : max;
    });
  }

  /**
   * Trie les communes par nom
   */
  sortCommunesByName(communes: CommuneData[]): CommuneData[] {
    return [...communes].sort((a, b) => a.nom_commune.localeCompare(b.nom_commune));
  }

  /**
   * Trie les communes par population (descendant)
   */
  sortCommunesByPopulation(communes: CommuneData[]): CommuneData[] {
    return [...communes].sort((a, b) => {
      const popA = a.homme + a.femme;
      const popB = b.homme + b.femme;
      return popB - popA;
    });
  }

  /**
   * Calcule des statistiques globales
   */
  calculateGlobalStats(data: DashboardData): {
    totalPopulation: number;
    moyenneMenagesParCommune: number;
    communeLaPlusPopuleuse: string;
    communeLaMoinsPopuleuse: string;
    tauxValidationActes: number;
  } {
    const communes = data.communes_data;
    const totalPopulation = data.total_population;
    const totalMenages = communes.reduce((sum, c) => sum + c.resultat_menages_commune, 0);

    const communeLaPlusPopuleuse = this.getTopCommuneByPopulation(communes);
    const communeLaMoinsPopuleuse = communes.reduce((min, commune) => {
      const currentPop = commune.homme + commune.femme;
      const minPop = min.homme + min.femme;
      return currentPop < minPop ? commune : min;
    });

    const tauxValidationActes = data.total_collecte_avec_actes > 0
      ? (data.total_valid_acte / data.total_collecte_avec_actes) * 100
      : 0;

    return {
      totalPopulation,
      moyenneMenagesParCommune: Math.round(totalMenages / communes.length),
      communeLaPlusPopuleuse: communeLaPlusPopuleuse?.nom_commune || 'N/A',
      communeLaMoinsPopuleuse: communeLaMoinsPopuleuse?.nom_commune || 'N/A',
      tauxValidationActes
    };
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur inconnue s\'est produite';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion Internet.';
          break;
        case 404:
          errorMessage = 'Service non trouvé. Vérifiez l\'URL de l\'API.';
          break;
        case 500:
          errorMessage = 'Erreur interne du serveur. Contactez l\'administrateur.';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible. Réessayez plus tard.';
          break;
        default:
          if (error.error && error.error.message) {
            errorMessage = error.error.message;
          } else {
            errorMessage = `Erreur HTTP ${error.status}: ${error.message}`;
          }
      }
    }

    console.error('Erreur dans DashboardService:', error);
    return throwError(() => new Error(errorMessage));
  }
}
