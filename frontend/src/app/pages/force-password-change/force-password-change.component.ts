import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/** Validateur de groupe : vérifie que newPassword === confirmPassword */
function passwordsMatch(group: AbstractControl): { [key: string]: boolean } | null {
  const newPwd  = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
}

/** Validateur de groupe : newPassword ne doit PAS être identique à currentPassword */
function passwordsDifferentFromCurrent(group: AbstractControl): { [key: string]: boolean } | null {
  const current = group.get('currentPassword')?.value;
  const newPwd  = group.get('newPassword')?.value;
  return current && newPwd && current === newPwd ? { passwordsSame: true } : null;
}

@Component({
  selector: 'app-force-password-change',
  templateUrl: './force-password-change.component.html',
  styleUrls: ['./force-password-change.component.css']
})
export class ForcePasswordChangeComponent {

  form: FormGroup;
  loading        = false;
  errorMessage   = '';
  successMessage = '';

  showCurrentPwd  = false;
  showNewPwd      = false;
  showConfirmPwd  = false;

  constructor(
    private fb:          FormBuilder,
    private authService: AuthService,
    private router:      Router
  ) {
    this.form = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [
        Validators.required,
        Validators.minLength(8),
        // Au moins 1 maj, 1 min, 1 chiffre, 1 caractère spécial
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: [passwordsMatch, passwordsDifferentFromCurrent] });
  }

  // ── Indicateur de force ──────────────────────────────────────────────────

  get passwordStrength(): number {
    const pwd = this.form.get('newPassword')?.value || '';
    return this.authService.checkPasswordStrength(pwd).score;
  }

  get strengthLabel(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'Très faible';
    if (s === 2) return 'Faible';
    if (s === 3) return 'Moyen';
    if (s === 4) return 'Fort';
    return 'Très fort';
  }

  get strengthClass(): string {
    const s = this.passwordStrength;
    if (s <= 1) return 'very-weak';
    if (s === 2) return 'weak';
    if (s === 3) return 'medium';
    if (s === 4) return 'strong';
    return 'very-strong';
  }

  // ── Helpers règles ───────────────────────────────────────────────────────

  get pwd(): string { return this.form.get('newPassword')?.value || ''; }

  get rule8chars(): boolean    { return this.pwd.length >= 8; }
  get ruleUppercase(): boolean { return /[A-Z]/.test(this.pwd); }
  get ruleLowercase(): boolean { return /[a-z]/.test(this.pwd); }
  get ruleDigit(): boolean     { return /\d/.test(this.pwd); }
  get ruleSpecial(): boolean   { return /[^a-zA-Z0-9]/.test(this.pwd); }

  /** Vrai si newPassword === currentPassword (erreur de groupe) */
  get passwordsSameError(): boolean {
    return !!this.form.errors?.['passwordsSame'] &&
           !!this.form.get('newPassword')?.dirty;
  }

  // ── Soumission ───────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading      = true;
    this.errorMessage = '';

    const { currentPassword, newPassword } = this.form.value;

    // Vérification explicite : le nouveau mot de passe ne doit pas être identique à l'ancien
    if (currentPassword === newPassword) {
      this.loading      = false;
      this.errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien.';
      return;
    }

    this.authService.changeFirstPassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.authService.clearMustChangePassword();
        this.successMessage = 'Mot de passe modifié avec succès ! Redirection en cours…';
        setTimeout(() => this.router.navigate(['/admin/dashboard']), 1800);
      },
      error: () => {
        this.loading      = false;
        this.errorMessage = 'Le mot de passe actuel est incorrect. Veuillez réessayer.';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
