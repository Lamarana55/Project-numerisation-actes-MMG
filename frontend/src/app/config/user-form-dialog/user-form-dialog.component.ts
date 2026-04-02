import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RoleService } from '../../services/role.service';
import { TerritoryService } from '../../services/territory.service';
import { Role, NIVEAU_LABELS, PROFIL_META } from '../../models/role';
import { User, NiveauAdministratif } from '../../models/user';
import { RegionDTO, PrefectureDTO, CommuneDTO } from '../../models/geodata';

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
export class UserFormDialogComponent implements OnInit, OnDestroy {

  userForm!: FormGroup;
  loading = false;
  isEditMode = false;

  // ── Profils / rôles ──────────────────────────────────────────────────────
  availableRoles: Role[] = [];
  selectedRole: Role | null = null;

  // ── Territoires ──────────────────────────────────────────────────────────
  regions: RegionDTO[] = [];
  prefectures: PrefectureDTO[] = [];
  communes: CommuneDTO[] = [];
  loadingPrefectures = false;
  loadingCommunes = false;

  // Niveau du profil sélectionné — détermine quels selects afficher
  selectedNiveau: NiveauAdministratif | null = null;

  readonly NIVEAU_LABELS = NIVEAU_LABELS;
  readonly PROFIL_META = PROFIL_META;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private territoryService: TerritoryService,
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
    this.loadRegions();
    this.setupFormListeners();

