// users-list.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormControl } from '@angular/forms';

import { User, NiveauAdministratif } from '../../models/user';
import { Role, PROFIL_META, NIVEAU_LABELS } from '../../models/role';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password-dialog/reset-password-dialog.component';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {

  private readonly userService = inject(UserService);
  private readonly roleService  = inject(RoleService);
  private readonly toast        = inject(ToastService);
  private readonly dialog       = inject(MatDialog);
  private readonly cdr          = inject(ChangeDetectorRef);
  private readonly destroy$     = new Subject<void>();

  users: User[]          = [];
  filteredUsers: User[]  = [];
  paginatedUsers: User[] = [];
  availableRoles: Role[] = [];
  loading = false;
  error: string | null = null;

  // Filtres de base
  searchTerm     = '';
  selectedStatus = '';
  selectedRole   = '';
  selectedNiveau = '';
  searchControl  = new FormControl();

  // Filtres territoriaux (cascade : région → préfecture → commune)
  selectedRegionId   = '';
  selectedPrefId     = '';
  selectedCommuneId  = '';

  // Options dynamiques dérivées des utilisateurs chargés (sans appel API)
  regionOptions:  { id: string; nom: string }[] = [];
  prefOptions:    { id: string; nom: string }[] = [];
  communeOptions: { id: string; nom: string }[] = [];

  readonly PROFIL_META   = PROFIL_META;
  readonly NIVEAU_LABELS = NIVEAU_LABELS;

  readonly niveaux: { value: NiveauAdministratif; label: string }[] = [
    { value: 'CENTRAL',     label: 'National (PN-RAVEC)' },
    { value: 'REGIONAL',    label: 'Régional' },
    { value: 'PREFECTORAL', label: 'Préfectoral' },
    { value: 'COMMUNAL',    label: 'Communal' },
  ];

  // Pagination
  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage     = 0;
  totalItems      = 0;

  // Sélection
  selection = new SelectionModel<User>(true, []);

  displayedColumns: string[] = ['select', 'profile', 'userInfo', 'role', 'territoire', 'statut', 'actions'];

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Chargement ───────────────────────────────────────────────
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(value => {
        this.searchTerm = value || '';
        this.applyFilters();
      });
  }

  loadUsers(): void {
    this.loading = true;
    this.error   = null;
    this.cdr.markForCheck();

    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users   = users;
          this.loading = false;
          this.applyFilters();
        },
        error: () => {
          this.error   = 'Impossible de charger les utilisateurs';
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors du chargement des utilisateurs', 'error');
        }
      });
  }

  loadRoles(): void {
    this.roleService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => { this.availableRoles = roles; this.cdr.markForCheck(); },
        error: () => {}
      });
  }

  // ── Getters : visibilité des filtres territoriaux ────────────
  get showRegionFilter(): boolean {
    return ['REGIONAL', 'PREFECTORAL', 'COMMUNAL'].includes(this.selectedNiveau);
  }

  get showPrefFilter(): boolean {
    return ['PREFECTORAL', 'COMMUNAL'].includes(this.selectedNiveau);
  }

  get showCommuneFilter(): boolean {
    return this.selectedNiveau === 'COMMUNAL';
  }

  // ── Handlers de changement des filtres territoriaux ──────────

  /** Appelé quand le niveau change : reconstruit les options région. */
  onNiveauChange(): void {
    this.selectedRegionId  = '';
    this.selectedPrefId    = '';
    this.selectedCommuneId = '';
    this.prefOptions       = [];
    this.communeOptions    = [];
    this.regionOptions     = this.buildRegionOptions();
    this.applyFilters();
  }

  /** Appelé quand la région change : reconstruit les options préfecture. */
  onRegionChange(): void {
    this.selectedPrefId    = '';
    this.selectedCommuneId = '';
    this.communeOptions    = [];
    this.prefOptions       = this.buildPrefOptions();
    this.applyFilters();
  }

  /** Appelé quand la préfecture change : reconstruit les options commune. */
  onPrefChange(): void {
    this.selectedCommuneId = '';
    this.communeOptions    = this.buildCommuneOptions();
    this.applyFilters();
  }

  // ── Filtres & pagination ─────────────────────────────────────
  applyFilters(): void {
    let filtered = [...this.users];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.nom?.toLowerCase().includes(term)      ||
        u.prenom?.toLowerCase().includes(term)   ||
        u.username?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)    ||
        u.telephone?.toLowerCase().includes(term)
      );
    }
    if (this.selectedStatus) {
      filtered = filtered.filter(u => u.statut === this.selectedStatus);
    }
    if (this.selectedRole) {
      filtered = filtered.filter(u =>
        (u.roleName ?? u.role?.nom) === this.selectedRole
      );
    }
    if (this.selectedNiveau) {
      filtered = filtered.filter(u => u.niveauAdministratif === this.selectedNiveau);
    }
    // Filtres territoriaux cascade
    if (this.selectedRegionId) {
      filtered = filtered.filter(u => u.regionId === this.selectedRegionId);
    }
    if (this.selectedPrefId) {
      filtered = filtered.filter(u => u.prefectureId === this.selectedPrefId);
    }
    if (this.selectedCommuneId) {
      filtered = filtered.filter(u => u.communeId === this.selectedCommuneId);
    }

    this.filteredUsers = filtered;
    this.totalItems    = filtered.length;
    this.currentPage   = 0;
    this.selection.clear();
    this.updatePaginatedData();
  }

  // ── Construction des options territoriales ───────────────────

  /** Régions distinctes parmi les utilisateurs du niveau sélectionné. */
  private buildRegionOptions(): { id: string; nom: string }[] {
    const base = this.selectedNiveau
      ? this.users.filter(u => u.niveauAdministratif === this.selectedNiveau)
      : this.users;
    const seen = new Map<string, string>();
    for (const u of base) {
      if (u.regionId && u.regionNom && !seen.has(u.regionId)) {
        seen.set(u.regionId, u.regionNom);
      }
    }
    return Array.from(seen, ([id, nom]) => ({ id, nom }))
                .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }

  /** Préfectures distinctes filtrées par niveau + région sélectionnée. */
  private buildPrefOptions(): { id: string; nom: string }[] {
    let base = this.selectedNiveau
      ? this.users.filter(u => u.niveauAdministratif === this.selectedNiveau)
      : this.users;
    if (this.selectedRegionId) {
      base = base.filter(u => u.regionId === this.selectedRegionId);
    }
    const seen = new Map<string, string>();
    for (const u of base) {
      if (u.prefectureId && u.prefectureNom && !seen.has(u.prefectureId)) {
        seen.set(u.prefectureId, u.prefectureNom);
      }
    }
    return Array.from(seen, ([id, nom]) => ({ id, nom }))
                .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }

  /** Communes distinctes filtrées par niveau + région + préfecture sélectionnées. */
  private buildCommuneOptions(): { id: string; nom: string }[] {
    let base = this.selectedNiveau
      ? this.users.filter(u => u.niveauAdministratif === this.selectedNiveau)
      : this.users;
    if (this.selectedRegionId) base = base.filter(u => u.regionId    === this.selectedRegionId);
    if (this.selectedPrefId)   base = base.filter(u => u.prefectureId === this.selectedPrefId);
    const seen = new Map<string, string>();
    for (const u of base) {
      if (u.communeId && u.communeNom && !seen.has(u.communeId)) {
        seen.set(u.communeId, u.communeNom);
      }
    }
    return Array.from(seen, ([id, nom]) => ({ id, nom }))
                .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }

  private updatePaginatedData(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize    = event.pageSize;
    this.updatePaginatedData();
  }

  clearFilters(): void {
    this.searchTerm        = '';
    this.selectedStatus    = '';
    this.selectedRole      = '';
    this.selectedNiveau    = '';
    this.selectedRegionId  = '';
    this.selectedPrefId    = '';
    this.selectedCommuneId = '';
    this.regionOptions     = [];
    this.prefOptions       = [];
    this.communeOptions    = [];
    this.searchControl.setValue('', { emitEvent: false });
    this.applyFilters();
  }

  refreshData(): void { this.loadUsers(); }

  // ── CRUD ─────────────────────────────────────────────────────
  openAddDialog(): void {
    const ref = this.dialog.open(UserFormDialogComponent, {
      width: '760px', maxWidth: '95vw',
      data: { mode: 'create', user: null, availableRoles: this.availableRoles }
    });
    ref.afterClosed().subscribe(result => { if (result) this.saveUser(result); });
  }

  openEditDialog(user: User): void {
    const ref = this.dialog.open(UserFormDialogComponent, {
      width: '760px', maxWidth: '95vw',
      data: { mode: 'edit', user: { ...user }, availableRoles: this.availableRoles }
    });
    ref.afterClosed().subscribe(result => { if (result) this.updateUser(user.id!, result); });
  }

  private saveUser(userData: any): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newUser) => {
          this.users = [newUser, ...this.users];
          this.loading = false;
          this.applyFilters();
          this.notify('Utilisateur créé avec succès', 'success');
        },
        error: (err) => {
          this.loading = false;
          this.cdr.markForCheck();
          const msg = err.status === 409
            ? 'Ce nom d\'utilisateur ou email existe déjà'
            : 'Erreur lors de la création de l\'utilisateur';
          this.notify(msg, 'error');
        }
      });
  }

  private updateUser(id: string, userData: any): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.updateUser(id, userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.users.findIndex(u => u.id === id);
          if (idx !== -1) this.users[idx] = updated;
          this.loading = false;
          this.applyFilters();
          this.notify('Utilisateur modifié avec succès', 'success');
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors de la modification', 'error');
        }
      });
  }

  // ── Statut ───────────────────────────────────────────────────
  toggleUserStatus(user: User): void {
    const type = user.statut === 'Activated' ? 'deactivate' : 'activate';
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      width: '440px', maxWidth: '95vw',
      data: { type, userName: `${user.prenom} ${user.nom}` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.cdr.markForCheck();
      this.userService.toggleUserStatus(user.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            const idx = this.users.findIndex(u => u.id === user.id);
            if (idx !== -1) this.users[idx] = updated;
            this.loading = false;
            this.applyFilters();
            this.notify(`Utilisateur ${updated.statut === 'Activated' ? 'activé' : 'désactivé'} avec succès`, 'success');
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
            this.notify('Erreur lors du changement de statut', 'error');
          }
        });
    });
  }

  // ── Mot de passe ─────────────────────────────────────────────
  resetPassword(user: User): void {
    const ref = this.dialog.open(ResetPasswordDialogComponent, {
      width: '480px',
      maxWidth: '95vw',
      disableClose: true,
      data: { userName: `${user.prenom} ${user.nom}` }
    });

    // Le dialog reste ouvert — on s'abonne à l'événement de confirmation
    ref.componentInstance.confirmed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.userService.resetUserPassword(user.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res) => {
              ref.componentInstance.showSuccess(res.defaultPassword);
            },
            error: () => {
              ref.componentInstance.showError();
              this.notify('Erreur lors de la réinitialisation du mot de passe', 'error');
            }
          });
      });
  }

  // ── Suppression ──────────────────────────────────────────────
  deleteUser(user: User): void {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      width: '440px', maxWidth: '95vw',
      data: { type: 'delete', userName: `${user.prenom} ${user.nom}` }
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.cdr.markForCheck();
      this.userService.deleteUser(user.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.users   = this.users.filter(u => u.id !== user.id);
            this.loading = false;
            this.applyFilters();
            this.notify('Utilisateur supprimé avec succès', 'success');
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
            this.notify('Erreur lors de la suppression', 'error');
          }
        });
    });
  }

  // ── Sélection multiple ───────────────────────────────────────
  isAllSelected(): boolean {
    return this.selection.selected.length === this.paginatedUsers.length && this.paginatedUsers.length > 0;
  }

  isIndeterminate(): boolean {
    const n = this.selection.selected.length;
    return n > 0 && n < this.paginatedUsers.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.paginatedUsers.forEach(u => this.selection.select(u));
  }

  // ── Helpers affichage ────────────────────────────────────────
  getUserInitials(user: User): string {
    return (user.prenom?.charAt(0) || '').toUpperCase() +
           (user.nom?.charAt(0) || '').toUpperCase();
  }

  getAvatarColor(user: User): string {
    const colors = [
      '#00853F', '#1565c0', '#6a1b9a', '#e53935', '#f57c00',
      '#0097a7', '#558b2f', '#ad1457'
    ];
    let hash = 0;
    const str = (user.id || user.username || '');
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  getStatusClass(statut: string): string {
    return statut === 'Activated' ? 'status-active' : 'status-inactive';
  }

  getStatusText(statut: string): string {
    return statut === 'Activated' ? 'Actif' : 'Inactif';
  }

  getRoleDisplay(user: User): string {
    const nom = user.roleName ?? user.role?.nom ?? '';
    return PROFIL_META[nom]?.libelle || user.roleLibelle || nom || 'Aucun profil';
  }

  getProfilMeta(user: User) {
    const nom = user.roleName ?? user.role?.nom ?? '';
    return PROFIL_META[nom] ?? null;
  }

  getNiveauLabel(user: User): string {
    return user.niveauAdministratif ? NIVEAU_LABELS[user.niveauAdministratif] : '';
  }

  getTerritoireLabel(user: User): string {
    if (user.communeNom)    return user.communeNom;
    if (user.prefectureNom) return user.prefectureNom;
    if (user.regionNom)     return user.regionNom;
    return '';
  }

  /** Retourne le nom d'une option territoriale par son id. */
  getNomById(options: { id: string; nom: string }[], id: string): string {
    return options.find(o => o.id === id)?.nom ?? '';
  }

  /** Efface uniquement les filtres territoriaux sans toucher aux autres. */
  clearTerritoryFilters(): void {
    this.selectedRegionId  = '';
    this.selectedPrefId    = '';
    this.selectedCommuneId = '';
    this.prefOptions       = [];
    this.communeOptions    = [];
    this.applyFilters();
  }

  isAdminUser(user: User): boolean {
    const role = (user.roleName ?? user.role?.nom ?? '').toUpperCase();
    return role.includes('SUPER_ADMIN');
  }

  get activeUsersCount(): number   { return this.users.filter(u => u.statut === 'Activated').length; }
  get inactiveUsersCount(): number { return this.users.filter(u => u.statut === 'Desactivated').length; }
  get hasActiveFilters(): boolean  {
    return !!(this.searchTerm || this.selectedStatus || this.selectedRole ||
              this.selectedNiveau || this.selectedRegionId || this.selectedPrefId ||
              this.selectedCommuneId);
  }

  private notify(message: string, type: 'success' | 'error'): void {
    this.toast[type](message);
  }

  trackByUserId(index: number, user: User): string {
    return user.id || index.toString();
  }
}
