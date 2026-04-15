import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ActeSelectionData {
  type: 'naissance' | 'deces' | 'autres';
}

export interface ActeModel {
  label: string;
  description: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-acte-selection-dialog',
  templateUrl: './acte-selection-dialog.component.html',
  styleUrls: ['./acte-selection-dialog.component.css'],
})
export class ActeSelectionDialogComponent {

  selectedModel: ActeModel | null = null;
  filterText = '';

  readonly modelsNaissance: ActeModel[] = [
    {
      label: 'Déclaration dans les délais (< 6 mois)',
      description: 'Déclaration dans les délais d\'une naissance (6 mois)',
      route: '/admin/actes-naissance/creation',
      icon: 'child_care',
    },
    {
      label: 'Transcription du jugement supplétif',
      description: 'Transcription du jugement supplétif de naissance',
      route: '/admin/actes-naissance/transcription',
      icon: 'drive_file_rename_outline',
    },
  ];

  readonly modelsDeces: ActeModel[] = [
    {
      label: 'Déclaration dans les délais (< 2 mois)',
      description: 'Déclaration dans les délais d\'un décès (2 mois)',
      route: '/admin/actes-deces/creation',
      icon: 'menu_book',
    },
    {
      label: 'Transcription du jugement supplétif',
      description: 'Transcription du jugement supplétif de décès',
      route: '/admin/actes-deces/transcription',
      icon: 'drive_file_rename_outline',
    },
  ];

  readonly modelsAutres: ActeModel[] = [
    {
      label: 'Actes repris (numérisation)',
      description: 'Valider les actes issus de la numérisation',
      route: '/admin/actes-naissance/repris',
      icon: 'inventory_2',
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<ActeSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActeSelectionData,
  ) {}

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

  get models(): ActeModel[] {
    const all = this.data.type === 'naissance'
      ? this.modelsNaissance
      : this.data.type === 'deces'
        ? this.modelsDeces
        : this.modelsAutres;

    if (!this.filterText.trim()) return all;
    const q = this.filterText.toLowerCase();
    return all.filter(m => m.label.toLowerCase().includes(q) || m.description.toLowerCase().includes(q));
  }

  select(model: ActeModel): void {
    this.selectedModel = model;
  }

  confirm(): void {
    if (this.selectedModel) {
      this.dialogRef.close(this.selectedModel.route);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
