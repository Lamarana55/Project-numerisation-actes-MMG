import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  serverError = false;
  serverMessage = '';
  loading = false; // Ajouter un état de chargement
  date: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Vérifier si l'utilisateur est déjà connecté
    if (this.authService.isAuthenticated) {
      console.log('Utilisateur déjà connecté, redirection...');
      // this.router.navigateByUrl('/admin/dashboard');
      this.router.navigateByUrl('/admin/simulation-npi');
      return;
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.serverError = false;
    this.serverMessage = '';

    const username = this.loginForm.value.username;
    const password = this.loginForm.value.password;

    console.log('Tentative de connexion pour:', username);

    this.authService.login(username, password).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.loading = false;
        // La navigation est déjà gérée dans le service AuthService
        // Mais on peut forcer si nécessaire
        this.router.navigateByUrl('/admin/simulation-npi');
      },
      error: (err) => {
        console.error('Erreur de connexion:', err);
        this.loading = false;
        this.serverError = true;

        // Gestion des différents types d'erreurs
        if (err.status === 403) {
          this.serverMessage = err.error?.message || 'Compte non trouvé. Veuillez contacter l\'administrateur.';
        } else if (err.status === 401) {
          this.serverMessage = err.error?.message || 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (err.status === 0) {
          this.serverMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else {
          this.serverMessage = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
        }
      },
    });
  }

  /**
   * Méthode utilitaire pour débugger
   */
  debugAuth() {
    this.authService.debugAuthState();
  }
}
