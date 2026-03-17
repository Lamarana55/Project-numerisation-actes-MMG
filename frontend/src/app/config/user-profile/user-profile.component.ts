import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Role } from '../../models/role';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

interface Activity {
  id: string;
  type: 'login' | 'update' | 'create' | 'delete' | 'validation';
  title: string;
  description: string;
  timestamp: Date;
}

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  currentUser: User | null = null;
  selectedTabIndex = 0;

  // Forms
  profileForm: FormGroup;
  preferencesForm: FormGroup;

  // État
  saving = false;
  savingPreferences = false;

  // Données de sécurité
  lastPasswordChange = new Date();
  activeSessions = 1;
  lastLogin = new Date();
  lastLoginLocation = 'Conakry, Guinée';

  // Activités récentes
  recentActivities: Activity[] = [
    {
      id: '1',
      type: 'login',
      title: 'Connexion réussie',
      description: 'Connexion depuis Conakry, Guinée',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'validation',
      title: 'Validation de données',
      description: 'Validation de 5 actes de naissance',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      type: 'update',
      title: 'Profil mis à jour',
      description: 'Modification des informations personnelles',
      timestamp: new Date(Date.now() - 7200000)
    }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.profileForm = this.createProfileForm();
    this.preferencesForm = this.createPreferencesForm();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  /**
   * Charger les informations de l'utilisateur connecté
   */
  loadCurrentUser(): void {
    // Récupérer l'ID de l'utilisateur connecté depuis AuthService
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.updateForms();
        },
        error: (error) => {
          console.error('Erreur lors du chargement du profil:', error);
          this.showSnackBar('Erreur lors du chargement du profil', 'error');
        }
      });
    }
  }

  /**
   * Créer le formulaire de profil
   */
  createProfileForm(): FormGroup {
    return this.fb.group({
      prenom: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      username: ['', [Validators.required]]
    });
  }

  /**
   * Créer le formulaire de préférences
   */
  createPreferencesForm(): FormGroup {
    return this.fb.group({
      language: ['fr'],
      timezone: ['Africa/Conakry'],
      darkMode: [false],
      emailNotifications: [true],
      browserNotifications: [true],
      soundNotifications: [false]
    });
  }

  /**
   * Mettre à jour les formulaires avec les données utilisateur
   */
  updateForms(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        prenom: this.currentUser.prenom,
        nom: this.currentUser.nom,
        email: this.currentUser.email,
        telephone: this.currentUser.telephone,
        username: this.currentUser.username
      });
    }
  }

  /**
   * Obtenir le rôle principal de l'utilisateur
   */
  getUserRole(): string {
    if (this.currentUser?.role) {
      return this.currentUser.role.nom.replace('ROLE_', '').replace('_', ' ');
    }
    return 'Utilisateur';
  }

  /**
   * Mettre à jour le profil
   */
  updateProfile(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.saving = true;

      const updatedUser: User = {
        ...this.currentUser,
        ...this.profileForm.value
      };

      this.userService.updateUser(this.currentUser.id!, updatedUser).subscribe({
        next: (user) => {
          this.currentUser = user;
          this.saving = false;
          this.showSnackBar('Profil mis à jour avec succès', 'success');

          // Ajouter une activité
          this.addActivity('update', 'Profil mis à jour', 'Modification des informations personnelles');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.saving = false;
          this.showSnackBar('Erreur lors de la mise à jour du profil', 'error');
        }
      });
    }
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.updateForms();
  }

  /**
   * Ouvrir le dialogue de changement de mot de passe
   */
  openChangePasswordDialog(): void {
    // const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
    //   width: '400px',
    //   data: { userId: this.currentUser?.id }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.lastPasswordChange = new Date();
    //     this.showSnackBar('Mot de passe modifié avec succès', 'success');
    //     this.addActivity('update', 'Mot de passe modifié', 'Changement du mot de passe');
    //   }
    // });

    console.log('Ouverture du dialogue de changement de mot de passe');
    this.showSnackBar('Fonctionnalité de changement de mot de passe à implémenter', 'info');
  }

  /**
   * Modifier le profil (mode édition)
   */
  editProfile(): void {
    this.selectedTabIndex = 0; // Aller à l'onglet des informations personnelles
  }

  /**
   * Mettre à jour les préférences
   */
  updatePreferences(): void {
    if (this.preferencesForm.valid) {
      this.savingPreferences = true;

      // Simuler la sauvegarde des préférences
      setTimeout(() => {
        this.savingPreferences = false;
        this.showSnackBar('Préférences mises à jour avec succès', 'success');
        this.addActivity('update', 'Préférences modifiées', 'Mise à jour des préférences de l\'application');
      }, 1000);
    }
  }

  /**
   * Déconnecter tous les appareils
   */
  logoutAllDevices(): void {
    if (confirm('Voulez-vous vraiment déconnecter tous les appareils ? Vous devrez vous reconnecter.')) {
      // Implémenter la déconnexion de tous les appareils
      this.activeSessions = 1;
      this.showSnackBar('Tous les appareils ont été déconnectés', 'success');
      this.addActivity('update', 'Déconnexion massive', 'Déconnexion de tous les appareils');
    }
  }

  /**
   * Charger plus d'activités
   */
  loadMoreActivities(): void {
    // Simuler le chargement de plus d'activités
    const moreActivities: Activity[] = [
      {
        id: '4',
        type: 'create',
        title: 'Création d\'utilisateur',
        description: 'Création d\'un nouvel utilisateur: John Doe',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: '5',
        type: 'login',
        title: 'Connexion',
        description: 'Connexion depuis un nouvel appareil',
        timestamp: new Date(Date.now() - 172800000)
      }
    ];

    this.recentActivities = [...this.recentActivities, ...moreActivities];
    this.showSnackBar('Plus d\'activités chargées', 'success');
  }

  /**
   * Exporter l'historique d'activité
   */
  exportActivityLog(): void {
    // Implémenter l'export de l'historique
    console.log('Export de l\'historique d\'activité');
    this.showSnackBar('Export de l\'historique en cours...', 'info');
  }

  /**
   * Obtenir l'icône pour un type d'activité
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case 'login': return 'login';
      case 'update': return 'edit';
      case 'create': return 'add';
      case 'delete': return 'delete';
      case 'validation': return 'check_circle';
      default: return 'info';
    }
  }

  /**
   * Vérifier si l'utilisateur a des rôles
   */
  hasRoles(): boolean {
    return !!(this.currentUser && this.currentUser.role);
  }

  /**
   * Obtenir les rôles de manière sécurisée
   */
  getUserRoles(): Role {
    return this.currentUser!.role;
  }

  /**
   * Obtenir le nom complet de l'utilisateur
   */
  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.prenom || ''} ${this.currentUser.nom || ''}`.trim();
  }

  /**
   * Ajouter une nouvelle activité
   */
  private addActivity(type: Activity['type'], title: string, description: string): void {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type,
      title,
      description,
      timestamp: new Date()
    };

    this.recentActivities.unshift(newActivity);

    // Garder seulement les 10 dernières activités
    if (this.recentActivities.length > 10) {
      this.recentActivities = this.recentActivities.slice(0, 10);
    }
  }

  /**
   * Afficher un message
   */
  private showSnackBar(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: `snackbar-${type}`
    });
  }
}
