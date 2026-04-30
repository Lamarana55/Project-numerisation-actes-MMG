import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ActeNaissanceService, ActeNaissanceSummary } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';

const DOC_LABELS: Record<string, string> = {
  DECLARATION:   'Déclaration',
  TRANSCRIPTION: 'Transcription',
  NUMERISATION:  'Numérisation',
  INDEXATION:    'Indexation',
};

const DOC_COLORS: Record<string, string> = {
  DECLARATION:   '#2e7d32',
  TRANSCRIPTION: '#1565c0',
  NUMERISATION:  '#90a4ae',
  INDEXATION:    '#6a1b9a',
};

const ETAT_LABELS: Record<string, string> = {
  EN_COURS_SAISIE: 'En saisie',
  A_CORRIGER:      'À corriger',
  A_VALIDER:       'Brouillon',
  EN_ATTENTE:      'Brouillon',
  VALIDE:          'Validé',
  REJETE:          'Rejeté',
};

@Component({
  selector: 'app-actes-liste',
  templateUrl: './actes-liste.component.html',
  styleUrls: ['./actes-liste.component.css'],
})
export class ActesListeComponent implements OnInit {

  // ── Filtres ────────────────────────────────────────────
  searchNom          = '';
  searchPrenom       = '';
  searchNpi          = '';
  searchNumero       = '';
  searchTypeActe     = '';
  searchTypeCreation = '';
  searchDateDebut    = '';
  searchDateFin      = '';

  // ── Données ────────────────────────────────────────────
  actes:         ActeNaissanceSummary[] = [];
  totalElements  = 0;
  totalPages     = 0;
  currentPage    = 0;
  pageSize       = 50;
  pageSizeOptions = [5,10, 25, 50, 100];
  isLoading      = false;
  hasError       = false;

  constructor(
    private acteService: ActeNaissanceService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    // Lecture des query params transmis depuis la page d'accueil
    this.route.queryParams.subscribe(params => {
      this.searchNom          = params['nom']          || '';
      this.searchPrenom       = params['prenom']       || '';
      this.searchNpi          = params['npi']          || '';
      this.searchNumero       = params['numero']       || '';
      this.searchTypeActe     = params['typeActe']     || '';
      this.searchTypeCreation = params['typeCreation'] || '';
      this.searchDateDebut    = params['dateDebut']    || '';
      this.searchDateFin      = params['dateFin']      || '';
      this.currentPage = 0;
      this.chargerActes();
    });
  }

  rechercher(): void {
    this.currentPage = 0;
    this.chargerActes();
  }

  effacerFiltres(): void {
    this.searchNom          = '';
    this.searchPrenom       = '';
    this.searchNpi          = '';
    this.searchNumero       = '';
    this.searchTypeActe     = '';
    this.searchTypeCreation = '';
    this.searchDateDebut    = '';
    this.searchDateFin      = '';
    this.currentPage        = 0;
    this.chargerActes();
  }

  chargerActes(): void {
    this.isLoading = true;
    this.hasError  = false;

    this.acteService.searchAll({
      nom:          this.searchNom          || undefined,
      prenom:       this.searchPrenom       || undefined,
      npi:          this.searchNpi          || undefined,
      numero:       this.searchNumero       || undefined,
      typeActe:     this.searchTypeActe     || undefined,
      typeCreation: this.searchTypeCreation || undefined,
      dateDebut:    this.searchDateDebut    || undefined,
      dateFin:      this.searchDateFin      || undefined,
      page:         this.currentPage,
      size:         this.pageSize,
    }).subscribe({
      next: (page) => {
        this.actes         = page.content;
        this.totalElements = page.totalElements;
        this.totalPages    = page.totalPages;
        this.isLoading     = false;
      },
      error: () => {
        this.isLoading = false;
        this.hasError  = true;
      },
    });
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.chargerActes();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.chargerActes();
  }

  retourRecherche(): void {
    this.router.navigate(['/admin/actes']);
  }

  // ── Actions sur un acte ────────────────────────────────────────

  voirDetail(a: ActeNaissanceSummary): void {
    const type = (a.typeActe ?? 'naissance').toLowerCase();
    this.router.navigate([`/admin/actes-${type}/consultation`], { queryParams: { id: a.id } });
  }

