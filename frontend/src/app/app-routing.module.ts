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

// Guards // ← Nouveau chemin corrigé
import { AuthorizationGuard } from './gards/authorization.guard'; // ← Votre guard existant
import { AuthGuard } from './gards/auth.guard';
import { UserCreateComponent } from './config/user-create/user-create.component';
import { RolesListComponent } from './config/roles-list/roles-list.component';
import { PermissionsListComponent } from './config/permissions-list/permissions-list.component';
import { AboutComponent } from './config/about/about.component';
import { NotificationsComponent } from './config/notifications/notifications.component';
import { PrivacyPolicyComponent } from './config/about/privacy-policy/privacy-policy.component';
import { NumerisationIndexationComponent } from './numerisation-indexation/numerisation-indexation.component';

const routes: Routes = [
  // Routes publiques
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: SendmailResetComponent },
  { path: 'update-password/:token', component: UpdatePasswordComponent },

  // Routes protégées de l'administration
  {
    path: 'admin',
    component: AdminTemplateComponent,
    canActivate: [AuthGuard], // Protection globale
    children: [
      // Dashboard principal
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
      },
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
        component: UserListComponent,
        canActivate: [AuthorizationGuard],
        data: { roles: ['CAN_MANAGE_LOCALITES'] },
      },

      // === RAPPORTS ===

      // === CONFIGURATION SYSTÈME ===
      {
        path: 'settings/system',
        component: UserProfileComponent, // Remplacer par SystemSettingsComponent quand créé
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
      {
        path: 'profile',
        component: UserProfileComponent,
      },

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
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
    ],
  },

  // Route de fallback
  { path: '**', redirectTo: '/login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false, // Mettre à true pour déboguer le routing
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
