import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil, debounceTime } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ValidBirthService } from '../../services/valid-birth.service';
import {
  ValidBirth,
  ValidationStatut,
  STATUT_LABELS,
  STATUT_COLORS,
  STATUT_ICONS,
} from '../../models/valid-birth.model';
import { RejectDialogComponent } from '../reject-dialog/reject-dialog.component';

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
  readonly authService      = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  // ── Données ─────────────────────────────────────────────────────────────
  actes: ValidBirth[] = [];
  loading = false;
  error: string | null = null;

  // ── Filtres ──────────────────────────────────────────────────────────────
  selectedStatut: ValidationStatut | '' = '';
  filterRegion     = '';
  filterPrefecture = '';
  filterCommune    = '';
  searchControl    = new FormControl('');

  // ── Pagination ────────────────────────────────────────────────────────────
  totalElements   = 0;
  totalPages      = 0;
  currentPage     = 0;
  pageSize        = 25;
  pageSizeOptions = [10, 25, 50];

  // ── Colonnes ──────────────────────────────────────────────────────────────
  displayedColumns = [
    'numeroActe', 'nomEnfant', 'dateNaissance',
    'localisation', 'agent', 'statut', 'dateAction', 'actions'
  ];

  // ── Constantes affichage ──────────────────────────────────────────────────
  readonly STATUT_LABELS = STATUT_LABELS;
  readonly STATUT_COLORS = STATUT_COLORS;
  readonly STATUT_ICONS  = STATUT_ICONS;
  readonly STATUTS: { value: ValidationStatut | ''; label: string }[] = [
    { value: '',           label: 'Tous les statuts' },
    { value: 'EN_ATTENTE', label: 'En attente' },
    { value: 'VALIDE',     label: 'Validé' },
    { value: 'REJETE',     label: 'Rejeté' },
  ];

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.setupSearch();
    this.loadActes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ────────────────────────────────────────────────────────────

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
      statut:     this.selectedStatut || undefined,
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

  // ── Filtres ───────────────────────────────────────────────────────────────

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadActes();
  }

  clearFilters(): void {
    this.selectedStatut   = '';
    this.filterRegion     = '';
    this.filterPrefecture = '';
    this.filterCommune    = '';
    this.searchControl.setValue('', { emitEvent: false });
    this.currentPage = 0;
    this.loadActes();
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedStatut || this.filterRegion ||
              this.filterPrefecture || this.filterCommune);
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize    = event.pageSize;
    this.loadActes();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

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
      width: '520px',
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

  // ── Permissions ───────────────────────────────────────────────────────────

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

  // ── Helpers affichage ─────────────────────────────────────────────────────

  getNomEnfant(acte: ValidBirth): string {
    const parts = [acte.prenoms, acte.nom].filter(Boolean);
    return parts.join(' ') || '—';
  }

  getLocalisation(acte: ValidBirth): string {
    return [acte.commune, acte.prefecture, acte.region]
      .filter(Boolean).join(', ') || '—';
  }

  trackById(_: number, acte: ValidBirth): string {
    return acte.id;
  }

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

  // ── Helpers template (évite l'indexation directe du Record) ──────────────
  getStatutLabel(statut: string): string { return STATUT_LABELS[statut] ?? statut; }
  getStatutColor(statut: string): string { return STATUT_COLORS[statut] ?? '#6b7280'; }
  getStatutIcon(statut: string): string  { return STATUT_ICONS[statut]  ?? 'help'; }
}
