import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Subject } from 'rxjs';
import { GeodataService } from '../services/geodata.service';
import { RegionDTO, PrefectureDTO, CommuneDTO } from '../models/geodata';

// ─── Modèles ──────────────────────────────────────────────────────────────────
export interface CommuneStat {
  nom:     string;
  actes:   number;  // numérisés ET indexés en même temps
  hommes:  number;
  femmes:  number;
}

export interface PrefMock {
  id:       string;
  nom:      string;
  regionId: string;
  coms:     CommuneStat[];
}

export interface RegionStat {
  id:      string;
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

// ─── Données mock  (à remplacer par DashboardService) ─────────────────────────
const MOCK_REGIONS_META: Omit<RegionStat, 'actes' | 'hommes' | 'femmes'>[] = [
  { id: 'conakry',   nom: 'Conakry',   couleur: '#4a8a4e' },
  { id: 'kindia',    nom: 'Kindia',    couleur: '#378ADD' },
  { id: 'labe',      nom: 'Labé',      couleur: '#EF9F27' },
  { id: 'mamou',     nom: 'Mamou',     couleur: '#9B59B6' },
  { id: 'faranah',   nom: 'Faranah',   couleur: '#16A085' },
  { id: 'kankan',    nom: 'Kankan',    couleur: '#E24B4A' },
  { id: 'nzerekore', nom: 'Nzérékoré', couleur: '#E67E22' },
  { id: 'boke',      nom: 'Boké',      couleur: '#34495E' },
];

const MOCK_PREFS: PrefMock[] = [
  { id: 'cnk', nom: 'Conakry',     regionId: 'conakry', coms: [
    { nom: 'Kaloum',  actes: 347, hommes: 183, femmes: 164 },
    { nom: 'Ratoma',  actes: 281, hommes: 149, femmes: 132 },
    { nom: 'Dixinn',  actes: 238, hommes: 126, femmes: 112 },
    { nom: 'Matam',   actes: 214, hommes: 113, femmes: 101 },
    { nom: 'Matoto',  actes: 185, hommes:  98, femmes:  87 },
  ]},
  { id: 'knd', nom: 'Kindia',      regionId: 'kindia', coms: [
    { nom: 'Kindia',  actes: 125, hommes:  66, femmes:  59 },
    { nom: 'Coyah',   actes:  74, hommes:  39, femmes:  35 },
    { nom: 'Dubréka', actes:  59, hommes:  31, femmes:  28 },
  ]},
  { id: 'frc', nom: 'Forécariah',  regionId: 'kindia', coms: [
    { nom: 'Forécariah', actes: 50, hommes: 26, femmes: 24 },
    { nom: 'Télimélé',   actes: 42, hommes: 22, femmes: 20 },
  ]},
  { id: 'lbe', nom: 'Labé',        regionId: 'labe', coms: [
    { nom: 'Labé',    actes:  94, hommes: 50, femmes: 44 },
    { nom: 'Lélouma', actes:  39, hommes: 21, femmes: 18 },
  ]},
  { id: 'mli', nom: 'Mali',        regionId: 'labe', coms: [
    { nom: 'Mali',   actes: 51, hommes: 27, femmes: 24 },
    { nom: 'Koubia', actes: 35, hommes: 18, femmes: 17 },
  ]},
  { id: 'mmou', nom: 'Mamou',      regionId: 'mamou', coms: [
    { nom: 'Mamou',  actes: 71, hommes: 38, femmes: 33 },
    { nom: 'Dalaba', actes: 43, hommes: 23, femmes: 20 },
    { nom: 'Pita',   actes: 50, hommes: 26, femmes: 24 },
  ]},
  { id: 'frn', nom: 'Faranah',     regionId: 'faranah', coms: [
    { nom: 'Faranah',     actes: 71, hommes: 38, femmes: 33 },
    { nom: 'Kissidougou', actes: 62, hommes: 33, femmes: 29 },
  ]},
  { id: 'dng', nom: 'Dinguiraye',  regionId: 'faranah', coms: [
    { nom: 'Dinguiraye', actes: 39, hommes: 21, femmes: 18 },
    { nom: 'Dabola',     actes: 49, hommes: 26, femmes: 23 },
  ]},
  { id: 'kkn', nom: 'Kankan',      regionId: 'kankan', coms: [
    { nom: 'Kankan',    actes: 122, hommes: 65, femmes: 57 },
    { nom: 'Kérouané',  actes:  63, hommes: 33, femmes: 30 },
    { nom: 'Kouroussa', actes:  50, hommes: 26, femmes: 24 },
  ]},
  { id: 'sig', nom: 'Siguiri',     regionId: 'kankan', coms: [
    { nom: 'Siguiri',  actes: 71, hommes: 38, femmes: 33 },
    { nom: 'Mandiana', actes: 50, hommes: 26, femmes: 24 },
  ]},
  { id: 'nzk', nom: 'Nzérékoré',  regionId: 'nzerekore', coms: [
    { nom: 'Nzérékoré', actes: 107, hommes: 57, femmes: 50 },
    { nom: 'Lola',      actes:  57, hommes: 30, femmes: 27 },
    { nom: 'Yomou',     actes:  36, hommes: 19, femmes: 17 },
  ]},
  { id: 'mct', nom: 'Macenta',     regionId: 'nzerekore', coms: [
    { nom: 'Macenta',  actes: 71, hommes: 38, femmes: 33 },
    { nom: 'Guékédou', actes: 62, hommes: 33, femmes: 29 },
    { nom: 'Beyla',    actes: 42, hommes: 22, femmes: 20 },
  ]},
  { id: 'bke', nom: 'Boké',        regionId: 'boke', coms: [
    { nom: 'Boké',  actes: 71, hommes: 38, femmes: 33 },
    { nom: 'Boffa', actes: 50, hommes: 26, femmes: 24 },
    { nom: 'Fria',  actes: 42, hommes: 22, femmes: 20 },
  ]},
  { id: 'gao', nom: 'Gaoual',      regionId: 'boke', coms: [
    { nom: 'Gaoual',   actes: 35, hommes: 18, femmes: 17 },
    { nom: 'Koundara', actes: 29, hommes: 15, femmes: 14 },
  ]},
];

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