  modifier(a: ActeNaissanceSummary): void {
    const type = (a.typeActe ?? 'naissance').toLowerCase();
    this.router.navigate([`/admin/actes-${type}/creation`], { queryParams: { id: a.id, mode: 'edit' } });
  }

  supprimer(a: ActeNaissanceSummary): void {
    const nom    = [a.prenom, a.nom].filter(Boolean).join(' ') || 'cet acte';
    const ref    = this.dialog.open(ConfirmLeaveDialogComponent, {
      width: '440px',
      data: {
        title:        'Supprimer l\'acte',
        message:      `Confirmez-vous la suppression de l'acte de <strong>${nom}</strong> ? Cette action est irréversible.`,
        labelConfirm: 'Supprimer',
        labelCancel:  'Annuler',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      const delete$ = (a.typeActe ?? 'naissance').toLowerCase() === 'deces'
        ? this.acteService.deleteDeces(a.id)
        : this.acteService.deleteNaissance(a.id);

      delete$.subscribe({
        next: () => {
          this.actes = this.actes.filter(x => x.id !== a.id);
          this.totalElements = Math.max(0, this.totalElements - 1);
          this.toast.success(`L'acte de ${nom} a été supprimé.`);
        },
        error: () => {
          this.toast.error('Impossible de supprimer l\'acte. Veuillez réessayer.');
        },
      });
    });
  }

  getDocLabel(a: ActeNaissanceSummary): string {
    const key = (a.typeCreation ?? a.source ?? '').toUpperCase();
    return DOC_LABELS[key] || key || '—';
  }

  getDocBadgeClass(a: ActeNaissanceSummary): string {
    const key = (a.typeCreation ?? a.source ?? '').toUpperCase();
    const map: Record<string, string> = {
      DECLARATION:   'doc-badge--declaration',
      TRANSCRIPTION: 'doc-badge--transcription',
      NUMERISATION:  'doc-badge--numerisation',
      INDEXATION:    'doc-badge--indexation',
    };
    return map[key] || 'doc-badge--unknown';
  }

  getCardClass(a: ActeNaissanceSummary): string {
    const key = (a.typeCreation ?? a.source ?? '').toUpperCase();
    const map: Record<string, string> = {
      DECLARATION:   'acte-card--declaration',
      TRANSCRIPTION: 'acte-card--transcription',
      NUMERISATION:  'acte-card--numerisation',
      INDEXATION:    'acte-card--indexation',
    };
    return map[key] || 'acte-card--unknown';
  }

  getDocColor(a: ActeNaissanceSummary): string {
    const key = (a.typeCreation ?? a.source ?? '').toUpperCase();
    return DOC_COLORS[key] || '#90a4ae';
  }

  /** Résout la clé d'état : le statut VALIDE/REJETE prend toujours le dessus sur actionsFaire. */
  private resolveEtatKey(a: ActeNaissanceSummary): string {
    const statut = (a.statut ?? '').toUpperCase();
    if (statut === 'VALIDE' || statut === 'REJETE') return statut;
    return (a.actionsFaire ?? a.statut ?? '').toUpperCase();
  }

  getEtatLabel(a: ActeNaissanceSummary): string {
    const key = this.resolveEtatKey(a);
    return ETAT_LABELS[key] || key || '—';
  }

  getEtatChipClass(a: ActeNaissanceSummary): string {
    const k = this.resolveEtatKey(a);
    if (k === 'VALIDE')          return 'etat-chip etat-chip--valide';
    if (k === 'EN_COURS_SAISIE') return 'etat-chip etat-chip--brouillon';
    if (k === 'A_CORRIGER')      return 'etat-chip etat-chip--corriger';
    if (k === 'A_VALIDER')       return 'etat-chip etat-chip--brouillon';
    if (k === 'EN_ATTENTE')      return 'etat-chip etat-chip--brouillon';
    if (k === 'REJETE')          return 'etat-chip etat-chip--corriger';
    return 'etat-chip etat-chip--brouillon';
  }

  get pages(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 3);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  get debut(): number { return this.currentPage * this.pageSize + 1; }
  get fin():   number { return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements); }
}
