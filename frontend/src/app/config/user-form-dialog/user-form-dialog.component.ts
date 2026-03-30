import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoleService } from '../../services/role.service';
import { Role } from '../../models/role';
import { User } from '../../models/user';

export interface UserDialogData {
  mode: 'create' | 'edit';
  user?: User;
  availableRoles?: Role[];
}

@Component({
  selector: 'app-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  styleUrls: ['./user-form-dialog.component.css']
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  isEditMode = false;
  availableRoles: Role[] = [];
  selectedRole: Role | null = null;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.availableRoles = data.availableRoles || [];
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    this.setupRoleListener();

    if (this.isEditMode && this.data.user) {
      this.userForm.patchValue({
        nom:       this.data.user.nom,
        prenom:    this.data.user.prenom,
        email:     this.data.user.email,
        username:  this.data.user.username,
        telephone: this.data.user.telephone,
        fonction:  this.data.user.fonction
        // roleId sera rempli dans loadRoles() après chargement
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom:    ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:     ['', [Validators.required, Validators.email]],
      username:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      telephone: ['', [Validators.pattern('^[0-9+\\-\\s()]{8,20}$')]],
      fonction:  [''],
      roleId:    ['', Validators.required]
    });
  }

  private loadRoles(): void {
    if (this.availableRoles.length === 0) {
      this.roleService.getAllRoles().subscribe({
        next: (roles) => {
          this.availableRoles = roles;
          // Pré-remplissage du rôle une fois les rôles chargés (mode édition)
          if (this.isEditMode && this.data.user) {
            const matched = roles.find(r =>
              r.nom === (this.data.user!.roleName ?? this.data.user!.role?.nom)
            );
            if (matched) {
              this.userForm.patchValue({ roleId: matched.id });
              this.selectedRole = matched;
            }
          }
        },
        error: () => this.showSnackBar('Erreur lors du chargement des rôles', 'error')
      });
    } else if (this.isEditMode && this.data.user) {
      // Rôles déjà disponibles (passés via data)
      const matched = this.availableRoles.find(r =>
        r.nom === (this.data.user!.roleName ?? this.data.user!.role?.nom)
      );
      if (matched) {
        this.userForm.patchValue({ roleId: matched.id });
        this.selectedRole = matched;
      }
    }
  }

  private setupRoleListener(): void {
    this.userForm.get('roleId')?.valueChanges.subscribe(roleId => {
      this.selectedRole = this.availableRoles.find(r => r.id === roleId) || null;
    });
  }

  generateUsername(): void {
    const nom    = this.userForm.get('nom')?.value?.trim() || '';
    const prenom = this.userForm.get('prenom')?.value?.trim() || '';
    if (nom && prenom) {
      const base  = `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
      const email = `${base}@ravec.gov.gn`;
      // En mode édition : on ne touche pas au username, seulement l'email
      if (this.isEditMode) {
        this.userForm.patchValue({ email });
      } else {
        this.userForm.patchValue({ username: email, email });
      }
    }
  }

  getSelectedRoleName(): string {
    return this.selectedRole?.nom || 'Aucun rôle sélectionné';
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.showSnackBar('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }
    this.dialogRef.close(this.prepareFormData());
  }

  private prepareFormData(): any {
    // Le backend attend roleId directement (UserUpdateRequest / création)
    return { ...this.userForm.value };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required'])  return fieldName === 'roleId' ? 'Veuillez sélectionner un rôle' : `Le champ est requis`;
      if (field.errors['email'])     return 'Format d\'email invalide';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['pattern'] && fieldName === 'telephone') return 'Format de téléphone invalide';
    }
    return '';
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }
}
