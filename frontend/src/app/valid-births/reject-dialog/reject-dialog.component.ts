import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidBirth } from '../../models/valid-birth.model';

export interface RejectDialogData {
  acte: ValidBirth;
}

@Component({
  selector: 'app-reject-dialog',
  templateUrl: './reject-dialog.component.html',
  styleUrls: ['./reject-dialog.component.scss'],
})
export class RejectDialogComponent {

  motifControl = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(500),
  ]);

  constructor(
    public dialogRef: MatDialogRef<RejectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RejectDialogData
  ) {}

  get nomEnfant(): string {
    const { acte } = this.data;
    return [acte.prenoms, acte.nom].filter(Boolean).join(' ') || `Acte n°${acte.numeroActe}`;
  }

  getInitials(): string {
    const { acte } = this.data;
    const p = (acte.prenoms || '').trim().charAt(0).toUpperCase();
    const n = (acte.nom    || '').trim().charAt(0).toUpperCase();
    return p && n ? p + n : p || n || '?';
  }

  get charCount(): number {
    return (this.motifControl.value ?? '').length;
  }

  confirm(): void {
    if (this.motifControl.invalid) {
      this.motifControl.markAsTouched();
      return;
    }
    this.dialogRef.close(this.motifControl.value!.trim());
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
