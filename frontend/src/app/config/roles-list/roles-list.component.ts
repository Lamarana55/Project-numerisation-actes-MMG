// roles-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';

import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { RoleFormDialogComponent } from './role-form-dialog/role-form-dialog.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesListComponent implements OnInit, OnDestroy {
  private readonly roleService = inject(RoleService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  roles: Role[] = [];
  filteredRoles: Role[] = [];
  paginatedRoles: Role[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  // Pagination
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalItems = 0;

  // Configuration du tableau
  displayedColumns: string[] = ['nom', 'description', 'permissions', 'actions'];

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge tous les rôles
   */
  loadRoles(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.roleService.getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (roles) => {
          this.roles = roles;
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des rôles:', error);
          this.error = 'Impossible de charger les rôles';
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors du chargement des rôles');
        }
      });
  }

  /**
   * Applique le filtre de recherche
   */
  applyFilter(): void {
    let filtered = [...this.roles];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(role =>
        role.nom.toLowerCase().includes(term) ||
        (role.description && role.description.toLowerCase().includes(term))
      );
    }

    this.filteredRoles = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 0;
    this.updatePaginatedData();
    this.cdr.markForCheck();
  }

  /**
   * Met à jour les données paginées
   */
  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRoles = this.filteredRoles.slice(startIndex, endIndex);
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
   * Ouvre le dialog d'ajout
   */
  openAddDialog(): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        mode: 'create',
        role: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createRole(result);
      }
    });
  }

  /**
   * Ouvre le dialog de modification
   */
  openEditDialog(role: Role): void {
    const dialogRef = this.dialog.open(RoleFormDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        mode: 'edit',
        role: { ...role }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateRole(role.id!, result);
      }
    });
  }

  /**
   * Crée un nouveau rôle
   */
  createRole(roleData: any): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.roleService.createRole(roleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (role) => {
          this.roles.push(role);
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Rôle créé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la création du rôle');
        }
      });
  }

  /**
   * Met à jour un rôle existant
   */
  updateRole(id: string, roleData: any): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.roleService.updateRole(id, roleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedRole) => {
          const index = this.roles.findIndex(r => r.id === id);
          if (index !== -1) {
            this.roles[index] = updatedRole;
            this.applyFilter();
          }
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Rôle modifié avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la modification du rôle');
        }
      });
  }

  /**
   * Supprime un rôle avec confirmation native
   */
  deleteRole(role: Role): void {
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.nom}" ?`);

    if (confirmed) {
      this.performDelete(role);
    }
  }

  /**
   * Effectue la suppression
   */
  private performDelete(role: Role): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.roleService.deleteRole(role.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.id !== role.id);
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Rôle supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la suppression du rôle');
        }
      });
  }

  /**
   * Recharge les données
   */
  refreshData(): void {
    this.loadRoles();
  }

  /**
   * Efface le filtre de recherche
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  /**
   * Obtient le nombre de permissions d'un rôle
   */
  getPermissionsCount(role: Role): number {
    return role.permissions ? role.permissions.length : 0;
  }

  /**
   * Formate l'affichage des permissions
   */
  getPermissionsDisplay(role: Role): string {
    const count = this.getPermissionsCount(role);
    return count === 0 ? 'Aucune permission' : `${count} permission${count > 1 ? 's' : ''}`;
  }

  /**
   * Obtient les premières permissions pour l'affichage
   */
  getFirstPermissions(role: Role, max: number = 3): string[] {
    if (!role.permissions || role.permissions.length === 0) {
      return [];
    }

    return role.permissions
      .slice(0, max)
      .map(p => typeof p === 'string' ? p : p.nom);
  }

  /**
   * Vérifie si un rôle peut être supprimé
   */
  canDeleteRole(role: Role): boolean {
    // Empêcher la suppression des rôles système
    const systemRoles = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM'];
    return !systemRoles.includes(role.nom.toUpperCase());
  }

  /**
   * Obtient la classe CSS pour le badge du rôle
   */
  getRoleBadgeClass(role: Role): string {
    const systemRoles = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM'];

    if (systemRoles.includes(role.nom.toUpperCase())) {
      return 'role-badge system';
    }

    return 'role-badge standard';
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
  trackByRoleId(index: number, role: Role): string {
    return role.id || index.toString();
  }
}
