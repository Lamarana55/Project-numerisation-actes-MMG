import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Subject, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError, takeUntil } from 'rxjs/operators';
import { GeodataService } from '../services/geodata.service';
import { RegionDTO, PrefectureDTO, CommuneDTO } from '../models/geodata';

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

export interface MonthStat {
  mois:  string;
  actes: number;
}

// ─── Données mensuelles (statiques — à remplacer par un endpoint stats) ───────
const MONTHLY_DATA: MonthStat[] = [
  { mois: 'Avr 25', actes: 142 },
  { mois: 'Mai 25', actes: 168 },
  { mois: 'Jun 25', actes: 247 },
  { mois: 'Jul 25', actes: 289 },
  { mois: 'Aoû 25', actes: 234 },
  { mois: 'Sep 25', actes: 312 },
  { mois: 'Oct 25', actes: 347 },
  { mois: 'Nov 25', actes: 321 },
  { mois: 'Déc 25', actes: 218 },
  { mois: 'Jan 26', actes: 278 },
  { mois: 'Fév 26', actes: 356 },
  { mois: 'Mar 26', actes: 212 },
];

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

  // ─── Données géographiques chargées depuis l'API ──────────────────────────────
  apiRegions:     RegionStat[]  = [];
  allPrefData:    PrefData[]    = [];
  allApiCommunes: CommuneStat[] = [];
  private prefRegionMap = new Map<string, string>(); // prefCode → regionCode

  // ─── État de chargement ───────────────────────────────────────────────────────
  loadingData = false;

  // ─── Filtres ─────────────────────────────────────────────────────────────────
  selectedRegionCode = '';
  selectedPrefCode   = '';
  selectedComCode    = '';

  prefOptions: PrefData[]    = [];
  comOptions:  CommuneStat[] = [];

  // ─── KPIs ────────────────────────────────────────────────────────────────────
  totalActes  = 0;
  totalHommes = 0;
  totalFemmes = 0;
  tauxHommes  = 0;
  tauxFemmes  = 0;
  variation   = '+12.4';

  // ─── Données pour le template ────────────────────────────────────────────────
  filteredComs: CommuneStat[] = [];
  regionStats:  RegionStat[]  = [];

  // ─── Pagination ───────────────────────────────────────────────────────────────
  pageSize    = 10;
  currentPage = 0;

  get totalPages(): number {
    return Math.ceil(this.filteredComs.length / this.pageSize);
  }

  get pagedComs(): CommuneStat[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredComs.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  prevPage(): void { if (this.currentPage > 0) this.currentPage--; }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.currentPage++; }
  goToPage(p: number): void { this.currentPage = p; }

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
    labels: MONTHLY_DATA.map(m => m.mois),
    datasets: [
      {
        label: 'Actes numérisés & indexés',
        data: MONTHLY_DATA.map(m => m.actes),
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

  constructor(private geodataService: GeodataService) {}

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
      regions:  this.geodataService.getAllRegions(),
      communes: this.geodataService.getAllCommunes(),
    }).pipe(
      takeUntil(this.destroy$),
      switchMap(({ regions, communes }) => {
        if (!regions.length) {
          return of({ regions, communes, prefsByRegion: [] as { regionCode: string; prefs: PrefectureDTO[] }[] });
        }
        return forkJoin(
          regions.map(r =>
            this.geodataService.getPrefecturesByRegion(r.code).pipe(
              map(prefs => ({ regionCode: r.code, prefs })),
              catchError(() => of({ regionCode: r.code, prefs: [] as PrefectureDTO[] }))
            )
          )
        ).pipe(map(prefsByRegion => ({ regions, communes, prefsByRegion })));
      })
    ).subscribe({
      next: ({ regions, communes, prefsByRegion }) => {
        this.buildGeoTree(regions, prefsByRegion, communes);
        this.loadingData = false;
        this.computeAll();
      },
      error: () => { this.loadingData = false; },
    });
  }

  private buildGeoTree(
    regions: RegionDTO[],
    prefsByRegion: { regionCode: string; prefs: PrefectureDTO[] }[],
    communes: CommuneDTO[]
  ): void {
    // 1. Régions avec couleurs déterministes
    this.apiRegions = regions.map((r, i) => ({
      code:    r.code,
      nom:     r.nom,
      couleur: REGION_COLORS[i % REGION_COLORS.length],
      actes: 0, hommes: 0, femmes: 0,
    }));

    // 2. Map prefecture → region
    this.prefRegionMap.clear();
    prefsByRegion.forEach(({ regionCode, prefs }) => {
      prefs.forEach(p => this.prefRegionMap.set(p.code, regionCode));
    });

    // 3. Communes avec stats déterministes basées sur le code
    this.allApiCommunes = communes.map(c => {
      const stat = this.mockStat(c.code);
      return { code: c.code, nom: c.nom, prefectureCode: c.codePrefecture, ...stat };
    });

    // 4. Structure préfectures avec leurs communes
    this.allPrefData = prefsByRegion.flatMap(({ regionCode, prefs }) =>
      prefs.map(p => ({
        code:       p.code,
        nom:        p.nom,
        regionCode,
        coms:       this.allApiCommunes.filter(c => c.prefectureCode === p.code),
      }))
    );
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
    this.tauxFemmes = 100 - this.tauxHommes;

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
    }).sort((a, b) => b.actes - a.actes);
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

  // ═══════════════════════════════════════════════════════════════════════════
  // STATS DÉTERMINISTES (à remplacer par un endpoint /stats quand disponible)
  // ═══════════════════════════════════════════════════════════════════════════

  private mockStat(code: string): { actes: number; hommes: number; femmes: number } {
    const h = this.hashCode(code);
    const actes  = 20 + (h % 300);
    const tauxH  = 45 + (h % 11);   // entre 45 % et 55 %
    const hommes = Math.round(actes * tauxH / 100);
    return { actes, hommes, femmes: actes - hommes };
  }

  private hashCode(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  }
}
