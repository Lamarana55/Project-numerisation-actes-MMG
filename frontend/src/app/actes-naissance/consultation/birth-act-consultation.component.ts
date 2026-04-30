import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActeNaissanceService, ActeNaissanceDetail } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { NationaliteService, Nationalite } from '../../services/nationalite.service';

@Component({
  selector: 'app-birth-act-consultation',
  templateUrl: './birth-act-consultation.component.html',
  styleUrls: ['./birth-act-consultation.component.css'],
})
export class BirthActConsultationComponent implements OnInit {

  acte: ActeNaissanceDetail | null = null;
  isLoading   = true;
  hasError    = false;
  isValidating = false;
  nationalites: Nationalite[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private acteService: ActeNaissanceService,
    private toast: ToastService,
    private nationaliteSvc: NationaliteService,
  ) {}

  ngOnInit(): void {
    this.nationaliteSvc.getNationalites().subscribe(data => this.nationalites = data);
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (!id) { this.hasError = true; this.isLoading = false; return; }
      this.acteService.getByIdNaissance(id).subscribe({
        next: detail => { this.acte = detail; this.isLoading = false; },
        error: () => { this.hasError = true; this.isLoading = false; },
      });
    });
  }

  getNatLabel(code: string | undefined | null, sexe: 'M' | 'F' = 'F'): string {
    return this.nationaliteSvc.getLibelle(code, sexe, this.nationalites);
  }

  get isValide(): boolean {
    return this.acte?.statut === 'VALIDE';
  }

  get statutLabel(): string {
    const s  = (this.acte?.statut        ?? '').toUpperCase();
    const af = (this.acte?.actionsFaire  ?? '').toUpperCase();
    if (s === 'VALIDE') return 'Validé';
    if (s === 'REJETE') return 'Rejeté';
    const afMap: Record<string, string> = {
      EN_COURS_SAISIE: 'En cours de saisie',
      A_CORRIGER:      'À corriger',
      A_VALIDER:       'Brouillon',
      EN_ATTENTE:      'Brouillon',
    };
    return afMap[af] || afMap[s] || s || '—';
  }

  get bannerClass(): string {
    const s  = (this.acte?.statut       ?? '').toUpperCase();
    const af = (this.acte?.actionsFaire ?? '').toUpperCase();
    if (s === 'VALIDE') return 'statut-banner statut-banner--valide';
    if (s === 'REJETE' || af === 'A_CORRIGER') return 'statut-banner statut-banner--corriger';
    return 'statut-banner statut-banner--brouillon';
  }

  get bannerIcon(): string {
    const s  = (this.acte?.statut       ?? '').toUpperCase();
    const af = (this.acte?.actionsFaire ?? '').toUpperCase();
    if (s === 'VALIDE') return 'verified';
    if (s === 'REJETE' || af === 'A_CORRIGER') return 'cancel';
    return 'draft';
  }

  get sourceLabel(): string {
    const map: Record<string, string> = {
      DECLARATION:   'Déclaration dans les délais',
      TRANSCRIPTION: 'Transcription jugement supplétif',
      NUMERISATION:  'Numérisation',
      INDEXATION:    'Indexation',
    };
    return map[this.acte?.source ?? ''] || this.acte?.source || '—';
  }

  valider(): void {
    if (!this.acte || this.isValidating) return;
    this.isValidating = true;
    this.acteService.validerNaissance(this.acte.id).subscribe({
      next: () => {
        this.isValidating = false;
        if (this.acte) this.acte.statut = 'VALIDE';
        this.toast.success('Acte de naissance validé avec succès.');
      },
      error: () => {
        this.isValidating = false;
        this.toast.error('Impossible de valider l\'acte. Veuillez réessayer.');
      },
    });
  }

  telechargerPdf(): void {
    if (!this.acte) return;
    this.acteService.downloadPdfNaissance(this.acte.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        a.download = `acte-naissance-${this.acte!.numeroActe || this.acte!.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toast.success('PDF téléchargé avec succès.');
      },
      error: () => this.toast.error('Erreur lors de la génération du PDF.'),
    });
  }

  modifier(): void {
    if (!this.acte) return;
    this.router.navigate(['/admin/actes-naissance/creation'],
      { queryParams: { id: this.acte.id, mode: 'edit' } });
  }

  retour(): void {
    this.router.navigate(['/admin/actes/listes']);
  }

  fmt(value: string | undefined | null): string {
    return value?.trim() || '—';
  }

  fmtDate(value: string | undefined | null): string {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return value; }
  }

  fmtSexe(v: string | undefined | null): string {
    if (v === 'M') return 'Masculin';
    if (v === 'F') return 'Féminin';
    return v || '—';
  }

  join(parts: (string | undefined | null)[], sep = ', '): string {
    return parts.filter(p => p && p.trim()).join(sep) || '—';
  }
}