  // ─── Filtres ─────────────────────────────────────────────────────────────────
  selectedRegionId = '';
  selectedPrefId   = '';
  selectedComNom   = '';

  prefOptions: PrefMock[]    = [];
  comOptions:  CommuneStat[] = [];

  get regionOptions() { return MOCK_REGIONS_META; }

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
      y: { grid: { color: 'rgba(0,0,0,0.06)' },
           ticks: { font: { size: 10 }, callback: v => Number(v).toLocaleString('fr-FR') } },
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
      y: { grid: { color: 'rgba(0,0,0,0.06)' },
           ticks: { font: { size: 10 }, callback: v => Number(v).toLocaleString('fr-FR') } },
    },
  };

  constructor(private geodataService: GeodataService) {}

  ngOnInit(): void {
    this.computeAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FILTRES
  // ═══════════════════════════════════════════════════════════════════════════

  onRegionChange(): void {
    this.selectedPrefId = '';
    this.selectedComNom = '';
    this.prefOptions = this.selectedRegionId
      ? MOCK_PREFS.filter(p => p.regionId === this.selectedRegionId)
      : [];
    this.comOptions = [];
    this.computeAll();
  }

  onPrefChange(): void {
    this.selectedComNom = '';
    const pref = MOCK_PREFS.find(p => p.id === this.selectedPrefId);
    this.comOptions = pref ? pref.coms : [];
    this.computeAll();
  }

  onComChange(): void {
    this.computeAll();
  }

  resetFilters(): void {
    this.selectedRegionId = '';
    this.selectedPrefId   = '';
    this.selectedComNom   = '';
    this.prefOptions      = [];
    this.comOptions       = [];
    this.computeAll();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCUL
  // ═══════════════════════════════════════════════════════════════════════════

  private getFilteredComs(): CommuneStat[] {
    if (this.selectedComNom) {
      const c = this.getAllComs().find(c => c.nom === this.selectedComNom);
      return c ? [c] : [];
    }
    if (this.selectedPrefId) {
      return MOCK_PREFS.find(p => p.id === this.selectedPrefId)?.coms ?? [];
    }
    if (this.selectedRegionId) {
      return MOCK_PREFS.filter(p => p.regionId === this.selectedRegionId).flatMap(p => p.coms);
    }
    return this.getAllComs();
  }

  private getAllComs(): CommuneStat[] {
    return MOCK_PREFS.flatMap(p => p.coms);
  }

  private computeAll(): void {
    const coms = this.getFilteredComs();
    this.filteredComs = [...coms].sort((a, b) => b.actes - a.actes);

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
      datasets: [
        {
          label: 'Actes',
          data: top.map(c => c.actes),
          backgroundColor: top.map(c => {
            // coloration par région
            const pref = MOCK_PREFS.find(p => p.coms.some(x => x.nom === c.nom));
            const meta = MOCK_REGIONS_META.find(r => r.id === pref?.regionId);
            return meta?.couleur ?? '#4a8a4e';
          }),
          borderRadius: 4,
          borderSkipped: false,
        },
      ],
    };
  }

  private updateDonut(): void {
    this.donutData = {
      labels: ['Hommes', 'Femmes'],
      datasets: [{ data: [this.totalHommes, this.totalFemmes], backgroundColor: ['#378ADD', '#E24B4A'], borderWidth: 0, hoverOffset: 6 }],
    };
  }

  private updateRegionStats(): void {
    const regs = this.selectedRegionId
      ? MOCK_REGIONS_META.filter(r => r.id === this.selectedRegionId)
      : MOCK_REGIONS_META;

    this.regionStats = regs.map(r => {
      const coms = MOCK_PREFS.filter(p => p.regionId === r.id).flatMap(p => p.coms);
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

  get filterLabel(): string {
    const parts: string[] = [];
    if (this.selectedRegionId) parts.push(MOCK_REGIONS_META.find(r => r.id === this.selectedRegionId)?.nom ?? '');
    if (this.selectedPrefId)   parts.push(MOCK_PREFS.find(p => p.id === this.selectedPrefId)?.nom ?? '');
    if (this.selectedComNom)   parts.push(this.selectedComNom);
    return parts.join(' › ');
  }
}
