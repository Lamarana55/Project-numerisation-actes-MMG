import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { RoleService } from '../../../services/role.service';
import { PermissionService } from '../../../services/permission.service';
import { Role } from '../../../models/role';
import { Permission } from '../../../models/permission';

export interface RoleDialogData {
  mode: 'create' | 'edit';
  role?: Role;
}

interface PermissionCategory {
  key: string;
  label: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-role-form-dialog',
  templateUrl: './role-form-dialog.component.html',
  styleUrls: ['./role-form-dialog.component.css']
})
export class RoleFormDialogComponent implements OnInit, OnDestroy {
  roleForm: FormGroup;
  loading = false;
  isEditMode = false;
  private destroy$ = new Subject<void>();

  availablePermissions: Permission[] = [];
  groupedPermissions: { [key: string]: Permission[] } = {};
  permissionSelection = new SelectionModel<Permission>(true, []);
  searchTerm = '';
  filteredGroupedPermissions: { [key: string]: Permission[] } = {};

  categories: PermissionCategory[] = [
    {
      key: 'DASHBOARD',
      label: 'Tableau de bord',
      icon: 'dashboard',
      description: 'Accès au tableau de bord et statistiques'
    },
    {
      key: 'USER_MANAGEMENT',
      label: 'Gestion des utilisateurs',
      icon: 'people',
      description: 'Création, modification et suppression d\'utilisateurs'
    },
    {
      key: 'COLLECTES',
      label: 'Collectes',
      icon: 'assignment',
      description: 'Gestion des collectes de données'
    },
    {
      key: 'VALIDATION',
      label: 'Validation',
      icon: 'check_circle',
      description: 'Validation et approbation des données'
    },
    {
      key: 'CIVIL_ACTS',
      label: 'Actes civils',
      icon: 'description',
      description: 'Gestion des actes d\'état civil'
    },
    {
      key: 'JUDICIAL',
      label: 'Judiciaire',
      icon: 'gavel',
      description: 'Procédures et documents judiciaires'
    },
    {
      key: 'ADMINISTRATION',
      label: 'Administration',
      icon: 'admin_panel_settings',
      description: 'Configuration système et paramètres'
    },
    {
      key: 'REPORTS',
      label: 'Rapports',
      icon: 'assessment',
      description: 'Génération et consultation de rapports'
    },
    {
      key: 'PROFILE',
      label: 'Profil',
      icon: 'account_circle',
      description: 'Gestion du profil utilisateur'
    }
  ];

