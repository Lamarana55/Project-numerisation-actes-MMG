import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { DashboardService, StatistiquesDTO, CommuneStatDTO, MoisStatDTO } from '../services/dashboard.service';
import { GeodataService } from '../services/geodata.service';
import { AuthService } from '../services/auth.service';
import { RegionDTO, PrefectureDTO } from '../models/geodata';

export type PeriodKey = 'mois' | '3mois' | '6mois' | 'annee' | 'custom';

interface PrefData { code: string; nom: string; regionCode: string; }

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.css'],
  providers: [provideCharts(withDefaultRegisterables())],
})
export class RapportsComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  // ── Period ────────────────────────────────────────────────────────────────
  selectedPeriod: PeriodKey = 'annee';
  customDateDebut = '';
  customDateFin   = '';
  periodLabel     = '';

  readonly periods: { key: PeriodKey; label: string }[] = [
    { key: 'mois',   label: 'Ce mois' },
    { key: '3mois',  label: '3 mois'  },
    { key: '6mois',  label: '6 mois'  },
    { key: 'annee',  label: 'Cette année' },
    { key: 'custom', label: 'Personnalisé' },
  ];

  // ── Territory filters ─────────────────────────────────────────────────────
  allRegions:  RegionDTO[]  = [];
  allPrefData: PrefData[]   = [];
  allCommunes: CommuneStatDTO[] = [];

  selectedRegionCode = '';
  selectedPrefCode   = '';
  selectedComCode    = '';

  prefOptions: PrefData[]       = [];
  comOptions:  CommuneStatDTO[] = [];

  // ── State ─────────────────────────────────────────────────────────────────
  loading    = false;
  geoLoading = false;

  // ── KPIs ─────────────────────────────────────────────────────────────────
  totalActes      = 0;
  totalNaissance  = 0;
  totalDeces      = 0;
  totalValides    = 0;
  totalEnAttente  = 0;
  totalRejetes    = 0;
  totalHommes     = 0;
  totalFemmes     = 0;
  naissanceHommes = 0;
  naissanceFemmes = 0;
  decesHommes     = 0;
  decesFemmes     = 0;

  // ── Table ────────────────────────────────────────────────────────────────
  tableData: CommuneStatDTO[] = [];
  tableSort: keyof CommuneStatDTO = 'actes';
  tableSortAsc = false;
  tablePage    = 0;
  tablePageSize = 15;

  get tablePages(): number[] { return Array.from({ length: Math.ceil(this.tableData.length / this.tablePageSize) }, (_, i) => i); }
  get pagedTable(): CommuneStatDTO[] {
    const s = this.tablePage * this.tablePageSize;
    return this.tableData.slice(s, s + this.tablePageSize);
  }

  // ── Charts ────────────────────────────────────────────────────────────────
  @ViewChild('lineChart') lineChartRef!: BaseChartDirective;
  @ViewChild('barChart')  barChartRef!:  BaseChartDirective;
  @ViewChild('statutChart') statutChartRef!: BaseChartDirective;
  @ViewChild('sexeChart')   sexeChartRef!:   BaseChartDirective;

  lineData: ChartData<'line'> = { labels: [], datasets: [] };
  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${Math.round(ctx.parsed.y ?? 0).toLocaleString('fr-FR')}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 11 }, callback: v => Number(v).toLocaleString('fr-FR') }, beginAtZero: true },
    },
  };

  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label} : ${Math.round(ctx.parsed.x ?? 0).toLocaleString('fr-FR')}` } },
    },
    scales: {
      x: { stacked: true, grid: { color: 'rgba(0,0,0,0.06)' }, ticks: { font: { size: 11 }, callback: v => Number(v).toLocaleString('fr-FR') }, beginAtZero: true },
      y: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  };

  statutData: ChartData<'doughnut'> = {
    labels: ['Validés', 'En attente', 'Rejetés'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#1565c0', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 6 }],
  };
  statutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const tot = (this.statutData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const pct = tot > 0 ? Math.round((ctx.parsed / tot) * 100) : 0;
            return ` ${ctx.label} : ${Math.round(ctx.parsed).toLocaleString('fr-FR')} (${pct}%)`;
          },
        },
      },
    },
  };

  sexeData: ChartData<'doughnut'> = {
    labels: ['Hommes', 'Femmes'],
    datasets: [{ data: [0, 0], backgroundColor: ['#1976d2', '#e91e8c'], borderWidth: 0, hoverOffset: 6 }],
  };
  sexeOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false, cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: ctx => {
            const tot = (this.sexeData.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
            const pct = tot > 0 ? Math.round((ctx.parsed / tot) * 100) : 0;
            return ` ${ctx.label} : ${Math.round(ctx.parsed).toLocaleString('fr-FR')} (${pct}%)`;
          },
        },
      },
    },
  };

  // ── Filter visibility ─────────────────────────────────────────────────────
  get showRegionFilter(): boolean { return this.authService.isCentral; }
  get showPrefFilter(): boolean   { return this.authService.isCentral || this.authService.isRegional; }
  get showComFilter(): boolean    { return !this.authService.isCommunal; }

  constructor(
    private dashboardService: DashboardService,
    private geodataService:   GeodataService,
    private authService:      AuthService,
  ) {}

  ngOnInit(): void {
    this.initCustomDates();
    this.geoLoading = true;
    this.geodataService.getAllRegions().pipe(
      catchError(() => of([] as RegionDTO[])),
      takeUntil(this.destroy$)
    ).subscribe(regions => {
      this.allRegions = regions;
      if (regions.length) {
        forkJoin(regions.map(r =>
          this.geodataService.getPrefecturesByRegion(r.code).pipe(
            catchError(() => of([] as PrefectureDTO[]))
          )
        )).pipe(takeUntil(this.destroy$)).subscribe(prefLists => {
          prefLists.forEach((prefs, i) =>
            prefs.forEach(p => this.allPrefData.push({ code: p.code, nom: p.nom, regionCode: regions[i].code }))
          );
          this.geoLoading = false;
          this.initFiltersForNiveau();
          this.loadRapport();
        });
      } else {
        this.geoLoading = false;
        this.loadRapport();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERIOD
  // ═══════════════════════════════════════════════════════════════════════════

  private initCustomDates(): void {
    const now  = new Date();
    const y    = now.getFullYear();
    this.customDateDebut = `${y}-01-01`;
    this.customDateFin   = now.toISOString().split('T')[0];
  }

  selectPeriod(p: PeriodKey): void {
    this.selectedPeriod = p;
    if (p !== 'custom') this.loadRapport();
  }

  applyCustomPeriod(): void {
    if (this.customDateDebut && this.customDateFin) this.loadRapport();
  }

  private computeDateRange(): { dateDebut: string; dateFin: string } {
    const now = new Date();
    const fmt  = (d: Date) => d.toISOString().split('T')[0];

    switch (this.selectedPeriod) {
      case 'mois': {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        return { dateDebut: fmt(first), dateFin: fmt(now) };
      }
      case '3mois': {
        const d = new Date(now); d.setMonth(d.getMonth() - 3);
        return { dateDebut: fmt(d), dateFin: fmt(now) };
      }
      case '6mois': {
        const d = new Date(now); d.setMonth(d.getMonth() - 6);
        return { dateDebut: fmt(d), dateFin: fmt(now) };
      }
      case 'annee': {
        return { dateDebut: `${now.getFullYear()}-01-01`, dateFin: fmt(now) };
      }
      case 'custom':
        return { dateDebut: this.customDateDebut, dateFin: this.customDateFin };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════════════════════

  loadRapport(): void {
    const { dateDebut, dateFin } = this.computeDateRange();
    this.periodLabel = this.buildPeriodLabel(dateDebut, dateFin);
    this.loading = true;

    this.dashboardService.getRapport(dateDebut, dateFin).pipe(
      catchError(() => of(null as StatistiquesDTO | null)),
      takeUntil(this.destroy$)
    ).subscribe(stats => {
      this.loading = false;
      if (stats) this.buildFromStats(stats);
    });
  }

  private buildFromStats(stats: StatistiquesDTO): void {
    this.totalActes      = stats.totalActes;
    this.totalNaissance  = stats.totalNaissance;
    this.totalDeces      = stats.totalDeces;
    this.totalValides    = stats.totalValides;
    this.totalEnAttente  = stats.totalEnAttente;
    this.totalRejetes    = stats.totalRejetes;
    this.totalHommes     = stats.totalHommes;
    this.totalFemmes     = stats.totalFemmes;
    this.naissanceHommes = stats.naissanceHommes ?? 0;
    this.naissanceFemmes = stats.naissanceFemmes ?? 0;
    this.decesHommes     = stats.decesHommes ?? 0;
    this.decesFemmes     = stats.decesFemmes ?? 0;

    this.allCommunes = stats.parCommune;
    this.refreshTableAndCharts(stats.parMois);
  }

  private refreshTableAndCharts(parMois: MoisStatDTO[]): void {
    this.tableData  = this.getFilteredCommunes();
    this.tablePage  = 0;
    this.updateLineChart(parMois);
    this.updateBarChart();
    this.updateStatutChart();
    this.updateSexeChart();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTERS
  // ═══════════════════════════════════════════════════════════════════════════

  private initFiltersForNiveau(): void {
    const n = this.authService.niveauAdministratif;
    if (n === 'REGIONAL')   this.prefOptions = this.allPrefData;
    if (n === 'PREFECTORAL') this.comOptions = this.allCommunes;
  }

  onRegionChange(): void {
    this.selectedPrefCode = '';
    this.selectedComCode  = '';
    this.prefOptions = this.selectedRegionCode
      ? this.allPrefData.filter(p => p.regionCode === this.selectedRegionCode) : [];
    this.comOptions  = [];
    this.applyFiltersLocally();
  }

  onPrefChange(): void {
    this.selectedComCode = '';
    this.comOptions = this.selectedPrefCode
      ? this.allCommunes.filter(c => c.codePrefecture === this.selectedPrefCode) : [];
    this.applyFiltersLocally();
  }

  onComChange(): void {
    this.applyFiltersLocally();
  }

  resetFilters(): void {
    this.selectedRegionCode = '';
    this.selectedPrefCode   = '';
    this.selectedComCode    = '';
    this.prefOptions        = [];
    this.comOptions         = [];
    this.initFiltersForNiveau();
    this.applyFiltersLocally();
  }

  private applyFiltersLocally(): void {
    this.tableData = this.getFilteredCommunes();
    this.tablePage = 0;
    this.updateBarChart();
    const h = this.tableData.reduce((s, c) => s + c.hommes, 0);
    const f = this.tableData.reduce((s, c) => s + c.femmes, 0);
    this.sexeData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [{ data: [h, f], backgroundColor: ['#1976d2', '#e91e8c'], borderWidth: 0, hoverOffset: 6 }],
    };
  }

  private getFilteredCommunes(): CommuneStatDTO[] {
    let coms = this.allCommunes;
    if (this.selectedComCode)    return coms.filter(c => c.codeCommune === this.selectedComCode);
    if (this.selectedPrefCode)   return coms.filter(c => c.codePrefecture === this.selectedPrefCode);
    if (this.selectedRegionCode) {
      const prefCodes = new Set(
        this.allPrefData.filter(p => p.regionCode === this.selectedRegionCode).map(p => p.code)
      );
      return coms.filter(c => prefCodes.has(c.codePrefecture));
    }
    return coms;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHARTS
  // ═══════════════════════════════════════════════════════════════════════════

  private updateLineChart(parMois: MoisStatDTO[]): void {
    this.lineData = {
      labels: parMois.map(m => m.label),
      datasets: [
        {
          label: 'Naissances',
          data:  parMois.map(m => m.naissances ?? 0),
          borderColor: '#1565c0', backgroundColor: 'rgba(21,101,192,0.08)',
          fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2,
        },
        {
          label: 'Décès',
          data:  parMois.map(m => m.deces ?? 0),
          borderColor: '#c62828', backgroundColor: 'rgba(198,40,40,0.05)',
          fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6, borderWidth: 2,
        },
      ],
    };
  }

  private updateBarChart(): void {
    const top = [...this.tableData].sort((a, b) => b.actes - a.actes).slice(0, 10);
    this.barData = {
      labels: top.map(c => c.nomCommune),
      datasets: [
        { label: 'Naissances', data: top.map(c => c.naissance), backgroundColor: 'rgba(21,101,192,0.75)', borderRadius: 3, borderSkipped: false },
        { label: 'Décès',      data: top.map(c => c.deces),     backgroundColor: 'rgba(198,40,40,0.65)',  borderRadius: 3, borderSkipped: false },
      ],
    };
  }

  private updateStatutChart(): void {
    this.statutData = {
      labels: ['Validés', 'En attente', 'Rejetés'],
      datasets: [{ data: [this.totalValides, this.totalEnAttente, this.totalRejetes],
                   backgroundColor: ['#1565c0', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 6 }],
    };
  }

  private updateSexeChart(): void {
    this.sexeData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [{ data: [this.totalHommes, this.totalFemmes],
                   backgroundColor: ['#1976d2', '#e91e8c'], borderWidth: 0, hoverOffset: 6 }],
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE SORT
  // ═══════════════════════════════════════════════════════════════════════════

  sortTable(col: keyof CommuneStatDTO): void {
    if (this.tableSort === col) {
      this.tableSortAsc = !this.tableSortAsc;
    } else {
      this.tableSort    = col;
      this.tableSortAsc = false;
    }
    const asc = this.tableSortAsc ? 1 : -1;
    this.tableData = [...this.tableData].sort((a, b) => {
      const va = a[col] as number | string;
      const vb = b[col] as number | string;
      return va < vb ? -asc : va > vb ? asc : 0;
    });
    this.tablePage = 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTS
  // ═══════════════════════════════════════════════════════════════════════════

  exportChartPng(ref: BaseChartDirective, filename: string): void {
    const canvas = ref?.chart?.canvas as HTMLCanvasElement | undefined;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href     = canvas.toDataURL('image/png');
    link.download = `${filename}_${this.periodLabel}.png`;
    link.click();
  }

  exportCsv(): void {
    const bom  = '﻿';
    const sep  = ';';
    const head = ['Commune', 'Code commune', 'Naissances', 'Décès', 'Total actes', 'Hommes', 'Femmes'].join(sep);
    const rows = this.tableData.map(c =>
      [c.nomCommune, c.codeCommune, c.naissance, c.deces, c.actes, c.hommes, c.femmes].join(sep)
    );
    const csv  = bom + [head, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `rapport_ravec_${this.periodLabel}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportPdf(): void {
    window.print();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  fmt(v: number): string {
    return Math.round(v).toLocaleString('fr-FR');
  }

  pct(a: number, b: number): number {
    return b > 0 ? Math.round((a / b) * 100) : 0;
  }

  tauxH(): number { return this.pct(this.totalHommes, this.totalHommes + this.totalFemmes); }
  tauxF(): number { return this.pct(this.totalFemmes, this.totalHommes + this.totalFemmes); }

  tauxValidation(): number { return this.pct(this.totalValides, this.totalActes); }

  private buildPeriodLabel(dateDebut: string, dateFin: string): string {
    const fmtDate = (s: string) => {
      const [y, m, d] = s.split('-');
      return `${d}/${m}/${y}`;
    };
    return `${fmtDate(dateDebut)}_au_${fmtDate(dateFin)}`;
  }

  get activePeriodLabel(): string {
    const p = this.periods.find(x => x.key === this.selectedPeriod);
    return p?.label ?? '';
  }

  get hasFilters(): boolean {
    return !!(this.selectedRegionCode || this.selectedPrefCode || this.selectedComCode);
  }
}
