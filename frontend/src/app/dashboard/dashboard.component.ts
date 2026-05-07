import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, takeUntil } from 'rxjs/operators';
import { GeodataService } from '../services/geodata.service';
import { DashboardService, StatistiquesDTO, MoisStatDTO } from '../services/dashboard.service';
import { AuthService } from '../services/auth.service';
import { RegionDTO, PrefectureDTO } from '../models/geodata';

// ─── Modèles internes ─────────────────────────────────────────────────────────
export interface CommuneStat {
  code:           string;
  nom:            string;
  prefectureCode: string;
  actes:          number;
  hommes:         number;
  femmes:         number;
}

export interface PrefData {
  code:       string;
  nom:        string;
  regionCode: string;
  coms:       CommuneStat[];
}

export interface RegionStat {
  code:    string;
  nom:     string;
  couleur: string;
  actes:   number;
  hommes:  number;
  femmes:  number;
}

// ─── Palette de couleurs par région ───────────────────────────────────────────
const REGION_COLORS = [
  '#4a8a4e', '#378ADD', '#EF9F27', '#9B59B6',
  '#16A085', '#E24B4A', '#E67E22', '#34495E',
  '#1ABC9C', '#D35400', '#2C3E50', '#8E44AD',
];

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // ─── Date ────────────────────────────────────────────────────────────────────
  today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ─── Données géographiques ────────────────────────────────────────────────────
  apiRegions:     RegionStat[]  = [];
  allPrefData:    PrefData[]    = [];
  allApiCommunes: CommuneStat[] = [];
  private prefRegionMap = new Map<string, string>();

  // ─── État de chargement ───────────────────────────────────────────────────────
  loadingData = false;

  // ─── Filtres ─────────────────────────────────────────────────────────────────
  selectedRegionCode = '';
  selectedPrefCode   = '';
  selectedComCode    = '';

  prefOptions: PrefData[]    = [];
  comOptions:  CommuneStat[] = [];

  // ─── KPIs ────────────────────────────────────────────────────────────────────
  totalActes     = 0;
  totalNaissance = 0;
  totalDeces     = 0;
  totalHommes    = 0;
  totalFemmes    = 0;
  totalValides   = 0;
  totalEnAttente = 0;
  totalRejetes   = 0;
  tauxHommes     = 0;
  tauxFemmes     = 0;
  variation      = '0.0';

  // ─── Données pour le template ────────────────────────────────────────────────
  filteredComs: CommuneStat[] = [];
  regionStats:  RegionStat[]  = [];

  // ─── Pagination ───────────────────────────────────────────────────────────────
  pageSize    = 10;
  currentPage = 0;

  get totalPages(): number { return Math.ceil(this.filteredComs.length / this.pageSize); }
  get pagedComs(): CommuneStat[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredComs.slice(start, start + this.pageSize);
  }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i); }
  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  goToPage(p: number): void { this.currentPage = p; }

  // ─── Visibilité des filtres selon le niveau administratif ─────────────────────
  get showRegionFilter(): boolean { return this.authService.isCentral; }
  get showPrefFilter(): boolean   { return this.authService.isCentral || this.authService.isRegional; }
  get showComFilter(): boolean    { return !this.authService.isCommunal; }

  // ── Graphique barres (communes) ───────────────────────────────────────────────
  barData: ChartData<'bar'> = { labels: [], datasets: [] };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Actes : ${Math.round(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 38 } },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 10 }, callback: v => Number(v).toLocaleString('fr-FR') },
      },
    },
  };

  // ── Graphique donut (H/F) ─────────────────────────────────────────────────────
  donutData: ChartData<'doughnut'> = {
    labels: ['Hommes', 'Femmes'],
    datasets: [{ data: [0, 0], backgroundColor: ['#378ADD', '#E24B4A'], borderWidth: 0, hoverOffset: 6 }],
  };

  donutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const tot = (this.donutData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const pct = tot > 0 ? Math.round((ctx.parsed / tot) * 100) : 0;
            return `${ctx.label} : ${Math.round(ctx.parsed).toLocaleString('fr-FR')} (${pct}%)`;
          },
        },
      },
    },
  };

  // ── Graphique ligne (évolution mensuelle) ─────────────────────────────────────
  lineData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Actes numérisés & indexés',
        data: [],
        borderColor: '#4a8a4e',
        backgroundColor: 'rgba(74,138,78,0.08)',
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2,
      },
    ],
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => `Actes : ${Math.round(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { size: 10 }, callback: v => Number(v).toLocaleString('fr-FR') },
      },
    },
  };

  constructor(
    private geodataService: GeodataService,
    private dashboardService: DashboardService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEMENT DES DONNÉES
  // ═══════════════════════════════════════════════════════════════════════════

  private loadData(): void {
    this.loadingData = true;

    forkJoin({
      stats:   this.dashboardService.getDashboardStats().pipe(catchError(() => of(null as StatistiquesDTO | null))),
      regions: this.geodataService.getAllRegions().pipe(catchError(() => of([] as RegionDTO[]))),
    }).pipe(
      takeUntil(this.destroy$),
      switchMap(({ stats, regions }) => {
        if (!regions.length) {
          return of({ stats, regions, prefsByRegion: [] as { regionCode: string; prefs: PrefectureDTO[] }[] });
        }
        return forkJoin(
          regions.map(r =>
            this.geodataService.getPrefecturesByRegion(r.code).pipe(
              map(prefs => ({ regionCode: r.code, prefs })),
              catchError(() => of({ regionCode: r.code, prefs: [] as PrefectureDTO[] }))
            )
          )
        ).pipe(map(prefsByRegion => ({ stats, regions, prefsByRegion })));
      })
    ).subscribe({
      next: ({ stats, regions, prefsByRegion }) => {
        this.buildFromStats(stats, regions, prefsByRegion);
        this.loadingData = false;
        this.computeAll();
      },
      error: () => { this.loadingData = false; },
    });
  }

  private buildFromStats(
    stats: StatistiquesDTO | null,
    regions: RegionDTO[],
    prefsByRegion: { regionCode: string; prefs: PrefectureDTO[] }[]
  ): void {
    // 1. Régions avec couleurs déterministes
    this.apiRegions = regions.map((r, i) => ({
      code: r.code, nom: r.nom,
      couleur: REGION_COLORS[i % REGION_COLORS.length],
      actes: 0, hommes: 0, femmes: 0,
    }));

    // 2. Map prefecture → region
    this.prefRegionMap.clear();
    prefsByRegion.forEach(({ regionCode, prefs }) =>
      prefs.forEach(p => this.prefRegionMap.set(p.code, regionCode))
    );

    // 3. Communes depuis les statistiques backend
    if (stats) {
      this.allApiCommunes = stats.parCommune.map(c => ({
        code:           c.codeCommune,
        nom:            c.nomCommune,
        prefectureCode: c.codePrefecture,
        actes:          c.actes,
        hommes:         c.hommes,
        femmes:         c.femmes,
      }));
      this.totalNaissance = stats.totalNaissance;
      this.totalDeces     = stats.totalDeces;
      this.totalValides   = stats.totalValides;
      this.totalEnAttente = stats.totalEnAttente;
      this.totalRejetes   = stats.totalRejetes;
      this.updateLineChart(stats.parMois);
      this.computeVariation(stats.parMois);
    } else {
      this.allApiCommunes = [];
    }

    // 4. Structure préfectures (seulement celles présentes dans les données)
    const prefCodesInData = new Set(this.allApiCommunes.map(c => c.prefectureCode));
    this.allPrefData = prefsByRegion.flatMap(({ regionCode, prefs }) =>
      prefs
        .filter(p => prefCodesInData.has(p.code))
        .map(p => ({
          code:       p.code,
          nom:        p.nom,
          regionCode,
          coms:       this.allApiCommunes.filter(c => c.prefectureCode === p.code),
        }))
    );

    // 5. Pré-remplir les options de filtre pour les niveaux non-CENTRAL
    this.initFiltersForNiveau();
  }

  private initFiltersForNiveau(): void {
    const niveau = this.authService.niveauAdministratif;
    if (niveau === 'REGIONAL') {
      this.prefOptions = this.allPrefData;
    } else if (niveau === 'PREFECTORAL') {
      this.comOptions = this.allApiCommunes;
    }
  }

  private updateLineChart(parMois: MoisStatDTO[]): void {
    this.lineData = {
      labels: parMois.map(m => m.label),
      datasets: [
        {
          label: 'Actes numérisés & indexés',
          data: parMois.map(m => m.actes),
          borderColor: '#4a8a4e',
          backgroundColor: 'rgba(74,138,78,0.08)',
          fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2,
        },
      ],
    };
  }

  private computeVariation(parMois: MoisStatDTO[]): void {
    if (parMois.length < 2) { this.variation = '0.0'; return; }
    const curr = parMois[parMois.length - 1].actes;
    const prev = parMois[parMois.length - 2].actes;
    if (prev === 0) { this.variation = curr > 0 ? '+100.0' : '0.0'; return; }
    const pct = ((curr - prev) / prev) * 100;
    this.variation = (pct >= 0 ? '+' : '') + pct.toFixed(1);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTRES
  // ═══════════════════════════════════════════════════════════════════════════

  onRegionChange(): void {
    this.selectedPrefCode = '';
    this.selectedComCode  = '';
    this.prefOptions = this.selectedRegionCode
      ? this.allPrefData.filter(p => p.regionCode === this.selectedRegionCode)
      : [];
    this.comOptions = [];
    this.computeAll();
  }

  onPrefChange(): void {
    this.selectedComCode = '';
    const pref = this.allPrefData.find(p => p.code === this.selectedPrefCode);
    this.comOptions = pref?.coms ?? [];
    this.computeAll();
  }

  onComChange(): void {
    this.computeAll();
  }

  resetFilters(): void {
    this.selectedRegionCode = '';
    this.selectedPrefCode   = '';
    this.selectedComCode    = '';
    this.prefOptions        = [];
    this.comOptions         = [];
    this.initFiltersForNiveau();
    this.computeAll();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCUL
  // ═══════════════════════════════════════════════════════════════════════════

  private getFilteredComs(): CommuneStat[] {
    if (this.selectedComCode) {
      return this.allApiCommunes.filter(c => c.code === this.selectedComCode);
    }
    if (this.selectedPrefCode) {
      return this.allApiCommunes.filter(c => c.prefectureCode === this.selectedPrefCode);
    }
    if (this.selectedRegionCode) {
      const prefCodes = new Set(
        this.allPrefData
          .filter(p => p.regionCode === this.selectedRegionCode)
          .map(p => p.code)
      );
      return this.allApiCommunes.filter(c => prefCodes.has(c.prefectureCode));
    }
    return this.allApiCommunes;
  }

  private computeAll(): void {
    const coms = this.getFilteredComs();
    this.filteredComs = [...coms].sort((a, b) => b.actes - a.actes);
    this.currentPage  = 0;

    this.totalActes  = coms.reduce((s, c) => s + c.actes,  0);
    this.totalHommes = coms.reduce((s, c) => s + c.hommes, 0);
    this.totalFemmes = coms.reduce((s, c) => s + c.femmes, 0);

    const total = this.totalHommes + this.totalFemmes;
    this.tauxHommes = total > 0 ? Math.round((this.totalHommes / total) * 100) : 0;
    this.tauxFemmes = total > 0 ? (100 - this.tauxHommes) : 0;

    this.updateRegionStats();
    this.updateBarChart(coms);
    this.updateDonut();
  }

  private updateBarChart(coms: CommuneStat[]): void {
    const top = [...coms].sort((a, b) => b.actes - a.actes).slice(0, 10);
    this.barData = {
      labels: top.map(c => c.nom),
      datasets: [{
        label: 'Actes',
        data:  top.map(c => c.actes),
        backgroundColor: top.map(c => this.getRegionColor(c)),
        borderRadius: 4,
        borderSkipped: false,
      }],
    };
  }

  private updateDonut(): void {
    this.donutData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [{ data: [this.totalHommes, this.totalFemmes], backgroundColor: ['#378ADD', '#E24B4A'], borderWidth: 0, hoverOffset: 6 }],
    };
  }

  private updateRegionStats(): void {
    const regions = this.selectedRegionCode
      ? this.apiRegions.filter(r => r.code === this.selectedRegionCode)
      : this.apiRegions;

    this.regionStats = regions.map(r => {
      const prefCodes = new Set(
        this.allPrefData.filter(p => p.regionCode === r.code).map(p => p.code)
      );
      const coms = this.allApiCommunes.filter(c => prefCodes.has(c.prefectureCode));
      return {
        ...r,
        actes:  coms.reduce((s, c) => s + c.actes,  0),
        hommes: coms.reduce((s, c) => s + c.hommes, 0),
        femmes: coms.reduce((s, c) => s + c.femmes, 0),
      };
    }).filter(r => r.actes > 0).sort((a, b) => b.actes - a.actes);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS TEMPLATE
  // ═══════════════════════════════════════════════════════════════════════════

  getRegionColor(com: CommuneStat): string {
    const regionCode = this.prefRegionMap.get(com.prefectureCode);
    return this.apiRegions.find(r => r.code === regionCode)?.couleur ?? '#9ca3af';
  }

  tauxHF(r: RegionStat): number {
    const tot = r.hommes + r.femmes;
    return tot > 0 ? Math.round((r.hommes / tot) * 100) : 0;
  }

  fmt(v: number): string {
    return Math.round(v).toLocaleString('fr-FR');
  }

  pct(a: number, b: number): number {
    return b > 0 ? Math.round((a / b) * 100) : 0;
  }

  get activeFilterCount(): number {
    return [this.selectedRegionCode, this.selectedPrefCode, this.selectedComCode]
      .filter(v => !!v).length;
  }

  get filterLabel(): string {
    const parts: string[] = [];
    if (this.selectedRegionCode)
      parts.push(this.apiRegions.find(r => r.code === this.selectedRegionCode)?.nom ?? '');
    if (this.selectedPrefCode)
      parts.push(this.allPrefData.find(p => p.code === this.selectedPrefCode)?.nom ?? '');
    if (this.selectedComCode)
      parts.push(this.allApiCommunes.find(c => c.code === this.selectedComCode)?.nom ?? '');
    return parts.join(' › ');
  }
}
