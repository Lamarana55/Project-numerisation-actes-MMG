import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmLeaveData {
  title?: string;
  message?: string;
  labelConfirm?: string;
  labelCancel?: string;
}

@Component({
  selector: 'app-confirm-leave-dialog',
  templateUrl: './confirm-leave-dialog.component.html',
  styleUrls: ['./confirm-leave-dialog.component.css'],
})
export class ConfirmLeaveDialogComponent {

  data: Required<ConfirmLeaveData>;

  constructor(
    public dialogRef: MatDialogRef<ConfirmLeaveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: ConfirmLeaveData | null,
  ) {
    this.data = {
      title:        data?.title        ?? 'Quitter sans sauvegarder ?',
      message:      data?.message      ?? 'Des informations ont déjà été saisies. Si vous quittez maintenant, toutes les données seront perdues.',
      labelConfirm: data?.labelConfirm ?? 'Oui, quitter',
      labelCancel:  data?.labelCancel  ?? 'Continuer la saisie',
    };
  }

  confirm(): void { this.dialogRef.close(true); }
  cancel(): void  { this.dialogRef.close(false); }
}
