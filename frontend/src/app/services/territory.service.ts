import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { GeodataService } from './geodata.service';
import { CommuneDTO, PrefectureDTO, RegionDTO } from '../models/geodata';

/**
 * Service territoire — fournit les données géographiques (régions, préfectures,
 * communes) avec filtrage en cascade pour le formulaire de gestion des utilisateurs.
 *
 * S'appuie sur GeodataService existant tout en offrant une API adaptée aux
 * besoins de la sélection territoriale dans les formulaires utilisateurs.
 */
@Injectable({ providedIn: 'root' })
export class TerritoryService {

  constructor(private geodataService: GeodataService) {}

  // ── Régions ──────────────────────────────────────────────────────────────

  getRegions(): Observable<RegionDTO[]> {
    return this.geodataService.getAllRegions();
  }

  // ── Préfectures par région ───────────────────────────────────────────────

  /**
   * Retourne les préfectures d'une région.
   * Utilise le code de la région comme paramètre de l'API existante.
   */
  getPrefecturesByRegionCode(codeRegion: string): Observable<PrefectureDTO[]> {
    if (!codeRegion) return of([]);
    return this.geodataService.getPrefecturesByRegion(codeRegion);
  }

  // ── Communes par préfecture ──────────────────────────────────────────────

  /**
   * Retourne les communes d'une préfecture.
   */
  getCommunesByPrefectureCode(codePrefecture: string): Observable<CommuneDTO[]> {
    if (!codePrefecture) return of([]);
    return this.geodataService.getCommunesByPrefecture(codePrefecture);
  }
}
