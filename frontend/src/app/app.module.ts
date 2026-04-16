import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminTemplateComponent } from './admin-template/admin-template.component';

// Import des locales françaises
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// Angular Material Modules - Import complet
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialogModule } from '@angular/material/dialog';

// Modules Material supplémentaires nécessaires
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTreeModule } from '@angular/material/tree';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { TextFieldModule } from '@angular/cdk/text-field';

// Composants existants
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ValidationDialogComponent } from './shared/validation-dialog/validation-dialog.component';
import { ConfirmLeaveDialogComponent } from './shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { FooterComponent } from './shared/footer/footer.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { RegisterComponent } from './pages/register/register.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';
import { SendmailResetComponent } from './pages/sendmail-reset/sendmail-reset.component';
import { UserListComponent } from './config/user-list/user-list.component';
import { UserProfileComponent } from './config/user-profile/user-profile.component';

// Autres modules
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { BaseChartDirective } from 'ng2-charts';
import { RolesListComponent } from './config/roles-list/roles-list.component';
import { PermissionsListComponent } from './config/permissions-list/permissions-list.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UserCreateComponent } from './config/user-create/user-create.component';
import { LocalitesListComponent } from './config/localites-list/localites-list.component';
import { AboutComponent } from './config/about/about.component';
import { NotificationsComponent } from './config/notifications/notifications.component';
import { PrivacyPolicyComponent } from './config/about/privacy-policy/privacy-policy.component';
import { PermissionDialogComponent } from './config/permissions-list/permission-dialog/permission-dialog.component';
import { RoleFormDialogComponent } from './config/roles-list/role-form-dialog/role-form-dialog.component';
import { UserFormDialogComponent } from './config/user-form-dialog/user-form-dialog.component';
import { ResetPasswordDialogComponent } from './config/reset-password-dialog/reset-password-dialog.component';
import { ConfirmActionDialogComponent } from './config/confirm-action-dialog/confirm-action-dialog.component';
import { ToastComponent } from './shared/toast/toast.component';
import { NumerisationIndexationComponent } from './numerisation-indexation/numerisation-indexation.component';
import { SumPermissionsPipe } from './pipes/sum-permissions.pipe';
import { LocalitesComponent } from './config/localites/localites.component';
import { HierarchyNodeComponent } from './config/localites/hierarchy-node.component';
import { ForcePasswordChangeComponent } from './pages/force-password-change/force-password-change.component';
import { ValidBirthListComponent } from './valid-births/valid-birth-list/valid-birth-list.component';
import { RejectDialogComponent } from './valid-births/reject-dialog/reject-dialog.component';

// Actes de naissance
import { BirthActCreationComponent } from './actes-naissance/creation/birth-act-creation.component';
import { BirthActTranscriptionComponent } from './actes-naissance/transcription/birth-act-transcription.component';
import { BirthActConsultationComponent } from './actes-naissance/consultation/birth-act-consultation.component';
import { ActesReprisDetailComponent } from './actes-naissance/actes-repris/actes-repris-detail.component';

// Actes de décès
import { DeathActCreationComponent } from './actes-deces/creation/death-act-creation.component';
import { DeathActTranscriptionComponent } from './actes-deces/transcription/death-act-transcription.component';
import { DeathActConsultationComponent } from './actes-deces/consultation/death-act-consultation.component';
import { DeathActesReprisComponent } from './actes-deces/actes-repris/death-actes-repris.component';

// Rapports
import { RapportsComponent } from './rapports/rapports.component';

// Actes (page unifiée)
import { ActesHomeComponent } from './actes/actes-home.component';
import { ActeSelectionDialogComponent } from './actes/acte-selection-dialog/acte-selection-dialog.component';

// Paramétrage
import { ParametrageHomeComponent } from './parametrage/parametrage-home/parametrage-home.component';
import { CentresEtatCivilComponent } from './parametrage/centres-etat-civil/centres-etat-civil.component';
import { TypesActesComponent } from './parametrage/types-actes/types-actes.component';
import { RegistresComponent } from './parametrage/registres/registres.component';
import { OfficiersEtatCivilComponent } from './parametrage/officiers-etat-civil/officiers-etat-civil.component';


registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppComponent,
    AdminTemplateComponent,
    HomeComponent,
    DashboardComponent,
    LoginComponent,
    ValidationDialogComponent,
    ConfirmLeaveDialogComponent,
    FooterComponent,
    LoaderComponent,
    RegisterComponent,
    UpdatePasswordComponent,
    SendmailResetComponent,
    UserListComponent,
    UserProfileComponent,
    RolesListComponent,
    PermissionsListComponent,
    RoleFormDialogComponent,
    UserFormDialogComponent,
    ResetPasswordDialogComponent,
    ConfirmActionDialogComponent,
    UserCreateComponent,
    LocalitesListComponent,
    LocalitesComponent,
    HierarchyNodeComponent,
    AboutComponent,
    NotificationsComponent,
    PrivacyPolicyComponent,
    PermissionDialogComponent,
    ToastComponent,
    NumerisationIndexationComponent,
    SumPermissionsPipe,
    ForcePasswordChangeComponent,
    ValidBirthListComponent,
    RejectDialogComponent,
    // Actes de naissance
    BirthActCreationComponent,
    BirthActTranscriptionComponent,
    BirthActConsultationComponent,
    ActesReprisDetailComponent,
    // Actes de décès
    DeathActCreationComponent,
    DeathActTranscriptionComponent,
    DeathActConsultationComponent,
    DeathActesReprisComponent,
    // Rapports
    RapportsComponent,
    // Actes unifiés
    ActesHomeComponent,
    ActeSelectionDialogComponent,
    // Paramétrage
    ParametrageHomeComponent,
    CentresEtatCivilComponent,
    TypesActesComponent,
    RegistresComponent,
    OfficiersEtatCivilComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatExpansionModule,
    MatDialogModule,
    MatChipsModule,

    // Forms
    ReactiveFormsModule,
    FormsModule,

    // HTTP
    HttpClientModule,

    // Charts
    BaseChartDirective,

    // Angular Material Modules - Organisés par catégorie

    // Layout
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatTabsModule,

    // Buttons & Indicators
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatChipsModule,

    // Navigation
    MatMenuModule,
    MatStepperModule,
    MatTreeModule,

    // Form Controls
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,

    // Data table
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,

    // Popups & Modals
    MatDialogModule,
    MatSnackBarModule,
    MatBottomSheetModule,
    MatTooltipModule,

    MatAutocompleteModule,
    TextFieldModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
