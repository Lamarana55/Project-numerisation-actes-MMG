import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
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
    private userService: UserService,
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
        nom: this.data.user.nom,
        prenom: this.data.user.prenom,
        email: this.data.user.email,
        username: this.data.user.username,
        telephone: this.data.user.telephone,
        statut: this.data.user.statut || 'Activated',
        roleId: this.data.user.role?.id || null,
        fonction: this.data.user.fonction
      });

      if (this.data.user.role) {
        this.selectedRole = this.data.user.role;
      }
    }
  }

  private createForm(): FormGroup {
    const formConfig: any = {
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      telephone: ['', [Validators.pattern('^[0-9+\\-\\s()]{8,20}$')]],
      fonction: [''],
      roleId: ['', Validators.required]
    };

    if (!this.isEditMode) {
      formConfig.password = ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
      ]];
      formConfig.confirmPassword = ['', [Validators.required]];
    }

    return this.fb.group(formConfig);
  }

  private loadRoles(): void {
    if (this.availableRoles.length === 0) {
      this.roleService.getAllRoles().subscribe({
        next: (roles) => {
          this.availableRoles = roles;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des rôles:', error);
          this.showSnackBar('Erreur lors du chargement des rôles', 'error');
        }
      });
    }
  }

  private setupRoleListener(): void {
    this.userForm.get('roleId')?.valueChanges.subscribe(roleId => {
      this.selectedRole = this.availableRoles.find(role => role.id === roleId) || null;
    });
  }

  passwordsMatch(): boolean {
    if (this.isEditMode) return true;
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  generateUsername(): void {
    const nom = this.userForm.get('nom')?.value || '';
    const prenom = this.userForm.get('prenom')?.value || '';

    if (nom && prenom) {
      const username = `${prenom.toLowerCase()}.${nom.toLowerCase()}@ravec.gov.gn`
        .replace(/[^a-z0-9.@]/g, '');
      this.userForm.patchValue({ username, email: username });
    }
  }

  getSelectedRoleName(): string {
    return this.selectedRole?.nom || 'Aucun rôle sélectionné';
  }

  getSelectedRoleDescription(): string {
    return this.selectedRole?.description || '';
  }

  hasSelectedRole(): boolean {
    return this.selectedRole !== null;
  }

  onSubmit(): void {
    if (this.userForm.valid && this.passwordsMatch()) {
      this.loading = true;
      const userData = this.prepareFormData();

      const request = this.isEditMode
        ? this.userService.updateUser(String(this.data.user!.id!), userData)
        : this.userService.createUser(userData);

      request.subscribe({
        next: (result) => {
          this.loading = false;
          this.showSnackBar(
            this.isEditMode ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès',
            'success'
          );
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la sauvegarde:', error);
          this.handleSaveError(error);
        }
      });
    } else if (!this.passwordsMatch()) {
      this.showSnackBar('Les mots de passe ne correspondent pas', 'error');
    } else {
      this.showSnackBar('Veuillez corriger les erreurs dans le formulaire', 'error');
    }
  }

  private prepareFormData(): any {
    const formData = { ...this.userForm.value };
    delete formData.confirmPassword;

    // Convertir roleId en objet role pour correspondre au backend
    if (formData.roleId) {
      const role = this.availableRoles.find(r => r.id === formData.roleId);
      formData.role = role;
      delete formData.roleId;
    }

    return formData;
  }

  private handleSaveError(error: any): void {
    if (error.status === 409) {
      this.showSnackBar('Ce nom d\'utilisateur ou email existe déjà', 'error');
    } else if (error.status === 400) {
      this.showSnackBar('Données invalides', 'error');
    } else if (error.status === 404 && error.error?.message?.includes('role')) {
      this.showSnackBar('Le rôle sélectionné n\'existe pas', 'error');
    } else {
      this.showSnackBar('Erreur lors de la sauvegarde', 'error');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        if (fieldName === 'roleId') return 'Veuillez sélectionner un rôle';
        return `Le champ ${fieldName} est requis`;
      }
      if (field.errors['email']) return 'Format d\'email invalide';
      if (field.errors['minlength']) return `Le champ ${fieldName} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères`;
      if (field.errors['maxlength']) return `Le champ ${fieldName} ne peut pas dépasser ${field.errors['maxlength'].requiredLength} caractères`;
      if (field.errors['pattern'] && fieldName === 'password') {
        return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial';
      }
      if (field.errors['pattern'] && fieldName === 'telephone') {
        return 'Format de téléphone invalide';
      }
    }
    return '';
  }

  getPasswordStrength(): string {
    const password = this.userForm.get('password')?.value || '';
    if (password.length === 0) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    if (strength <= 2) return 'Faible';
    if (strength <= 3) return 'Moyen';
    if (strength <= 4) return 'Fort';
    return 'Très fort';
  }

  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'Faible': return 'warn';
      case 'Moyen': return 'accent';
      case 'Fort': return 'primary';
      case 'Très fort': return 'primary';
      default: return '';
    }
  }
}
