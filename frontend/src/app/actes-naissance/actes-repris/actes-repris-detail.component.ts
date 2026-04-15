import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ValidBirthService } from '../../services/valid-birth.service';
import {
  ValidBirth,
  STATUT_LABELS,
  STATUT_COLORS,
  STATUT_ICONS,
} from '../../models/valid-birth.model';
import { RejectDialogComponent } from '../../valid-births/reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-actes-repris-detail',
  templateUrl: './actes-repris-detail.component.html',
  styleUrls: ['./actes-repris-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActesReprisDetailComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(ValidBirthService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly authService = inject(AuthService);

  private readonly destroy$ = new Subject<void>();

  acte: ValidBirth | null = null;
  loading = true;
  error: string | null = null;
  pdfLoading = false;

  // Split-screen: onglet actif du panneau droit
  activeTab: 'donnees' | 'historique' | 'observations' = 'donnees';

  // Image viewer
  imageZoom = 1;
  imageRotation = 0;

  readonly STATUT_LABELS = STATUT_LABELS;
  readonly STATUT_COLORS = STATUT_COLORS;
  readonly STATUT_ICONS = STATUT_ICONS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadActe(id);
    } else {
      this.error = 'Identifiant de l\'acte manquant';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActe(id: string): void {
    this.loading = true;
    this.service.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (acte) => {
          this.acte = acte;
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger l\'acte.';
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/admin/actes-naissance/repris']);
  }

  // Actions
  valider(): void {
    if (!this.acte || this.acte.statut !== 'EN_ATTENTE') return;
    this.service.valider(this.acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.acte = updated;
          this.toast.success('Acte validé avec succès');
          this.cdr.markForCheck();
        },
        error: () => this.toast.error('Erreur lors de la validation'),
      });
  }

  openRejectDialog(): void {
    if (!this.acte || this.acte.statut !== 'EN_ATTENTE') return;
    const ref = this.dialog.open(RejectDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { acte: this.acte },
      disableClose: true,
    });
    ref.afterClosed().subscribe((motif: string | undefined) => {
      if (!motif || !this.acte) return;
      this.service.rejeter(this.acte.id, { motifRejet: motif })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.acte = updated;
            this.toast.success('Acte rejeté');
            this.cdr.markForCheck();
          },
          error: () => this.toast.error('Erreur lors du rejet'),
        });
    });
  }

  corriger(): void {
    if (!this.acte || this.acte.statut !== 'REJETE') return;
    this.service.corriger(this.acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.acte = updated;
          this.toast.success('Acte remis en attente pour correction');
          this.cdr.markForCheck();
        },
        error: () => this.toast.error('Erreur lors de la correction'),
      });
  }

  downloadPdf(): void {
    if (!this.acte || this.acte.statut !== 'VALIDE' || this.pdfLoading) return;
    this.pdfLoading = true;
    this.cdr.markForCheck();

    this.service.getPdf(this.acte.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 10000);
          this.pdfLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.toast.error('Erreur lors de la génération du PDF');
          this.pdfLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // Image controls
  zoomIn(): void { this.imageZoom = Math.min(this.imageZoom + 0.25, 3); }
  zoomOut(): void { this.imageZoom = Math.max(this.imageZoom - 0.25, 0.5); }
  resetZoom(): void { this.imageZoom = 1; this.imageRotation = 0; }
  rotateImage(): void { this.imageRotation = (this.imageRotation + 90) % 360; }

  // Permissions
  get canValidate(): boolean {
    return this.authService.roles?.includes('CAN_VALIDATE_BIRTH') ?? false;
  }
  get canReject(): boolean {
    return this.authService.roles?.includes('CAN_REJECT_BIRTH') ?? false;
  }
  get canCorrect(): boolean {
    return this.authService.roles?.includes('CAN_SAISIR_NAISSANCE') ?? false;
  }

  getStatutLabel(statut: string): string { return STATUT_LABELS[statut] ?? statut; }
  getStatutColor(statut: string): string { return STATUT_COLORS[statut] ?? '#6b7280'; }

  getNomComplet(): string {
    if (!this.acte) return '—';
    return [this.acte.prenoms, this.acte.nom].filter(Boolean).join(' ') || '—';
  }

  getLocalisation(): string {
    if (!this.acte) return '—';
    return [this.acte.commune, this.acte.prefecture, this.acte.region].filter(Boolean).join(', ') || '—';
  }
}
