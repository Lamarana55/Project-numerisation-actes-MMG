import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Permission } from '../../../models/permission';
import { Role } from '../../../models/role';
import { PermissionService } from '../../../services/permission.service';

export interface RoleFormDialogData {
  mode: 'create' | 'edit';
  role: Role | null;
}

@Component({
  selector: 'app-role-form-dialog',
  templateUrl: './role-form-dialog.component.html',
  styleUrls: ['./role-form-dialog.component.css']
})
export class RoleFormDialogComponent implements OnInit {

  form: FormGroup;
  isEditMode: boolean;

  allPermissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  selectedIds = new Set<string>();
  searchControl = new FormControl('');
  loadingPerms = false;

  constructor(
    private fb: FormBuilder,
    private permissionService: PermissionService,
    public dialogRef: MatDialogRef<RoleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleFormDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.form = this.fb.group({
      nom:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]]
    });

    if (this.isEditMode && data.role) {
      this.form.patchValue({ nom: data.role.nom, description: data.role.description });
      (data.role.permissions ?? []).forEach(p => this.selectedIds.add(p.id!));
    }
  }

  ngOnInit(): void {
    this.loadPerms();
    this.searchControl.valueChanges.subscribe(() => this.filterPerms());
  }

  private loadPerms(): void {
    this.loadingPerms = true;
    this.permissionService.getAllPermissions().subscribe({
      next: (perms) => {
        this.allPermissions = perms;
        this.filteredPermissions = perms;
        this.loadingPerms = false;
      },
      error: () => { this.loadingPerms = false; }
    });
  }

  filterPerms(): void {
    const term = (this.searchControl.value || '').toLowerCase().trim();
    this.filteredPermissions = term
      ? this.allPermissions.filter(p =>
          p.nom.toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term))
      : [...this.allPermissions];
  }

  togglePerm(id: string): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  selectAll(): void   { this.filteredPermissions.forEach(p => this.selectedIds.add(p.id!)); }
  deselectAll(): void { this.filteredPermissions.forEach(p => this.selectedIds.delete(p.id!)); }

  get selectedCount(): number { return this.selectedIds.size; }

  get isAllFilteredSelected(): boolean {
    return this.filteredPermissions.length > 0 &&
           this.filteredPermissions.every(p => this.selectedIds.has(p.id!));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({
      nom:           this.form.value.nom.trim(),
      description:   this.form.value.description?.trim() || '',
      permissionIds: Array.from(this.selectedIds)
    });
  }

  onCancel(): void { this.dialogRef.close(null); }

  getFieldError(field: string): string {
    const c = this.form.get(field);
    if (!c?.errors || !c.touched) return '';
    if (c.errors['required'])  return 'Ce champ est requis';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} caractères`;
    return '';
  }
}
