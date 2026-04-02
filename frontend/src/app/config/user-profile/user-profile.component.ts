import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../services/auth.service';
import { ActivityService, Activity, ActivityType } from '../../services/activity.service';
import { PreferencesService, UserPreferences } from '../../services/preferences.service';
import { User } from '../../models/user';

/** Validateur de groupe : newPassword doit être identique à confirmPassword */
function passwordsMatch(group: AbstractControl): { [key: string]: boolean } | null {
  const np = group.get('newPassword')?.value;
  const cp = group.get('confirmPassword')?.value;
  return np && cp && np !== cp ? { passwordsMismatch: true } : null;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, OnDestroy {

  currentUser: User | null = null;
  loading          = false;
  selectedTabIndex = 0;

  // ── Formulaire profil ────────────────────────────────────────────────────
  profileForm!: FormGroup;
  savingProfile = false;

  // ── Formulaire mot de passe ──────────────────────────────────────────────
  passwordForm!: FormGroup;
  savingPassword  = false;
  passwordSuccess = false;
  showCurrentPwd  = false;
  showNewPwd      = false;
  showConfirmPwd  = false;

  // ── Activités ────────────────────────────────────────────────────────────
  activities: Activity[] = [];

  // ── Préférences ──────────────────────────────────────────────────────────
  preferencesForm!: FormGroup;
  savingPreferences = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private activitySvc: ActivityService,
    private prefSvc:     PreferencesService,
    private snackBar:    MatSnackBar
  ) {}

  ngOnInit(): void {
    this.buildForms();
    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Construction des formulaires ─────────────────────────────────────────

  private buildForms(): void {
    this.profileForm = this.fb.group({
      prenom:    ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      nom:       ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email:     ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern('^[0-9+\\-\\s()]{8,20}$')]],
      fonction:  ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });

    this.preferencesForm = this.fb.group({
      language:             ['fr'],
      timezone:             ['Africa/Conakry'],
      darkMode:             [false],
      emailNotifications:   [true],
      browserNotifications: [false],
      soundNotifications:   [false]
    });
  }

  // ── Chargement initial ───────────────────────────────────────────────────

  loadProfile(): void {
    this.loading = true;
    this.authService.getMyProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: User) => {
          this.currentUser = user;
          this.loading = false;
          this.profileForm.patchValue({
            prenom:    user.prenom    || '',
            nom:       user.nom       || '',
            email:     user.email     || '',
            telephone: user.telephone || '',
            fonction:  user.fonction  || ''
          });
          this.loadActivities();
          this.loadPreferences();
        },
        error: () => {
          this.loading = false;
          this.snack('Impossible de charger le profil', 'error');
        }
      });
  }

  private loadActivities(): void {
    this.activities = this.activitySvc.getActivities(this.currentUser?.username || '');
  }

  private loadPreferences(): void {
    const prefs = this.prefSvc.get(this.currentUser?.username || '');
    this.preferencesForm.patchValue(prefs, { emitEvent: false });
  }

  // ── Getters template ─────────────────────────────────────────────────────

  get fullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.prenom || ''} ${this.currentUser.nom || ''}`.trim();
  }

  get profilLabel(): string {
    return this.currentUser?.roleLibelle ?? this.currentUser?.roleName ?? 'Utilisateur';
  }

  get niveauLabel(): string {
    const map: Record<string, string> = {
      CENTRAL:     'Niveau National',
      REGIONAL:    'Niveau Régional',
      PREFECTORAL: 'Niveau Préfectoral',
      COMMUNAL:    'Niveau Communal'
    };
    return map[this.currentUser?.niveauAdministratif ?? ''] || '';
  }

  get initials(): string {
    const parts = this.fullName.trim().split(/\s+/).filter(p => p.length > 0);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // ── Force du mot de passe ────────────────────────────────────────────────

  get pwd(): string { return this.passwordForm.get('newPassword')?.value || ''; }

  get passwordStrength(): number {
    return this.authService.checkPasswordStrength(this.pwd).score;
  }

  get strengthClass(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'very-weak';
    if (s === 2) return 'weak';
    if (s === 3) return 'medium';
    if (s === 4) return 'strong';
    return 'very-strong';
  }

  get strengthLabel(): string {
    const labels = ['', 'Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort'];
    return labels[Math.min(this.passwordStrength, 5)] || '';
  }

  get rule8chars(): boolean    { return this.pwd.length >= 8; }
  get ruleUppercase(): boolean { return /[A-Z]/.test(this.pwd); }
  get ruleLowercase(): boolean { return /[a-z]/.test(this.pwd); }
  get ruleDigit(): boolean     { return /\d/.test(this.pwd); }
  get ruleSpecial(): boolean   { return /[^a-zA-Z0-9]/.test(this.pwd); }

  // ── Soumission profil ────────────────────────────────────────────────────

  updateProfile(): void {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.savingProfile = true;
    const v = this.profileForm.value;

    this.authService.updateMyProfile({
      nom: v.nom, prenom: v.prenom,
      email: v.email, telephone: v.telephone, fonction: v.fonction
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updated: User) => {
        this.currentUser = { ...this.currentUser!, ...updated };
        this.savingProfile = false;
        this.snack('Profil mis à jour avec succès', 'success');
        this.track('update_profile', 'Profil mis à jour', 'Modification des informations personnelles');
      },
      error: () => {
        this.savingProfile = false;
        this.snack('Erreur lors de la mise à jour du profil', 'error');
      }
    });
  }

  resetProfileForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        prenom:    this.currentUser.prenom    || '',
        nom:       this.currentUser.nom       || '',
        email:     this.currentUser.email     || '',
        telephone: this.currentUser.telephone || '',
        fonction:  this.currentUser.fonction  || ''
      });
      this.profileForm.markAsPristine();
    }
  }

  // ── Soumission mot de passe ──────────────────────────────────────────────

  changePassword(): void {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.savingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changeFirstPassword(currentPassword, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.savingPassword  = false;
          this.passwordSuccess = true;
          this.passwordForm.reset();
          this.authService.clearMustChangePassword();
          this.snack('Mot de passe modifié avec succès', 'success');
          this.track('change_password', 'Mot de passe modifié', 'Changement du mot de passe de connexion');
          setTimeout(() => this.passwordSuccess = false, 5000);
        },
        error: () => {
          this.savingPassword = false;
          this.snack('Mot de passe actuel incorrect. Veuillez réessayer.', 'error');
        }
      });
  }

  // ── Soumission préférences ───────────────────────────────────────────────

  savePreferences(): void {
    this.savingPreferences = true;
    const prefs: UserPreferences = this.preferencesForm.value;
    const username = this.currentUser?.username || '';

    if (prefs.browserNotifications && 'Notification' in window
        && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    this.prefSvc.save(username, prefs);
    setTimeout(() => {
      this.savingPreferences = false;
      this.snack('Préférences enregistrées', 'success');
      this.track('update_preferences', 'Préférences mises à jour', 'Modification des préférences');
    }, 500);
  }

  resetPreferencesForm(): void {
    const prefs = this.prefSvc.get(this.currentUser?.username || '');
    this.preferencesForm.patchValue(prefs, { emitEvent: false });
  }

  // ── Activités ────────────────────────────────────────────────────────────

  getActivityIcon(type: string): string {
    const map: Record<string, string> = {
      login: 'login', logout: 'logout',
      update_profile: 'edit', change_password: 'lock_reset', update_preferences: 'tune'
    };
    return map[type] || 'info';
  }

  getActivityClass(type: string): string {
    const map: Record<string, string> = {
      login: 'act-login', logout: 'act-logout',
      update_profile: 'act-update', change_password: 'act-password', update_preferences: 'act-prefs'
    };
    return map[type] || 'act-default';
  }

  get lastLoginActivity(): Activity | null {
    return this.activities.find(a => a.type === 'login') ?? null;
  }

  get lastPasswordChangeActivity(): Activity | null {
    return this.activities.find(a => a.type === 'change_password') ?? null;
  }

  clearActivities(): void {
    this.activitySvc.clear(this.currentUser?.username || '');
    this.activities = [];
    this.snack('Historique effacé', 'success');
  }

  exportActivityLog(): void {
    const header = `Historique — ${this.fullName} (${this.currentUser?.username})\n${'─'.repeat(70)}`;
    const lines = this.activities.map(a => {
      const d = new Date(a.timestamp).toLocaleString('fr-FR');
      return `${d}  |  ${a.title.padEnd(28)}  |  ${a.description}`;
    });
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activites_${(this.currentUser?.username || 'user').replace('@', '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  private track(type: ActivityType, title: string, description: string): void {
    const username = this.currentUser?.username || '';
    this.activitySvc.add(username, type, title, description);
    this.activities = this.activitySvc.getActivities(username);
  }

  private snack(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: `snackbar-${type}`
    });
  }
}
