import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { AuthService }       from '../../services/auth.service';
import { ToastService }      from '../../services/toast.service';
import { ValidBirthService } from '../../services/valid-birth.service';
import { GeodataService }    from '../../services/geodata.service';
import {
  ValidBirth,
  ValidationStatut,
  STATUT_LABELS,
  STATUT_COLORS,
  STATUT_ICONS,
} from '../../models/valid-birth.model';
import {
  PaysDTO, RegionDTO, PrefectureDTO, CommuneDTO, VilleDTO
} from '../../models/geodata';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';

/** Code ISO-3 de la Guinée — seul pays pour lequel on affiche la cascade Région/Préfecture/Commune */
const CODE_GUINEE = 'GIN';

@Component({
  selector: 'app-valid-birth-list',
  templateUrl: './valid-birth-list.component.html',
  styleUrls: ['./valid-birth-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidBirthListComponent implements OnInit, OnDestroy {

  private readonly service  = inject(ValidBirthService);
  private readonly toast    = inject(ToastService);
  private readonly dialog   = inject(MatDialog);
  private readonly cdr      = inject(ChangeDetectorRef);
  private readonly geodata  = inject(GeodataService);
  readonly authService      = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  // ── Données actes ────────────────────────────────────────────────────────
  actes: ValidBirth[] = [];
  loading = false;
  error: string | null = null;

  // ── Filtres texte (envoyés à l'API) ─────────────────────────────────────
  selectedStatut: ValidationStatut | '' = '';
  filterRegion     = '';
  filterPrefecture = '';
  filterCommune    = '';
  searchControl    = new FormControl('');

  // ── Filtres géographiques cascade ────────────────────────────────────────
  filterPays           = CODE_GUINEE;   // code ISO-3 du pays sélectionné
  filterVille          = '';            // ville saisie (pays étranger)
  selectedRegionCode   = '';            // code région → charge préfectures
  selectedPrefCode     = '';            // code préfecture → charge communes
  selectedCommuneCode  = '';            // code commune sélectionnée

  // ── Listes géographiques ─────────────────────────────────────────────────
  pays:        PaysDTO[]        = [];
  regions:     RegionDTO[]      = [];
  prefectures: PrefectureDTO[]  = [];
  communes:    CommuneDTO[]     = [];
  villes:      VilleDTO[]       = [];
  loadingGeo   = false;

  // ── Pagination ────────────────────────────────────────────────────────────
  totalElements   = 0;
  totalPages      = 0;
  currentPage     = 0;
  pageSize        = 25;
  pageSizeOptions = [10, 25, 50];

  // ── Colonnes ──────────────────────────────────────────────────────────────
  displayedColumns = [
    'numeroActe', 'nomEnfant', 'localisation',
    'agent', 'statut', 'validateur', 'actions'
  ];

  // ── Constantes affichage ──────────────────────────────────────────────────
  readonly STATUT_LABELS = STATUT_LABELS;
  readonly STATUT_COLORS = STATUT_COLORS;
  readonly STATUT_ICONS  = STATUT_ICONS;

  // ═══════════════════════════════════════════════════════════════════════════
  //  LIFECYCLE
  // ═══════════════════════════════════════════════════════════════════════════

  ngOnInit(): void {
    this.loadGeodata();
    this.setupSearch();
    this.loadActes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  GÉOGRAPHIE — cascade Pays → Région → Préfecture → Commune
  // ═══════════════════════════════════════════════════════════════════════════

  private loadGeodata(): void {
    this.loadingGeo = true;
    this.cdr.markForCheck();

    // Pays : Guinée en tête, puis tri alphabétique
    this.geodata.getAllPays()
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        const guinea = list.find(p => p.code === CODE_GUINEE);
        const others = list
          .filter(p => p.code !== CODE_GUINEE)
          .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        this.pays = guinea ? [guinea, ...others] : others;
        this.cdr.markForCheck();
      });

    // Régions Guinée
    this.geodata.getAllRegions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(list => {
        this.regions    = list.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
        this.loadingGeo = false;
        this.cdr.markForCheck();
      });
  }

  /** Pays sélectionné = Guinée ? */
  get isGuinea(): boolean { return this.filterPays === CODE_GUINEE; }

  /** Nom du pays sélectionné (pour l'affichage dans les chips actifs) */
  get paysNom(): string {
    return this.pays.find(p => p.code === this.filterPays)?.nom ?? this.filterPays;
  }

  onPaysChange(): void {
    // Réinitialise toute la cascade downstream
    this.selectedRegionCode  = '';
    this.filterRegion        = '';
    this.selectedPrefCode    = '';
    this.filterPrefecture    = '';
    this.selectedCommuneCode = '';
    this.filterCommune       = '';
    this.filterVille         = '';
    this.prefectures         = [];
    this.communes            = [];
    this.villes              = [];

    if (!this.isGuinea && this.filterPays) {
      // Charge les villes du pays étranger
      this.geodata.getVillesByPays(this.filterPays)
        .pipe(takeUntil(this.destroy$))
        .subscribe(v => {
          this.villes = v.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
          this.cdr.markForCheck();
        });
    }
    this.currentPage = 0;
    this.loadActes();
  }

  onRegionChange(): void {
    // Réinitialise préfecture + commune
    this.selectedPrefCode    = '';
    this.filterPrefecture    = '';
    this.selectedCommuneCode = '';
    this.filterCommune       = '';
    this.prefectures         = [];
    this.communes            = [];

    if (this.selectedRegionCode) {
      const r = this.regions.find(x => x.code === this.selectedRegionCode);
      this.filterRegion = r?.nom ?? '';
      this.geodata.getPrefecturesByRegion(this.selectedRegionCode)
        .pipe(takeUntil(this.destroy$))
        .subscribe(list => {
          this.prefectures = list.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
          this.cdr.markForCheck();
        });
    } else {
      this.filterRegion = '';
    }
    this.currentPage = 0;
    this.loadActes();
  }

  onPrefectureChange(): void {
    // Réinitialise commune
    this.selectedCommuneCode = '';
    this.filterCommune       = '';
    this.communes            = [];

    if (this.selectedPrefCode) {
      const p = this.prefectures.find(x => x.code === this.selectedPrefCode);
      this.filterPrefecture = p?.nom ?? '';
      this.geodata.getCommunesByPrefecture(this.selectedPrefCode)
        .pipe(takeUntil(this.destroy$))
        .subscribe(list => {
          this.communes = list.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
          this.cdr.markForCheck();
        });
    } else {
      this.filterPrefecture = '';
    }
    this.currentPage = 0;
    this.loadActes();
  }

  onCommuneChange(): void {
    if (this.selectedCommuneCode) {
      const c = this.communes.find(x => x.code === this.selectedCommuneCode);
      this.filterCommune = c?.nom ?? '';
    } else {
      this.filterCommune = '';
    }
    this.currentPage = 0;
    this.loadActes();
  }

  onVilleChange(): void {
    // Pour les pays étrangers : ville saisie → passe comme filterRegion (champ le plus large)
    this.filterRegion = this.filterVille;
    this.currentPage  = 0;
    this.loadActes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  CHARGEMENT ACTES
  // ═══════════════════════════════════════════════════════════════════════════

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadActes();
      });
  }

  loadActes(): void {
    this.loading = true;
    this.error   = null;
    this.cdr.markForCheck();

    this.service.getAll({
      statut:     this.selectedStatut   || undefined,
      region:     this.filterRegion     || undefined,
      prefecture: this.filterPrefecture || undefined,
      commune:    this.filterCommune    || undefined,
      page:       this.currentPage,
      size:       this.pageSize,
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page) => {
          this.actes         = page.content;
          this.totalElements = page.totalElements;
          this.totalPages    = page.totalPages;
          this.loading       = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error   = 'Impossible de charger les actes de naissance.';
          this.loading = false;
          this.cdr.markForCheck();
          this.toast.error('Erreur lors du chargement des actes');
        },
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRES
  // ═══════════════════════════════════════════════════════════════════════════

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadActes();
  }

  clearFilters(): void {
    this.selectedStatut      = '';
    // Cascade geo
    this.filterPays          = CODE_GUINEE;
    this.selectedRegionCode  = '';
    this.filterRegion        = '';
    this.selectedPrefCode    = '';
    this.filterPrefecture    = '';
    this.selectedCommuneCode = '';
    this.filterCommune       = '';
    this.filterVille         = '';
    this.prefectures         = [];
    this.communes            = [];
    this.villes              = [];
    this.searchControl.setValue('', { emitEvent: false });
    this.currentPage         = 0;
    this.loadActes();
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.selectedStatut  ||
      this.filterRegion    ||
      this.filterPrefecture||
      this.filterCommune   ||
      this.filterVille     ||
      this.searchControl.value
    );
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize    = event.pageSize;
    this.loadActes();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  ACTIONS VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════

  valider(acte: ValidBirth): void {
    if (acte.statut !== 'EN_ATTENTE') return;
    this.service.valider(acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.replaceActe(updated);
          this.toast.success(`Acte n°${acte.numeroActe} validé avec succès`);
        },
        error: () => this.toast.error('Erreur lors de la validation'),
      });
  }

  openRejectDialog(acte: ValidBirth): void {
    if (acte.statut !== 'EN_ATTENTE') return;
    const ref = this.dialog.open(RejectDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { acte },
      disableClose: true,
    });
    ref.afterClosed().subscribe((motif: string | undefined) => {
      if (!motif) return;
      this.rejeter(acte, motif);
    });
  }

  private rejeter(acte: ValidBirth, motif: string): void {
    this.service.rejeter(acte.id, { motifRejet: motif })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.replaceActe(updated);
          this.toast.success(`Acte n°${acte.numeroActe} rejeté`);
        },
        error: () => this.toast.error('Erreur lors du rejet'),
      });
  }

  corriger(acte: ValidBirth): void {
    if (acte.statut !== 'REJETE') return;
    this.service.corriger(acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.replaceActe(updated);
          this.toast.success('Acte remis en attente pour correction');
        },
        error: () => this.toast.error('Erreur lors de la correction'),
      });
  }

  downloadPdf(acte: ValidBirth): void {
    if (acte.statut !== 'VALIDE' || acte._pdfLoading) return;
    acte._pdfLoading = true;
    this.cdr.markForCheck();

    this.service.getPdf(acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 10000);
          acte._pdfLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toast.error('Erreur lors de la génération du PDF');
          acte._pdfLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PERMISSIONS RBAC
  // ═══════════════════════════════════════════════════════════════════════════

  get canValidate(): boolean {
    return this.authService.roles?.includes('CAN_VALIDATE_BIRTH') ?? false;
  }
  get canReject(): boolean {
    return this.authService.roles?.includes('CAN_REJECT_BIRTH') ?? false;
  }
  get canCorrect(): boolean {
    return this.authService.roles?.includes('CAN_SAISIR_NAISSANCE') ?? false;
  }
  get showRegionFilter(): boolean {
    return this.authService.isCentral;
  }
  get showPrefectureFilter(): boolean {
    return this.authService.isCentral || this.authService.isRegional;
  }
  get showCommuneFilter(): boolean {
    return this.authService.isCentral ||
           this.authService.isRegional ||
           this.authService.isPrefectoral;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  FILTRAGE KPI (click sur carte)
  // ═══════════════════════════════════════════════════════════════════════════

  filterByStatut(statut: ValidationStatut): void {
    this.selectedStatut = this.selectedStatut === statut ? '' : statut;
    this.currentPage    = 0;
    this.loadActes();
  }

  get activeFilterCount(): number {
    return [
      this.selectedStatut,
      this.filterRegion,
      this.filterPrefecture,
      this.filterCommune,
      this.filterVille,
      this.searchControl.value,
    ].filter(Boolean).length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  HELPERS AFFICHAGE
  // ═══════════════════════════════════════════════════════════════════════════

  getNomEnfant(acte: ValidBirth): string {
    return [acte.prenoms, acte.nom].filter(Boolean).join(' ') || '—';
  }

  getLocalisation(acte: ValidBirth): string {
    return [acte.commune, acte.prefecture, acte.region].filter(Boolean).join(', ') || '—';
  }

  getInitials(acte: ValidBirth): string {
    const p = (acte.prenoms || '').trim().charAt(0).toUpperCase();
    const n = (acte.nom    || '').trim().charAt(0).toUpperCase();
    return p && n ? p + n : p || n || '?';
  }

  getAgentInitials(acte: ValidBirth): string {
    const full  = acte.agentNomComplet || acte.agentUsername || '';
    const parts = full.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return full.charAt(0).toUpperCase() || '?';
  }

  trackById(_: number, acte: ValidBirth): string { return acte.id; }

  private replaceActe(updated: ValidBirth): void {
    const idx = this.actes.findIndex(a => a.id === updated.id);
    if (idx !== -1) {
      this.actes = [...this.actes];
      this.actes[idx] = updated;
    }
    this.cdr.markForCheck();
  }

  get statsEnAttente(): number { return this.actes.filter(a => a.statut === 'EN_ATTENTE').length; }
  get statsValide():    number { return this.actes.filter(a => a.statut === 'VALIDE').length; }
  get statsRejete():   number  { return this.actes.filter(a => a.statut === 'REJETE').length; }

  getStatutLabel(statut: string): string { return STATUT_LABELS[statut] ?? statut; }
  getStatutColor(statut: string): string { return STATUT_COLORS[statut] ?? '#6b7280'; }
  getStatutIcon(statut: string): string  { return STATUT_ICONS[statut]  ?? 'help'; }
}
