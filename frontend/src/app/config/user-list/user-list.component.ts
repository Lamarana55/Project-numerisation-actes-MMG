// users-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil, debounceTime } from 'rxjs';
import { FormControl } from '@angular/forms';

import { User } from '../../models/user';
import { Role } from '../../models/role';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit, OnDestroy {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  availableRoles: Role[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchTerm = '';
  selectedStatus = '';
  selectedRole = '';
  searchControl = new FormControl();

  // Pagination
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalItems = 0;

  // Sélection
  selection = new SelectionModel<User>(true, []);

  // Configuration du tableau
  displayedColumns: string[] = ['select', 'profile', 'userInfo', 'role', 'statut', 'actions'];

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configuration de la recherche avec debounce
   */
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchTerm = value || '';
        this.applyFilters();
      });
  }

  /**
   * Charge tous les utilisateurs
   */
  loadUsers(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.users = users;
          console.log("Users: ", users)
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          this.error = 'Impossible de charger les utilisateurs';
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors du chargement des utilisateurs');
        }
      });
  }

  /**
   * Charge tous les rôles
   */
  loadRoles(): void {
    this.roleService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (role) => {
          this.availableRoles = role;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des rôles:', error);
        }
      });
  }

  /**
   * Applique les filtres de recherche
   */
  applyFilters(): void {
    let filtered = [...this.users];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nom?.toLowerCase().includes(term) ||
        user.prenom?.toLowerCase().includes(term) ||
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.telephone?.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (this.selectedStatus) {
      filtered = filtered.filter(user => user.statut === this.selectedStatus);
    }

    // Filtre par rôle - MODIFIÉ pour un rôle unique
    if (this.selectedRole) {
      filtered = filtered.filter(user =>
        user.role?.nom === this.selectedRole
      );
    }

    this.filteredUsers = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 0;
    this.updatePaginatedData();
    this.selection.clear();
    this.cdr.markForCheck();
  }

  /**
   * Met à jour les données paginées
   */
  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
    this.cdr.markForCheck();
  }

  /**
   * Gère le changement de page
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  /**
   * Efface les filtres
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedRole = '';
    this.searchControl.setValue('');
    this.applyFilters();
  }

  /**
   * Recharge les données
   */
  refreshData(): void {
    this.loadUsers();
  }

  /**
   * Ouvre le dialog d'ajout
   */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        mode: 'create',
        user: null,
        availableRoles: this.availableRoles
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createUser(result);
      }
    });
  }

  /**
   * Crée un nouvel utilisateur
   */
  private createUser(userData: any): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.createUser(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Utilisateur créé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la création de l\'utilisateur');
        }
      });
  }

  /**
   * Ouvre le dialog de modification
   */
  openEditDialog(user: User): void {
    // const dialogRef = this.dialog.open(UserFormDialogComponent, {
    //   width: '800px',
    //   maxWidth: '90vw',
    //   data: {
    //     mode: 'edit',
    //     user: { ...user },
    //     availableRoles: this.availableRoles
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.updateUser(user.id!, result);
    //   }
    // });
    console.log('Modifier utilisateur:', user);
    this.showNotification(`Modification de ${user.prenom} ${user.nom} - Fonctionnalité en cours`);
  }

  /**
   * Gestion de la sélection
   */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.paginatedUsers.length;
    return numSelected === numRows && numRows > 0;
  }

  isIndeterminate(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.paginatedUsers.length;
    return numSelected > 0 && numSelected < numRows;
  }

  masterToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.paginatedUsers.forEach(user => this.selection.select(user));
    }
  }

  /**
   * Basculer le statut d'un utilisateur
   */
  toggleUserStatus(user: User): void {
    const action = user.statut === 'Activated' ? 'désactiver' : 'activer';
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur "${user.prenom} ${user.nom}" ?`);

    if (confirmed) {
      this.performStatusToggle(user);
    }
  }

  private performStatusToggle(user: User): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.toggleUserStatus(user.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.applyFilters();
          }
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification(`Utilisateur ${updatedUser.statut === 'Activated' ? 'activé' : 'désactivé'} avec succès`);
        },
        error: (error) => {
          console.error('Erreur lors du changement de statut:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors du changement de statut');
        }
      });
  }

  /**
   * Supprimer un utilisateur
   */
  deleteUser(user: User): void {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.prenom} ${user.nom}" ? Cette action est irréversible.`);

    if (confirmed) {
      this.performDelete(user);
    }
  }

  private performDelete(user: User): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.deleteUser(user.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.applyFilters();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Utilisateur supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la suppression');
        }
      });
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(user: User): void {
    const confirmed = window.confirm(`Voulez-vous vraiment réinitialiser le mot de passe de ${user.prenom} ${user.nom} ?`);

    if (confirmed) {
      this.performPasswordReset(user);
    }
  }

  private performPasswordReset(user: User): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.userService.resetUserPassword(user.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Mot de passe réinitialisé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la réinitialisation:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la réinitialisation du mot de passe');
        }
      });
  }

  /**
   * Actions en lot
   */
  bulkActivate(): void {
    const userIds = this.selection.selected.map(user => user.id!);
    console.log('Activer en lot:', userIds);

    // Simulation de l'activation en lot
    this.selection.selected.forEach(user => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index].statut = 'Activated';
      }
    });

    this.applyFilters();
    this.showNotification(`${userIds.length} utilisateur(s) activé(s)`);
    this.selection.clear();
  }

  bulkDeactivate(): void {
    const userIds = this.selection.selected.map(user => user.id!);
    console.log('Désactiver en lot:', userIds);

    // Simulation de la désactivation en lot
    this.selection.selected.forEach(user => {
      const index = this.users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        this.users[index].statut = 'Desactivated';
      }
    });

    this.applyFilters();
    this.showNotification(`${userIds.length} utilisateur(s) désactivé(s)`);
    this.selection.clear();
  }

  bulkDelete(): void {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer ${this.selection.selected.length} utilisateur(s) ?`);
    if (confirmed) {
      const userIds = this.selection.selected.map(user => user.id!);
      console.log('Supprimer en lot:', userIds);

      // Simulation de la suppression en lot
      this.users = this.users.filter(user => !userIds.includes(user.id!));
      this.applyFilters();
      this.showNotification(`${userIds.length} utilisateur(s) supprimé(s)`);
      this.selection.clear();
    }
  }

  /**
   * Obtient l'initiale du nom pour l'avatar
   */
  getUserInitials(user: User): string {
    const firstInitial = user.prenom?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.nom?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }

  /**
   * Obtient la classe CSS pour le statut
   */
  getStatusClass(statut: string): string {
    switch (statut) {
      case 'Activated': return 'status-activated';
      case 'Desactivated': return 'status-deactivated';
      default: return 'status-unknown';
    }
  }

  /**
   * Obtient l'icône pour le statut
   */
  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'Activated': return 'check_circle';
      case 'Desactivated': return 'cancel';
      default: return 'help';
    }
  }

  /**
   * Obtient le texte du statut
   */
  getStatusText(statut: string): string {
    switch (statut) {
      case 'Activated': return 'Actif';
      case 'Desactivated': return 'Inactif';
      default: return 'Inconnu';
    }
  }

  /**
   * Obtient l'affichage du rôle - MODIFIÉ pour un rôle unique
   */
  getRolesDisplay(user: User): string {
    console.log("User : ", user.username, " role :", user.role);
    if (!user.role) {
      return 'Aucun rôle';
    }
    return user.role.nom || 'Rôle non défini';
  }

  /**
   * Obtient le rôle de l'utilisateur - NOUVEAU pour remplacer getFirstRoles
   */
  getUserRole(user: User): string {
    if (!user.role) {
      return 'Aucun rôle';
    }
    return user.role.nom || 'Rôle non défini';
  }

  /**
   * Obtient la couleur du badge de rôle - NOUVEAU
   */
  getRoleBadgeColor(user: User): string {
    if (!user.role) {
      return 'default';
    }

    // Définir des couleurs basées sur le nom du rôle
    const roleName = user.role.nom?.toLowerCase();
    switch (roleName) {
      case 'admin':
      case 'administrateur':
        return 'warn'; // Rouge
      case 'manager':
      case 'responsable':
        return 'accent'; // Couleur accent
      case 'user':
      case 'utilisateur':
        return 'primary'; // Bleu
      default:
        return 'default'; // Gris
    }
  }

  get activeUsersCount(): number {
    return this.users.filter(u => u.statut === 'Activated').length;
  }

  get inactiveUsersCount(): number {
    return this.users.filter(u => u.statut === 'Desactivated').length;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique - NOUVEAU
   */
  hasRole(user: User, roleName: string): boolean {
    return user.role?.nom?.toLowerCase() === roleName.toLowerCase();
  }

  /**
   * Obtient la description du rôle - NOUVEAU
   */
  getRoleDescription(user: User): string {
    if (!user.role) {
      return 'Aucune description';
    }
    return user.role.description || 'Pas de description disponible';
  }

  /**
   * Affiche une notification simple
   */
  private showNotification(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  /**
   * Track by function pour les performances
   */
  trackByUserId(index: number, user: User): string {
    return user.id || index.toString();
  }
}
