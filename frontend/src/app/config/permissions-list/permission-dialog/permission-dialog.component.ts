import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { Permission } from '../../../models/permission';

// Interface pour les données du dialog
interface DialogData {
  permission: Permission | null;
  title: string;
  mode?: 'create' | 'edit';
}

// Interface pour les exemples de permissions
interface PermissionExample {
  type: string;
  name: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permission-dialog.component.html',
  styleUrls: ['./permission-dialog.component.css']
})
export class PermissionDialogComponent implements OnInit, OnDestroy {
  permissionForm: FormGroup;
  private destroy$ = new Subject<void>();

  // Exemples de permissions prédéfinies
  permissionExamples: PermissionExample[] = [
    {
      type: 'user',
      name: 'CAN_MANAGE_USERS',
      description: 'Permet de créer, modifier et supprimer des utilisateurs',
      icon: 'people'
    },
    {
      type: 'role',
      name: 'CAN_MANAGE_ROLES',
      description: 'Permet de gérer les rôles et leurs permissions',
      icon: 'security'
    },
    {
      type: 'report',
      name: 'CAN_VIEW_REPORTS',
      description: 'Permet d\'accéder aux rapports et analyses',
      icon: 'assessment'
    },
    {
      type: 'setting',
      name: 'CAN_MANAGE_SETTINGS',
      description: 'Permet de modifier les paramètres système',
      icon: 'settings'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<PermissionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder
  ) {
    this.permissionForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupFormValidation();
    this.setupRealTimeFormatting();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Crée le formulaire avec validation
   */
  private createForm(): FormGroup {
    return this.fb.group({
      nom: [
        this.data.permission?.nom || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
          Validators.pattern(/^[A-Z_][A-Z0-9_]*$/)
        ]
      ],
      description: [
        this.data.permission?.description || '',
        [Validators.maxLength(255)]
      ]
    });
  }

  /**
   * Configure la validation en temps réel
   */
  private setupFormValidation(): void {
    // Validation du nom en temps réel
    this.permissionForm.get('nom')?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && !value.startsWith('CAN_')) {
          this.suggestPermissionFormat();
        }
      });
  }

  /**
   * Configure le formatage automatique
   */
  private setupRealTimeFormatting(): void {
    const nomControl = this.permissionForm.get('nom');

    nomControl?.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.length > 3) {
          this.autoFormatPermissionName(value);
        }
      });
  }

  /**
   * Formate automatiquement le nom de la permission
   */
  private autoFormatPermissionName(value: string): void {
    const nomControl = this.permissionForm.get('nom');
    if (nomControl && !nomControl.hasError('pattern')) {
      const formatted = value
        .toUpperCase()
        .replace(/[^A-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      if (formatted !== value) {
        nomControl.setValue(formatted, { emitEvent: false });
      }
    }
  }

  /**
   * Vérifie si le formulaire est valide
   */
  isFormValid(): boolean {
    return this.permissionForm.valid;
  }

  /**
   * Vérifie si un champ a des erreurs
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.permissionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtient les erreurs du champ nom avec messages détaillés
   */
  getNomErrors(): string {
    const nomControl = this.permissionForm.get('nom');

    if (nomControl?.hasError('required')) {
      return 'Le nom de la permission est obligatoire';
    }

    if (nomControl?.hasError('minlength')) {
      return 'Le nom doit contenir au moins 3 caractères';
    }

    if (nomControl?.hasError('maxlength')) {
      return 'Le nom ne peut pas dépasser 50 caractères';
    }

    if (nomControl?.hasError('pattern')) {
      return 'Le nom doit contenir uniquement des lettres majuscules, chiffres et underscores';
    }

    return '';
  }

  /**
   * Obtient les erreurs du champ description
   */
  getDescriptionErrors(): string {
    const descControl = this.permissionForm.get('description');

    if (descControl?.hasError('maxlength')) {
      return 'La description ne peut pas dépasser 255 caractères';
    }

    return '';
  }

  /**
   * Pré-remplit avec des exemples selon le type
   */
  fillExample(type: string): void {
    const example = this.permissionExamples.find(ex => ex.type === type);

    if (example) {
      this.permissionForm.patchValue({
        nom: example.name,
        description: example.description
      });

      // Marquer les champs comme modifiés pour déclencher la validation
      this.permissionForm.get('nom')?.markAsDirty();
      this.permissionForm.get('description')?.markAsDirty();
    }
  }

  /**
   * Suggère un format de permission amélioré
   */
  suggestPermissionFormat(): void {
    const nomControl = this.permissionForm.get('nom');

    if (nomControl && nomControl.value) {
      let currentValue = nomControl.value.toString().toUpperCase();

      // Nettoyer et formatter
      currentValue = currentValue
        .replace(/[^A-Z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      // Ajouter CAN_ si nécessaire
      if (!currentValue.startsWith('CAN_') && currentValue.length > 0) {
        currentValue = `CAN_${currentValue}`;
      }

      // Mettre à jour seulement si différent
      if (currentValue !== nomControl.value) {
        nomControl.setValue(currentValue, { emitEvent: false });
      }
    }
  }

  /**
   * Génère automatiquement une description basée sur le nom
   */
  generateDescriptionFromName(): void {
    const nomControl = this.permissionForm.get('nom');
    const descControl = this.permissionForm.get('description');

    if (nomControl?.value && !descControl?.value) {
      const name = nomControl.value.toString();
      let description = '';

      // Extraire l'action et la ressource du nom
      const parts = name.replace('CAN_', '').split('_');

      if (parts.length >= 2) {
        const action = this.translateAction(parts[0]);
        const resource = this.translateResource(parts.slice(1).join('_'));
        description = `Permet de ${action} ${resource}`;
      } else {
        description = `Permission pour ${name.toLowerCase().replace(/_/g, ' ')}`;
      }

      descControl?.setValue(description);
    }
  }

  /**
   * Traduit les actions communes en français
   */
  private translateAction(action: string): string {
    const translations: { [key: string]: string } = {
      'CREATE': 'créer',
      'READ': 'consulter',
      'VIEW': 'consulter',
      'UPDATE': 'modifier',
      'EDIT': 'modifier',
      'DELETE': 'supprimer',
      'MANAGE': 'gérer',
      'ACCESS': 'accéder à',
      'ADMIN': 'administrer',
      'EXPORT': 'exporter',
      'IMPORT': 'importer',
      'DOWNLOAD': 'télécharger',
      'UPLOAD': 'téléverser'
    };

    return translations[action] || action.toLowerCase();
  }

  /**
   * Traduit les ressources communes en français
   */
  private translateResource(resource: string): string {
    const translations: { [key: string]: string } = {
      'USERS': 'les utilisateurs',
      'USER': 'les utilisateurs',
      'ROLES': 'les rôles',
      'ROLE': 'les rôles',
      'PERMISSIONS': 'les permissions',
      'PERMISSION': 'les permissions',
      'SETTINGS': 'les paramètres',
      'REPORTS': 'les rapports',
      'REPORT': 'les rapports',
      'DASHBOARD': 'le tableau de bord',
      'PROFILE': 'le profil',
      'PROFILES': 'les profils',
      'LOGS': 'les journaux',
      'AUDIT': 'l\'audit',
      'SYSTEM': 'le système',
      'DATABASE': 'la base de données',
      'FILES': 'les fichiers',
      'DOCUMENTS': 'les documents'
    };

    return translations[resource] || resource.toLowerCase().replace(/_/g, ' ');
  }

  /**
   * Valide la unicité du nom de permission (simulation)
   */
  validatePermissionUniqueness(): boolean {
    const nomControl = this.permissionForm.get('nom');

    if (nomControl?.value && this.data.mode === 'create') {
      // Ici, en production, vous feriez un appel API pour vérifier l'unicité
      // Pour la démo, on simule quelques noms interdits
      const forbiddenNames = ['CAN_ADMIN_SYSTEM', 'CAN_ROOT_ACCESS'];

      if (forbiddenNames.includes(nomControl.value)) {
        nomControl.setErrors({ 'unique': true });
        return false;
      }
    }

    return true;
  }

  /**
   * Obtient les suggestions de noms basées sur la saisie
   */
  getNameSuggestions(): string[] {
    const nomControl = this.permissionForm.get('nom');
    const currentValue = nomControl?.value || '';

    if (currentValue.length < 3) return [];

    const suggestions = [
      'CAN_VIEW_',
      'CAN_CREATE_',
      'CAN_EDIT_',
      'CAN_DELETE_',
      'CAN_MANAGE_',
      'CAN_ADMIN_',
      'CAN_ACCESS_',
      'CAN_EXPORT_'
    ];

    return suggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(currentValue.toLowerCase()) ||
        currentValue.toLowerCase().includes(suggestion.toLowerCase())
      )
      .map(suggestion => {
        if (currentValue.startsWith('CAN_')) {
          return currentValue.toUpperCase();
        }
        return suggestion + currentValue.replace('CAN_', '').toUpperCase();
      })
      .slice(0, 5);
  }

  /**
   * Réinitialise le formulaire avec animation
   */
  resetForm(): void {
    // Animation de réinitialisation
    const formElement = document.querySelector('.permission-form');
    formElement?.classList.add('resetting');

    setTimeout(() => {
      this.permissionForm.reset();
      this.permissionForm.patchValue({
        nom: this.data.permission?.nom || '',
        description: this.data.permission?.description || ''
      });

      // Nettoyer les états de validation
      Object.keys(this.permissionForm.controls).forEach(key => {
        this.permissionForm.get(key)?.setErrors(null);
        this.permissionForm.get(key)?.markAsUntouched();
        this.permissionForm.get(key)?.markAsPristine();
      });

      formElement?.classList.remove('resetting');
    }, 200);
  }

  /**
   * Valide le formulaire avant soumission
   */
  private validateBeforeSubmit(): boolean {
    // Marquer tous les champs comme touchés pour afficher les erreurs
    Object.keys(this.permissionForm.controls).forEach(key => {
      this.permissionForm.get(key)?.markAsTouched();
    });

    // Validation personnalisée de l'unicité
    if (!this.validatePermissionUniqueness()) {
      return false;
    }

    return this.permissionForm.valid;
  }

  /**
   * Obtient les données du formulaire formatées
   */
  private getFormattedFormData(): Permission {
    const formValue = this.permissionForm.value;

    return {
      nom: formValue.nom.trim().toUpperCase(),
      description: formValue.description?.trim() || '',
      // Ajouter d'autres propriétés si nécessaire
      id: this.data.permission?.id
    };
  }

  /**
   * Annule et ferme le dialog avec confirmation si modifications
   */
  onCancel(): void {
    if (this.permissionForm.dirty) {
      const confirmCancel = confirm(
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir fermer sans sauvegarder ?'
      );

      if (!confirmCancel) {
        return;
      }
    }

    this.dialogRef.close();
  }

  /**
   * Sauvegarde les données avec validation complète
   */
  onSave(): void {
    if (!this.validateBeforeSubmit()) {
      // Faire défiler jusqu'au premier champ en erreur
      this.scrollToFirstError();
      return;
    }

    const formattedData = this.getFormattedFormData();
    this.dialogRef.close(formattedData);
  }

  /**
   * Fait défiler jusqu'au premier champ en erreur
   */
  private scrollToFirstError(): void {
    const firstErrorField = document.querySelector('.mat-mdc-form-field.mat-form-field-invalid');

    if (firstErrorField) {
      firstErrorField.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Focus sur le champ
      const input = firstErrorField.querySelector('input, textarea') as HTMLElement;
      input?.focus();
    }
  }

  /**
   * Raccourcis clavier
   */
  onKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Enter pour sauvegarder
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.onSave();
    }

    // Échap pour fermer
    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCancel();
    }

    // Ctrl/Cmd + R pour réinitialiser
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.resetForm();
    }
  }

  /**
   * Obtient le pourcentage de completion du formulaire
   */
  getFormCompletionPercentage(): number {
    const controls = this.permissionForm.controls;
    const totalFields = Object.keys(controls).length;
    let completedFields = 0;

    Object.keys(controls).forEach(key => {
      const control = controls[key];
      if (control.value && control.value.toString().trim().length > 0) {
        completedFields++;
      }
    });

    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Vérifie si le mode est création
   */
  isCreateMode(): boolean {
    return this.data.mode === 'create' || !this.data.permission;
  }

  /**
   * Vérifie si le mode est édition
   */
  isEditMode(): boolean {
    return this.data.mode === 'edit' && !!this.data.permission;
  }

  /**
   * Obtient l'icône appropriée pour le titre
   */
  getTitleIcon(): string {
    return this.isCreateMode() ? 'add_circle' : 'edit';
  }

  /**
   * Obtient le texte du bouton de sauvegarde
   */
  getSaveButtonText(): string {
    return this.isCreateMode() ? 'Créer' : 'Modifier';
  }

  /**
   * Obtient l'icône du bouton de sauvegarde
   */
  getSaveButtonIcon(): string {
    return this.isCreateMode() ? 'add' : 'save';
  }
}