  // Exemples de rôles prédéfinis
  roleExamples = [
    {
      name: 'ADMIN',
      description: 'Administrateur avec tous les droits',
      permissions: ['DASHBOARD', 'USER_MANAGEMENT', 'ADMINISTRATION', 'REPORTS']
    },
    {
      name: 'MANAGER',
      description: 'Gestionnaire avec droits de supervision',
      permissions: ['DASHBOARD', 'COLLECTES', 'VALIDATION', 'REPORTS']
    },
    {
      name: 'OPERATOR',
      description: 'Opérateur pour les tâches courantes',
      permissions: ['DASHBOARD', 'COLLECTES', 'CIVIL_ACTS']
    },
    {
      name: 'VIEWER',
      description: 'Consultation des données uniquement',
      permissions: ['DASHBOARD', 'REPORTS']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private permissionService: PermissionService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RoleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.roleForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.setupFormValidation();

    if (this.isEditMode && this.data.role) {
      this.roleForm.patchValue({
        nom: this.data.role.nom,
        description: this.data.role.description
      });

      if (this.data.role.permissions) {
        this.permissionSelection.select(...this.data.role.permissions);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nom: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Z_][A-Z0-9_]*$/)
        ]
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(255)
        ]
      ]
    });
  }

  private setupFormValidation(): void {
    // Formatage automatique du nom
    this.roleForm.get('nom')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && typeof value === 'string') {
          this.autoFormatRoleName(value);
        }
      });
  }

  private autoFormatRoleName(value: string): void {
    const nomControl = this.roleForm.get('nom');
    if (nomControl && !nomControl.hasError('pattern')) {
      const formatted = value
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      if (formatted !== value && formatted.length > 0) {
        nomControl.setValue(formatted, { emitEvent: false });
      }
    }
  }

  private loadPermissions(): void {
    this.permissionService.getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          this.availablePermissions = permissions;
          this.groupPermissionsByCategory();
          this.applyPermissionFilter();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des permissions:', error);
          this.showSnackBar('Erreur lors du chargement des permissions', 'error');
        }
      });
  }

  private groupPermissionsByCategory(): void {
    this.groupedPermissions = {};

    this.availablePermissions.forEach(permission => {
      const category = this.getPermissionCategory(permission.nom);
      if (!this.groupedPermissions[category]) {
        this.groupedPermissions[category] = [];
      }
      this.groupedPermissions[category].push(permission);
    });

    // Trier les permissions dans chaque catégorie
    Object.keys(this.groupedPermissions).forEach(category => {
      this.groupedPermissions[category].sort((a, b) => a.nom.localeCompare(b.nom));
    });
  }

  private getPermissionCategory(permissionName: string): string {
    const name = permissionName.toUpperCase();

    if (name.includes('DASHBOARD')) return 'DASHBOARD';
    if (name.includes('USER') || name.includes('ROLE')) return 'USER_MANAGEMENT';
    if (name.includes('COLLECTE')) return 'COLLECTES';
    if (name.includes('VALIDATE') || name.includes('APPROVE')) return 'VALIDATION';
    if (name.includes('BIRTH') || name.includes('CERTIFICATE') || name.includes('CIVIL')) return 'CIVIL_ACTS';
    if (name.includes('JUDGMENT') || name.includes('COURT') || name.includes('JUDICIAL')) return 'JUDICIAL';
    if (name.includes('SYSTEM') || name.includes('LOCALITE') || name.includes('ADMIN')) return 'ADMINISTRATION';
    if (name.includes('REPORT') || name.includes('EXPORT') || name.includes('IMPORT')) return 'REPORTS';
    if (name.includes('PROFILE') || name.includes('PASSWORD')) return 'PROFILE';

    return 'AUTRE';
  }

  // Gestion de la recherche des permissions
  onPermissionSearch(): void {
    this.applyPermissionFilter();
  }

  clearPermissionSearch(): void {
    this.searchTerm = '';
    this.applyPermissionFilter();
  }

  private applyPermissionFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredGroupedPermissions = { ...this.groupedPermissions };
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredGroupedPermissions = {};

    Object.keys(this.groupedPermissions).forEach(category => {
      const filteredPermissions = this.groupedPermissions[category].filter(permission =>
        permission.nom.toLowerCase().includes(term) ||
        (permission.description && permission.description.toLowerCase().includes(term))
      );

      if (filteredPermissions.length > 0) {
        this.filteredGroupedPermissions[category] = filteredPermissions;
      }
    });
  }

  getCategoryLabel(categoryKey: string): string {
    const category = this.categories.find(cat => cat.key === categoryKey);
    return category ? category.label : categoryKey;
  }

  getCategoryIcon(categoryKey: string): string {
    const category = this.categories.find(cat => cat.key === categoryKey);
    return category ? category.icon : 'folder';
  }

  getCategoryDescription(categoryKey: string): string {
    const category = this.categories.find(cat => cat.key === categoryKey);
    return category ? category.description : '';
  }

  isPermissionSelected(permission: Permission): boolean {
    return this.permissionSelection.isSelected(permission);
  }

  togglePermission(permission: Permission): void {
    this.permissionSelection.toggle(permission);
  }

  toggleCategoryPermissions(category: string): void {
    const permissions = this.filteredGroupedPermissions[category] || this.groupedPermissions[category];
    if (!permissions) return;

    const allSelected = permissions.every(p => this.permissionSelection.isSelected(p));

    if (allSelected) {
      permissions.forEach(p => this.permissionSelection.deselect(p));
    } else {
      permissions.forEach(p => this.permissionSelection.select(p));
    }
  }

  isCategorySelected(category: string): boolean {
    const permissions = this.filteredGroupedPermissions[category] || this.groupedPermissions[category];
    return permissions && permissions.length > 0 &&
           permissions.every(p => this.permissionSelection.isSelected(p));
  }

  isCategoryIndeterminate(category: string): boolean {
    const permissions = this.filteredGroupedPermissions[category] || this.groupedPermissions[category];
    if (!permissions || permissions.length === 0) return false;

    const selectedCount = permissions.filter(p => this.permissionSelection.isSelected(p)).length;
    return selectedCount > 0 && selectedCount < permissions.length;
  }

  // Exemples de rôles
  fillRoleExample(exampleName: string): void {
    const example = this.roleExamples.find(ex => ex.name === exampleName);
    if (!example) return;

    this.roleForm.patchValue({
      nom: example.name,
      description: example.description
    });

    // Sélectionner les permissions des catégories correspondantes
    this.permissionSelection.clear();
    example.permissions.forEach(categoryKey => {
      const permissions = this.groupedPermissions[categoryKey] || [];
      permissions.forEach(permission => {
        this.permissionSelection.select(permission);
      });
    });

    // Marquer les champs comme modifiés
    this.roleForm.get('nom')?.markAsDirty();
    this.roleForm.get('description')?.markAsDirty();
  }

  // Validation
  isFormValid(): boolean {
    return this.roleForm.valid && this.permissionSelection.selected.length > 0;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.roleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.roleForm.get(fieldName);
    if (field && field.errors && (field.touched || field.dirty)) {
      if (field.errors['required']) return `Le champ ${fieldName} est requis`;
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Le champ ${fieldName} doit contenir au moins ${requiredLength} caractères`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Le champ ${fieldName} ne peut pas dépasser ${maxLength} caractères`;
      }
      if (field.errors['pattern']) {
        return 'Le nom doit contenir uniquement des lettres majuscules, chiffres et underscores';
      }
    }
    return '';
  }

  getSelectedPermissionsCount(): number {
    return this.permissionSelection.selected.length;
  }

  getFormCompletionPercentage(): number {
    let completion = 0;

    // Nom du rôle (30%)
    if (this.roleForm.get('nom')?.valid) completion += 30;

    // Description (30%)
    if (this.roleForm.get('description')?.valid) completion += 30;

    // Permissions (40%)
    if (this.permissionSelection.selected.length > 0) completion += 40;

    return completion;
  }

  // Actions
  onSubmit(): void {
    if (!this.isFormValid()) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;

    const formData = {
      ...this.roleForm.value,
      permissions: this.permissionSelection.selected.map(p => p.id)
    };

    const request = this.isEditMode
      ? this.roleService.updateRole(this.data.role!.id!, formData)
      : this.roleService.createRole(formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        this.loading = false;
        this.showSnackBar(
          this.isEditMode ? 'Rôle modifié avec succès' : 'Rôle créé avec succès',
          'success'
        );
        this.dialogRef.close(result);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la sauvegarde:', error);
        this.showSnackBar('Erreur lors de la sauvegarde', 'error');
      }
    });
  }

  onCancel(): void {
    if (this.roleForm.dirty || this.permissionSelection.selected.length > 0) {
      const confirmCancel = confirm(
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer sans sauvegarder ?'
      );
      if (!confirmCancel) return;
    }

    this.dialogRef.close();
  }

  resetForm(): void {
    this.roleForm.reset();
    this.permissionSelection.clear();
    this.searchTerm = '';
    this.applyPermissionFilter();

    if (this.isEditMode && this.data.role) {
      this.roleForm.patchValue({
        nom: this.data.role.nom,
        description: this.data.role.description
      });

      if (this.data.role.permissions) {
        this.permissionSelection.select(...this.data.role.permissions);
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.roleForm.controls).forEach(key => {
      this.roleForm.get(key)?.markAsTouched();
    });
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  // Raccourcis clavier
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.resetForm();
    }
  }
}
