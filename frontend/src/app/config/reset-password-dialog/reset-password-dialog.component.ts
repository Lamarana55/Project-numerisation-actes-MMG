import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

export interface ResetPasswordDialogData {
  userName: string;
}

@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.css']
})
export class ResetPasswordDialogComponent {

  step: 'confirm' | 'loading' | 'success' = 'confirm';
  defaultPassword = '';
  copied = false;

  /** Le parent s'abonne à cet observable pour déclencher l'appel API */
  readonly confirmed$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<ResetPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResetPasswordDialogData
  ) {}

  /** Appelé par le bouton "Réinitialiser" — le dialog reste ouvert */
  confirmAction(): void {
    this.step = 'loading';
    this.confirmed$.next();
  }

  /** Appelé par le parent après succès de l'API */
  showSuccess(password: string): void {
    this.defaultPassword = password;
    this.step = 'success';
  }

  /** Appelé par le parent en cas d'erreur API */
  showError(): void {
    this.step = 'confirm';
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.defaultPassword).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2500);
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