    if (this.isEditMode && this.data.user) {
      this.patchUserValues(this.data.user);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Initialisation ───────────────────────────────────────────────────────

  private createForm(): FormGroup {
    return this.fb.group({
      nom:                ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      prenom:             ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:              ['', [Validators.required, Validators.email]],
      username:           ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
      telephone:          ['', [Validators.pattern('^[0-9+\\-\\s()]{8,20}$')]],
      fonction:           [''],
      roleId:             ['', Validators.required],
      // Sécurité
      mustChangePassword: [true],   // Par défaut : obliger le changement à la première connexion
      // Territoire (optionnels — la validation est appliquée dynamiquement)
      regionId:           [''],
      prefectureId:       [''],
      communeId:          ['']
    });
  }

  private patchUserValues(user: User): void {
    this.userForm.patchValue({
      nom:                user.nom,
      prenom:             user.prenom,
      email:              user.email,
      username:           user.username,
      telephone:          user.telephone,
      fonction:           user.fonction,
      mustChangePassword: user.mustChangePassword ?? false
    });
  }

  private loadRoles(): void {
    if (this.availableRoles.length > 0) {
      this.applyEditModeRole();
      return;
    }
    this.roleService.getAllRoles().pipe(takeUntil(this.destroy$)).subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.applyEditModeRole();
      },
      error: () => this.showSnackBar('Erreur lors du chargement des profils', 'error')
    });
  }

  private applyEditModeRole(): void {
    if (!this.isEditMode || !this.data.user) return;
    const roleName = this.data.user.roleName ?? this.data.user.role?.nom;
    const matched  = this.availableRoles.find(r => r.nom === roleName);
    if (matched) {
      this.userForm.patchValue({ roleId: matched.id });
      this.selectedRole  = matched;
      this.selectedNiveau = matched.niveauAdministratif ?? null;
      this.applyTerritoryValidation(matched.niveauAdministratif ?? null);
      this.restoreEditModeTerritory();
    }
  }

  private loadRegions(): void {
    this.territoryService.getRegions().pipe(takeUntil(this.destroy$)).subscribe({
      next: (regions) => this.regions = regions,
      error: () => this.showSnackBar('Erreur lors du chargement des régions', 'error')
    });
  }

  // ── Écoutes réactives ────────────────────────────────────────────────────

  private setupFormListeners(): void {
    // Changement de profil → afficher/masquer les sélecteurs territoriaux
    this.userForm.get('roleId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(roleId => {
        this.selectedRole   = this.availableRoles.find(r => r.id === roleId) || null;
        this.selectedNiveau = this.selectedRole?.niveauAdministratif ?? null;
        this.resetTerritoryFields();
        this.applyTerritoryValidation(this.selectedNiveau);
      });

    // Changement de région → charger préfectures
    this.userForm.get('regionId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(regionId => {
        this.userForm.patchValue({ prefectureId: '', communeId: '' }, { emitEvent: false });
        this.prefectures = [];
        this.communes    = [];
        if (regionId) this.loadPrefectures(regionId);
      });

    // Changement de préfecture → charger communes
    this.userForm.get('prefectureId')!.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(prefectureId => {
        this.userForm.patchValue({ communeId: '' }, { emitEvent: false });
        this.communes = [];
        if (prefectureId) this.loadCommunes(prefectureId);
      });
  }

  private loadPrefectures(regionId: string): void {
    const region = this.regions.find(r => r.id === regionId);
    if (!region) return;
    this.loadingPrefectures = true;
    this.territoryService.getPrefecturesByRegionCode(region.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (prefectures) => { this.prefectures = prefectures; this.loadingPrefectures = false; },
        error: () => { this.loadingPrefectures = false; }
      });
  }

  private loadCommunes(prefectureId: string): void {
    const prefecture = this.prefectures.find(p => p.id === prefectureId);
    if (!prefecture) return;
    this.loadingCommunes = true;
    this.territoryService.getCommunesByPrefectureCode(prefecture.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (communes) => { this.communes = communes; this.loadingCommunes = false; },
        error: () => { this.loadingCommunes = false; }
      });
  }

  /** Recharger les sélecteurs territoriaux en mode édition */
  private restoreEditModeTerritory(): void {
    const user = this.data.user!;
    if (!user.regionId) return;

    // Patch région puis charger les prefectures
    this.userForm.patchValue({ regionId: user.regionId }, { emitEvent: false });
    const region = this.regions.find(r => r.id === user.regionId);
    if (region && user.prefectureId) {
      this.territoryService.getPrefecturesByRegionCode(region.code)
        .pipe(takeUntil(this.destroy$))
        .subscribe(prefectures => {
          this.prefectures = prefectures;
          this.userForm.patchValue({ prefectureId: user.prefectureId }, { emitEvent: false });

          if (user.communeId) {
            const pref = prefectures.find(p => p.id === user.prefectureId);
            if (pref) {
              this.territoryService.getCommunesByPrefectureCode(pref.code)
                .pipe(takeUntil(this.destroy$))
                .subscribe(communes => {
                  this.communes = communes;
                  this.userForm.patchValue({ communeId: user.communeId }, { emitEvent: false });
                });
            }
          }
        });
    }
  }

  // ── Validation dynamique ─────────────────────────────────────────────────

  private applyTerritoryValidation(niveau: NiveauAdministratif | null): void {
    const regionCtrl     = this.userForm.get('regionId')!;
    const prefectureCtrl = this.userForm.get('prefectureId')!;
    const communeCtrl    = this.userForm.get('communeId')!;

    regionCtrl.clearValidators();
    prefectureCtrl.clearValidators();
    communeCtrl.clearValidators();

    if (niveau === 'REGIONAL') {
      regionCtrl.setValidators(Validators.required);
    } else if (niveau === 'PREFECTORAL') {
      regionCtrl.setValidators(Validators.required);
      prefectureCtrl.setValidators(Validators.required);
    } else if (niveau === 'COMMUNAL') {
      regionCtrl.setValidators(Validators.required);
      prefectureCtrl.setValidators(Validators.required);
      communeCtrl.setValidators(Validators.required);
    }

    regionCtrl.updateValueAndValidity();
    prefectureCtrl.updateValueAndValidity();
    communeCtrl.updateValueAndValidity();
  }

  private resetTerritoryFields(): void {
    this.userForm.patchValue({ regionId: '', prefectureId: '', communeId: '' }, { emitEvent: false });
    this.prefectures = [];
    this.communes    = [];
  }

  // ── Helpers template ─────────────────────────────────────────────────────

  get showRegion(): boolean {
    return ['REGIONAL', 'PREFECTORAL', 'COMMUNAL'].includes(this.selectedNiveau ?? '');
  }

  get showPrefecture(): boolean {
    return ['PREFECTORAL', 'COMMUNAL'].includes(this.selectedNiveau ?? '');
  }

  get showCommune(): boolean {
    return this.selectedNiveau === 'COMMUNAL';
  }

  getProfilMeta(nom: string) {
    return PROFIL_META[nom] ?? null;
  }

  getNiveauLabel(niveau: NiveauAdministratif | null | undefined): string {
    return niveau ? NIVEAU_LABELS[niveau] : '';
  }

  // ── Génération automatique email / username ──────────────────────────────

  generateUsername(): void {
    const nom    = this.userForm.get('nom')?.value?.trim() || '';
    const prenom = this.userForm.get('prenom')?.value?.trim() || '';
    if (nom && prenom) {
      const base  = `${prenom.toLowerCase()}.${nom.toLowerCase()}`.replace(/[^a-z0-9.]/g, '');
      const email = `${base}@ravec.gov.gn`;
      if (this.isEditMode) {
        this.userForm.patchValue({ email });
      } else {
        this.userForm.patchValue({ username: email, email });
      }
    }
  }

  // ── Soumission ───────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.showSnackBar('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }
    this.dialogRef.close(this.prepareFormData());
  }

  private prepareFormData(): any {
    const v = this.userForm.value;
    const data: any = {
      nom:                v.nom,
      prenom:             v.prenom,
      email:              v.email,
      username:           v.username,
      telephone:          v.telephone,
      fonction:           v.fonction,
      roleId:             v.roleId,
      mustChangePassword: v.mustChangePassword,
    };
    // N'inclure les territoires que s'ils ont une valeur
    if (v.regionId)     data.regionId     = v.regionId;
    if (v.prefectureId) data.prefectureId = v.prefectureId;
    if (v.communeId)    data.communeId    = v.communeId;
    return data;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // ── Erreurs ──────────────────────────────────────────────────────────────

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required'])  return fieldName === 'roleId' ? 'Veuillez sélectionner un profil' :
                                            fieldName === 'regionId'     ? 'La région est requise' :
                                            fieldName === 'prefectureId' ? 'La préfecture est requise' :
                                            fieldName === 'communeId'    ? 'La commune est requise' :
                                            'Le champ est requis';
      if (field.errors['email'])     return "Format d'email invalide";
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
