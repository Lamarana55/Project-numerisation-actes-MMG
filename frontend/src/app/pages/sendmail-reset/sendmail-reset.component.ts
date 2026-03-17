import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sendmail-reset',
  templateUrl: './sendmail-reset.component.html',
  styleUrl: './sendmail-reset.component.css',
})
export class SendmailResetComponent {
  forgotPasswordForm: FormGroup;
  serverMessage = '';
  serverError = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

 /*  sendResetLink() {
    if (this.forgotPasswordForm.invalid) return;
    const email = this.forgotPasswordForm.value.email;
    this.authService.sendResetLink(email).subscribe({
      next: (res) => {
        this.serverMessage =
          'Un lien de réinitialisation a été envoyé à votre e-mail.';
        this.serverError = false;
      },
      error: (err) => {
        this.serverMessage = err.status !== 403 ? "l'email n'existe pas dans la base." : "Une erreur s'est produite. Veuillez réessayer.";

        this.serverError = true;
      },
    });
  } */
}
