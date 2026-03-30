import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Permission } from '../../../models/permission';

export interface PermissionDialogData {
  mode: 'create' | 'edit';
  permission: Permission | null;
}

@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permission-dialog.component.html',
  styleUrls: ['./permission-dialog.component.css']
})
export class PermissionDialogComponent {

  form: FormGroup;
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PermissionDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80),
                         Validators.pattern('^[A-Z][A-Z0-9_]*$')]],
      description: ['', [Validators.maxLength(200)]]
    });

    if (this.isEditMode && data.permission) {
      this.form.patchValue({ nom: data.permission.nom, description: data.permission.description });
    }
  }

  autoFormat(): void {
    const raw = this.form.get('nom')?.value || '';
    const formatted = raw.toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/__+/g, '_');
    this.form.patchValue({ nom: formatted }, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({
      nom:         this.form.value.nom.trim(),
      description: this.form.value.description?.trim() || ''
    });
  }

  onCancel(): void { this.dialogRef.close(null); }

  getFieldError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required'])  return 'Ce champ est requis';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} caractères`;
    if (c.errors['pattern'])   return 'Majuscules, chiffres et underscores uniquement (ex: CAN_VIEW_USERS)';
    return '';
  }
}
