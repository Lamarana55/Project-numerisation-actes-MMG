import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ActeSelectionData {
  type: 'naissance' | 'deces' | 'autres';
}

export interface ActeModel {
  label: string;
  description: string;
  route: string;
}

export interface ActeSelectionResult {
  route: string;
  queryParams?: Record<string, string>;
}

export interface ActeCategory {
  label: string;
  expanded: boolean;
  items: ActeModel[];
}

@Component({
  selector: 'app-acte-selection-dialog',
  templateUrl: './acte-selection-dialog.component.html',
  styleUrls: ['./acte-selection-dialog.component.css'],
})
export class ActeSelectionDialogComponent {

  selectedModel: ActeModel | null = null;
  filterText = '';
  acteManquant = false;

  // ── Naissance : liste plate ──────────────────────────────────────────────
  readonly modelsNaissance: ActeModel[] = [
    {
      label: 'Déclaration dans les délais d\'une naissance (6 mois)',
      description: 'Création d\'un acte de naissance dans les 6 mois',
      route: '/admin/actes-naissance/creation',
    },
    {
      label: 'Transcription du jugement supplétif de naissance',
      description: 'Transcription d\'un jugement supplétif de naissance',
      route: '/admin/actes-naissance/transcription',
    },
  ];

  // ── Décès : liste plate ──────────────────────────────────────────────────
  readonly modelsDeces: ActeModel[] = [
    {
      label: 'Déclaration dans les délais d\'un décès (2 mois)',
      description: 'Création d\'un acte de décès dans les 2 mois',
      route: '/admin/actes-deces/creation',
    },
    {
      label: 'Transcription du jugement supplétif de décès',
      description: 'Transcription d\'un jugement supplétif de décès',
      route: '/admin/actes-deces/transcription',
    },
  ];

  // ── Autres : liste avec catégories (style RNEC) ──────────────────────────
  readonly categoriesAutres: ActeCategory[] = [
    {
      label: 'Notification de Naissance',
      expanded: true,
      items: [
        {
          label: 'Notification de naissance',
          description: 'Notification de naissance',
          route: '/admin/actes-naissance/consultation',
        },
      ],
    },
    {
      label: 'Notification de Décès',
      expanded: true,
      items: [
        {
          label: 'Notification de décès',
          description: 'Notification de décès',
          route: '/admin/actes-deces/consultation',
        },
      ],
    },
    {
      label: 'Jugement supplétif naissance',
      expanded: true,
      items: [
        {
          label: 'Jugement supplétif de naissance',
          description: 'Jugement supplétif de naissance',
          route: '/admin/actes-naissance/transcription',
        },
      ],
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<ActeSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActeSelectionData,
  ) {}

  get isAutres(): boolean {
    return this.data.type === 'autres';
  }

  get title(): string {
    switch (this.data.type) {
      case 'naissance': return 'Acte de naissance';
      case 'deces':     return 'Acte de décès';
      default:          return 'Autres actes';
    }
  }

  get titleColor(): string {
    switch (this.data.type) {
      case 'naissance': return '#2e7d32';
      case 'deces':     return '#4a148c';
      default:          return '#e65100';
    }
  }

  get headerBg(): string {
    switch (this.data.type) {
      case 'naissance': return 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 55%, #43a047 100%)';
      case 'deces':     return 'linear-gradient(135deg, #4a148c 0%, #6a1b9a 55%, #8e24aa 100%)';
      default:          return 'linear-gradient(135deg, #bf360c 0%, #d84315 55%, #f4511e 100%)';
    }
  }

  get typeIcon(): string {
    switch (this.data.type) {
      case 'naissance': return 'child_care';
      case 'deces':     return 'sentiment_very_dissatisfied';
      default:          return 'folder_special';
    }
  }

  get dialogSubtitle(): string {
    switch (this.data.type) {
      case 'naissance': return 'Sélectionnez le type d\'acte de naissance à créer';
      case 'deces':     return 'Sélectionnez le type d\'acte de décès à créer';
      default:          return 'Sélectionnez la catégorie et le modèle d\'acte';
    }
  }

  get cardNumBg(): string {
    switch (this.data.type) {
      case 'naissance': return 'rgba(46,125,50,0.12)';
      case 'deces':     return 'rgba(106,27,154,0.12)';
      default:          return 'rgba(230,81,0,0.12)';
    }
  }

  // Liste plate pour naissance/décès (avec filtre)
  get models(): ActeModel[] {
    const all = this.data.type === 'naissance'
      ? this.modelsNaissance
      : this.modelsDeces;

    if (!this.filterText.trim()) return all;
    const q = this.filterText.toLowerCase();
    return all.filter(m => m.label.toLowerCase().includes(q));
  }

  // Catégories filtrées pour "Autres"
  get filteredCategories(): ActeCategory[] {
    if (!this.filterText.trim()) return this.categoriesAutres;
    const q = this.filterText.toLowerCase();
    return this.categoriesAutres
      .map(cat => ({
        ...cat,
        expanded: true,
        items: cat.items.filter(item => item.label.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.label.toLowerCase().includes(q) || cat.items.length > 0);
  }

  toggleCategory(cat: ActeCategory): void {
    cat.expanded = !cat.expanded;
  }

  select(model: ActeModel): void {
    this.selectedModel = model;
  }

  confirm(): void {
    if (this.selectedModel) {
      const result: ActeSelectionResult = {
        route: this.selectedModel.route,
        ...(this.acteManquant ? { queryParams: { mode: 'repris' } } : {}),
      };
      this.dialogRef.close(result);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
