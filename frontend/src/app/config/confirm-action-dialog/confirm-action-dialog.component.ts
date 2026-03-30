import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmActionDialogData {
  type: 'delete' | 'activate' | 'deactivate';
  userName: string;
}

@Component({
  selector: 'app-confirm-action-dialog',
  templateUrl: './confirm-action-dialog.component.html',
  styleUrls: ['./confirm-action-dialog.component.css']
})
export class ConfirmActionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmActionDialogData
  ) {}

  get icon(): string {
    switch (this.data.type) {
      case 'delete':     return 'delete_forever';
      case 'activate':   return 'person';
      case 'deactivate': return 'person_off';
    }
  }

  get title(): string {
    switch (this.data.type) {
      case 'delete':     return 'Supprimer l\'utilisateur';
      case 'activate':   return 'Activer l\'utilisateur';
      case 'deactivate': return 'Désactiver l\'utilisateur';
    }
  }

  get message(): string {
    switch (this.data.type) {
      case 'delete':
        return 'Cette action est <strong>irréversible</strong>. Le compte sera définitivement supprimé et toutes les données associées seront perdues.';
      case 'activate':
        return 'L\'utilisateur pourra à nouveau se connecter et accéder à toutes les fonctionnalités selon son rôle.';
      case 'deactivate':
        return 'L\'utilisateur ne pourra plus se connecter. Ses données seront conservées et le compte pourra être réactivé.';
    }
  }

  get confirmLabel(): string {
    switch (this.data.type) {
      case 'delete':     return 'Supprimer';
      case 'activate':   return 'Activer';
      case 'deactivate': return 'Désactiver';
    }
  }

  confirm(): void { this.dialogRef.close(true); }
  cancel(): void  { this.dialogRef.close(false); }
}
