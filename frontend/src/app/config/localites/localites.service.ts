import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GeodataService } from '../../services/geodata.service';
import {
  Region, Prefecture, Commune, Quartier,
  Pays, Ville, LocaliteState, HierarchyLevel
} from './localites.models';

@Injectable({ providedIn: 'root' })
export class LocalitesService {
  private readonly apiBase = `${environment.apiURL}/geodata`;

  private stateSubject = new BehaviorSubject<LocaliteState>({
    activeTab: 'admin',
    regions: [],
    prefectures: [],
    communes: [],
    quartiers: [],
    pays: [],
    villes: [],
    expandedNodes: new Set(),
    selectedNode: null,
    editingNode: null,
    loading: false,
    error: null
  });

  public state$ = this.stateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private geodataService: GeodataService
  ) {}

  /* ══════════════════════════════════════════════════════
     CHARGER LA HIÉRARCHIE COMPLÈTE
  ══════════════════════════════════════════════════════ */

  /**
   * Charge la hiérarchie administrative complète:
   * Régions → Préfectures → Communes → Quartiers
   */
  loadAdminHierarchy(): Observable<HierarchyLevel[]> {
    return this.geodataService.getAllRegions().pipe(
      switchMap(regions => {
        // Pour chaque région, charger les préfectures
        const prefectureRequests: { [key: string]: Observable<any> } = {};
        regions.forEach(region => {
          prefectureRequests[region.code] = this.geodataService.getPrefecturesByRegion(region.code);
        });

        return forkJoin(prefectureRequests).pipe(
          switchMap(prefecturesByRegion => {
            // Collecteur toutes les préfectures
            const allPrefectures = Object.values(prefecturesByRegion).flat();

            // Pour chaque préfecture, charger les communes
            const communeRequests: { [key: string]: Observable<any> } = {};
            allPrefectures.forEach((pref: any) => {
              communeRequests[pref.code] = this.geodataService.getCommunesByPrefecture(pref.code);
            });

            return forkJoin(communeRequests).pipe(
              switchMap(communesByPrefecture => {
                // Collecteur toutes les communes
                const allCommunes = Object.values(communesByPrefecture).flat();

                // Pour chaque commune, charger les quartiers
                const quartierRequests: { [key: string]: Observable<any> } = {};
                allCommunes.forEach((commune: any) => {
                  quartierRequests[commune.code] = this.geodataService.getQuartiersByCommune(commune.code);
                });

                return forkJoin(quartierRequests).pipe(
                  map(quartiersByCommune => {
                    // Retourner toutes les données chargées
                    return {
                      regions,
                      prefecturesByRegion,
                      communesByPrefecture,
                      quartiersByCommune
                    };
                  })
                );
              })
            );
          })
        );
      }),
      map(allData => {
        const hierarchy = this.buildAdminHierarchy(
          allData.regions,
          allData.prefecturesByRegion,
          allData.communesByPrefecture,
          allData.quartiersByCommune
        );

        this.updateState({
          loading: false
        });

        return hierarchy;
      }),
      catchError(err => {
        console.error('Erreur chargement hiérarchie admin:', err);
        this.updateState({
          error: 'Erreur lors du chargement des localités',
          loading: false
        });
        return of([]);
      })
    );
  }

  /**
   * Charge la hiérarchie mondiale complète:
   * Pays → Villes
   */
  loadWorldHierarchy(): Observable<HierarchyLevel[]> {
    return this.geodataService.getAllPays().pipe(
      switchMap(pays => {
        // Pour chaque pays, charger les villes
        const villeRequests: { [key: string]: Observable<any> } = {};
        pays.forEach(p => {
          villeRequests[p.code] = this.geodataService.getVillesByPays(p.code);
        });

        return forkJoin(villeRequests).pipe(
          map(villesByPays => {
            return {
              pays,
              villesByPays
            };
          })
        );
      }),
      map(allData => {
        const hierarchy = this.buildWorldHierarchy(allData.pays, allData.villesByPays);

        this.updateState({
          loading: false
        });

        return hierarchy;
      }),
      catchError(err => {
        console.error('Erreur chargement hiérarchie monde:', err);
        this.updateState({
          error: 'Erreur lors du chargement des pays',
          loading: false
        });
        return of([]);
      })
    );
  }

  /* ══════════════════════════════════════════════════════
     CONSTRUIRE LES HIÉRARCHIES
  ══════════════════════════════════════════════════════ */

  private buildAdminHierarchy(
    regions: any[],
    prefecturesByRegion: { [key: string]: any[] },
    communesByPrefecture: { [key: string]: any[] },
    quartiersByCommune: { [key: string]: any[] }
  ): HierarchyLevel[] {
    return regions.map(region => 
      this.createRegionNode(region, prefecturesByRegion, communesByPrefecture, quartiersByCommune)
    );
  }

  private createRegionNode(
    region: any,
    prefecturesByRegion: { [key: string]: any[] },
    communesByPrefecture: { [key: string]: any[] },
    quartiersByCommune: { [key: string]: any[] }
  ): HierarchyLevel {
    const prefectures = prefecturesByRegion[region.code] || [];
    
    const children: HierarchyLevel[] = prefectures.map(pref =>
      this.createPrefectureNode(pref, communesByPrefecture, quartiersByCommune)
    );

    return {
      type: 'region',
      label: 'Région',
      icon: 'public',
      color: '#00853F',
      data: region,
      children: children.length > 0 ? children : undefined,
      expanded: false,
      loading: false
    };
  }

  private createPrefectureNode(
    prefecture: any,
    communesByPrefecture: { [key: string]: any[] },
    quartiersByCommune: { [key: string]: any[] }
  ): HierarchyLevel {
    const communes = communesByPrefecture[prefecture.code] || [];
    
    const children: HierarchyLevel[] = communes.map(comm =>
      this.createCommuneNode(comm, quartiersByCommune)
    );

    return {
      type: 'prefecture',
      label: 'Préfecture',
      icon: 'location_city',
      color: '#0084d0',
      data: prefecture,
      children: children.length > 0 ? children : undefined,
      expanded: false,
      loading: false
    };
  }

  private createCommuneNode(
    commune: any,
    quartiersByCommune: { [key: string]: any[] }
  ): HierarchyLevel {
    const quartiers = quartiersByCommune[commune.code] || [];
    
    const children: HierarchyLevel[] = quartiers.map(quart =>
      this.createQuartierNode(quart)
    );

    return {
      type: 'commune',
      label: 'Commune',
      icon: 'apartment',
      color: '#b45309',
      data: commune,
      children: children.length > 0 ? children : undefined,
      expanded: false,
      loading: false
    };
  }

  private createQuartierNode(quartier: any): HierarchyLevel {
    return {
      type: 'quartier',
      label: 'Quartier',
      icon: 'home',
      color: '#7c3aed',
      data: quartier,
      children: undefined,
      expanded: false,
      loading: false
    };
  }

  private buildWorldHierarchy(pays: any[], villesByPays: { [key: string]: any[] }): HierarchyLevel[] {
    return pays.map(p => this.createPaysNode(p, villesByPays));
  }

  private createPaysNode(pays: any, villesByPays: { [key: string]: any[] }): HierarchyLevel {
    const villes = villesByPays[pays.code] || [];
    
    const children: HierarchyLevel[] = villes.map(ville =>
      this.createVilleNode(ville)
    );

    return {
      type: 'pays',
      label: 'Pays',
      icon: 'language',
      color: '#00853F',
      data: pays,
      children: children.length > 0 ? children : undefined,
      expanded: false,
      loading: false
    };
  }

  private createVilleNode(ville: any): HierarchyLevel {
    return {
      type: 'ville',
      label: 'Ville',
      icon: 'location_city',
      color: '#0084d0',
      data: ville,
      children: undefined,
      expanded: false,
      loading: false
    };
  }

  /* ══════════════════════════════════════════════════════
     CONVERSIONS DTO → MODEL
  ══════════════════════════════════════════════════════ */

  private toRegion(dto: any): Region {
    return {
      id: dto.id,
      code: dto.code,
      nom: dto.nom,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private toCommune(dto: any): Commune {
    return {
      id: dto.id,
      code: dto.code,
      nom: dto.nom,
      prefectureId: dto.prefectureId,
      prefectureCode: dto.prefectureCode,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private toPays(dto: any): Pays {
    return {
      id: dto.id,
      code: dto.code,
      nom: dto.nom,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  /* ══════════════════════════════════════════════════════
     OPÉRATIONS CRUD
  ══════════════════════════════════════════════════════ */

  createRegion(data: any): Observable<Region> {
    return this.http.post<Region>(`${this.apiBase}/regions`, data).pipe(
      catchError(this.handleError<Region>('createRegion'))
    );
  }

  updateRegion(id: string, data: any): Observable<Region> {
    return this.http.put<Region>(`${this.apiBase}/regions/${id}`, data).pipe(
      catchError(this.handleError<Region>('updateRegion'))
    );
  }

  deleteRegion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/regions/${id}`).pipe(
      catchError(this.handleError<void>('deleteRegion'))
    );
  }

  createPrefecture(data: any): Observable<Prefecture> {
    return this.http.post<Prefecture>(`${this.apiBase}/prefectures`, data).pipe(
      catchError(this.handleError<Prefecture>('createPrefecture'))
    );
  }

  updatePrefecture(id: string, data: any): Observable<Prefecture> {
    return this.http.put<Prefecture>(`${this.apiBase}/prefectures/${id}`, data).pipe(
      catchError(this.handleError<Prefecture>('updatePrefecture'))
    );
  }

  deletePrefecture(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/prefectures/${id}`).pipe(
      catchError(this.handleError<void>('deletePrefecture'))
    );
  }

  createCommune(data: any): Observable<Commune> {
    return this.http.post<Commune>(`${this.apiBase}/communes`, data).pipe(
      catchError(this.handleError<Commune>('createCommune'))
    );
  }

  updateCommune(id: string, data: any): Observable<Commune> {
    return this.http.put<Commune>(`${this.apiBase}/communes/${id}`, data).pipe(
      catchError(this.handleError<Commune>('updateCommune'))
    );
  }

  deleteCommune(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/communes/${id}`).pipe(
      catchError(this.handleError<void>('deleteCommune'))
    );
  }

  createQuartier(data: any): Observable<Quartier> {
    return this.http.post<Quartier>(`${this.apiBase}/quartiers`, data).pipe(
      catchError(this.handleError<Quartier>('createQuartier'))
    );
  }

  updateQuartier(id: string, data: any): Observable<Quartier> {
    return this.http.put<Quartier>(`${this.apiBase}/quartiers/${id}`, data).pipe(
      catchError(this.handleError<Quartier>('updateQuartier'))
    );
  }

  deleteQuartier(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/quartiers/${id}`).pipe(
      catchError(this.handleError<void>('deleteQuartier'))
    );
  }

  createPays(data: any): Observable<Pays> {
    return this.http.post<Pays>(`${this.apiBase}/pays`, data).pipe(
      catchError(this.handleError<Pays>('createPays'))
    );
  }

  updatePays(id: string, data: any): Observable<Pays> {
    return this.http.put<Pays>(`${this.apiBase}/pays/${id}`, data).pipe(
      catchError(this.handleError<Pays>('updatePays'))
    );
  }

  deletePays(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/pays/${id}`).pipe(
      catchError(this.handleError<void>('deletePays'))
    );
  }

  createVille(data: any): Observable<Ville> {
    return this.http.post<Ville>(`${this.apiBase}/villes`, data).pipe(
      catchError(this.handleError<Ville>('createVille'))
    );
  }

  updateVille(id: string, data: any): Observable<Ville> {
    return this.http.put<Ville>(`${this.apiBase}/villes/${id}`, data).pipe(
      catchError(this.handleError<Ville>('updateVille'))
    );
  }

  deleteVille(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiBase}/villes/${id}`).pipe(
      catchError(this.handleError<void>('deleteVille'))
    );
  }

  /* ══════════════════════════════════════════════════════
     GESTION D'ÉTAT
  ══════════════════════════════════════════════════════ */

  updateState(partial: Partial<LocaliteState>): void {
    const current = this.stateSubject.value;
    this.stateSubject.next({ ...current, ...partial });
  }

  getCurrentState(): LocaliteState {
    return this.stateSubject.value;
  }

  setActiveTab(tab: 'admin' | 'monde'): void {
    this.updateState({ activeTab: tab });
  }

  toggleNodeExpanded(nodeId: string): void {
    const current = this.stateSubject.value;
    const newSet = new Set(current.expandedNodes);
    if (newSet.has(nodeId)) {
      newSet.delete(nodeId);
    } else {
      newSet.add(nodeId);
    }
    this.updateState({ expandedNodes: newSet });
  }

  /* ══════════════════════════════════════════════════════
     UTILITAIRES
  ══════════════════════════════════════════════════════ */

  private groupBy(array: any[], key: string): { [key: string]: any[] } {
    return array.reduce((result, item) => {
      const group = item[key] || 'unknown';
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  }

  private handleError<T = void>(operation = 'operation'): (error: HttpErrorResponse) => Observable<T> {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`❌ ${operation} échoué:`, error);
      return of(null as any as T);
    };
  }
}
