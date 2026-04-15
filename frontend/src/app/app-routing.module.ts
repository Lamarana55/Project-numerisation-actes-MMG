import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Composants principaux
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminTemplateComponent } from './admin-template/admin-template.component';
import { SendmailResetComponent } from './pages/sendmail-reset/sendmail-reset.component';
import { RegisterComponent } from './pages/register/register.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';

// Composants de gestion des utilisateurs
import { UserListComponent } from './config/user-list/user-list.component';
import { UserProfileComponent } from './config/user-profile/user-profile.component';

// Composant de gestion des localités
import { LocalitesComponent } from './config/localites/localites.component';

// Guards
import { AuthorizationGuard } from './gards/authorization.guard';
import { AuthGuard } from './gards/auth.guard';
import { UserCreateComponent } from './config/user-create/user-create.component';
import { RolesListComponent } from './config/roles-list/roles-list.component';
import { PermissionsListComponent } from './config/permissions-list/permissions-list.component';
import { AboutComponent } from './config/about/about.component';
import { NotificationsComponent } from './config/notifications/notifications.component';
import { PrivacyPolicyComponent } from './config/about/privacy-policy/privacy-policy.component';
import { NumerisationIndexationComponent } from './numerisation-indexation/numerisation-indexation.component';
import { ForcePasswordChangeComponent } from './pages/force-password-change/force-password-change.component';

// Actes de naissance
import { BirthActCreationComponent } from './actes-naissance/creation/birth-act-creation.component';
import { BirthActTranscriptionComponent } from './actes-naissance/transcription/birth-act-transcription.component';
import { BirthActConsultationComponent } from './actes-naissance/consultation/birth-act-consultation.component';
import { ValidBirthListComponent } from './valid-births/valid-birth-list/valid-birth-list.component';
import { ActesReprisDetailComponent } from './actes-naissance/actes-repris/actes-repris-detail.component';

// Actes de décès
import { DeathActCreationComponent } from './actes-deces/creation/death-act-creation.component';
import { DeathActTranscriptionComponent } from './actes-deces/transcription/death-act-transcription.component';
import { DeathActConsultationComponent } from './actes-deces/consultation/death-act-consultation.component';
import { DeathActesReprisComponent } from './actes-deces/actes-repris/death-actes-repris.component';

// Rapports
import { RapportsComponent } from './rapports/rapports.component';

const routes: Routes = [
  // Routes publiques
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: SendmailResetComponent },
  { path: 'update-password/:token', component: UpdatePasswordComponent },

  // Changement de mot de passe obligatoire (utilisateur authentifié)
  { path: 'change-password', component: ForcePasswordChangeComponent, canActivate: [AuthGuard] },

  // Routes protégées de l'administration
  {
    path: 'admin',
    component: AdminTemplateComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard principal
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },

      // Numérisation et Indexation
      {
        path: 'numerisation',
        component: NumerisationIndexationComponent,
        data: { title: 'Numérisation', tab: 'numerisation' },
      },
      {
        path: 'numerisation-indexation',
        component: NumerisationIndexationComponent,
        data: { title: 'Numérisation & Indexation OCR', tab: 'indexation' },
      },

      // === ACTES DE NAISSANCE ===
      {
        path: 'actes-naissance/creation',
        component: BirthActCreationComponent,
      },
      {
        path: 'actes-naissance/transcription',
        component: BirthActTranscriptionComponent,
      },
      {
        path: 'actes-naissance/repris',
        component: ValidBirthListComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_VIEW_VALIDATED_ACTS'] },
      },
      {
        path: 'actes-naissance/repris/:id',
        component: ActesReprisDetailComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_VIEW_VALIDATED_ACTS'] },
      },
      {
        path: 'actes-naissance/consultation',
        component: BirthActConsultationComponent,
      },

      // === ACTES DE DÉCÈS ===
      {
        path: 'actes-deces/creation',
        component: DeathActCreationComponent,
      },
      {
        path: 'actes-deces/transcription',
        component: DeathActTranscriptionComponent,
      },
      {
        path: 'actes-deces/repris',
        component: DeathActesReprisComponent,
      },
      {
        path: 'actes-deces/consultation',
        component: DeathActConsultationComponent,
      },

      // === RAPPORTS & STATISTIQUES ===
      {
        path: 'rapports',
        component: RapportsComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_VIEW_REPORTS'] },
      },

      // === GESTION DES UTILISATEURS ===
      {
        path: 'users/list',
        component: UserListComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_USERS'] },
      },
      {
        path: 'users/create',
        component: UserCreateComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_USERS'] },
      },
      {
        path: 'users/:id',
        component: UserProfileComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_USERS'] },
      },

      // === GESTION DES RÔLES ET PERMISSIONS ===
      {
        path: 'roles/list',
        component: RolesListComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_ROLES'] },
      },
      {
        path: 'permissions/list',
        component: PermissionsListComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_PERMISSIONS'] },
      },

      // === GESTION DES LOCALITÉS ===
      {
        path: 'localites/list',
        component: LocalitesComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_LOCALITES'] },
      },

      // === CONFIGURATION SYSTÈME ===
      {
        path: 'settings/system',
        component: UserProfileComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_SETTINGS'] },
      },
      {
        path: 'settings/account',
        component: UserProfileComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_VIEW_PROFILE'] },
      },

      // === PROFIL UTILISATEUR ===
      { path: 'profile', component: UserProfileComponent },

      // === AIDE ET SUPPORT ===
      {
        path: 'help',
        children: [
          { path: 'about', component: AboutComponent },
          { path: 'privacy', component: PrivacyPolicyComponent },
          { path: 'conditions', component: PrivacyPolicyComponent },
          { path: 'probleme', component: PrivacyPolicyComponent },
        ],
      },

      // === NOTIFICATIONS ===
      { path: 'notifications', component: NotificationsComponent },

      // Redirect ancien lien valid-births vers nouveau chemin
      { path: 'valid-births', redirectTo: 'actes-naissance/repris', pathMatch: 'full' },
    ],
  },

  // Route de fallback
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
