// permissions-list.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';

import { Permission } from '../../models/permission';
import { PermissionService } from '../../services/permission.service';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';

@Component({
  selector: 'app-permissions-list',
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsListComponent implements OnInit, OnDestroy {
  private readonly permissionService = inject(PermissionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  permissions: Permission[] = [];
  filteredPermissions: Permission[] = [];
  paginatedPermissions: Permission[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  // Pagination
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage = 0;
  totalItems = 0;

  // Configuration du tableau
  displayedColumns: string[] = ['nom', 'description', 'actions'];

  ngOnInit(): void {
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge toutes les permissions
   */
  loadPermissions(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    this.permissionService.getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permissions) => {
          this.permissions = permissions;
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Erreur lors du chargement des permissions:', error);
          this.error = 'Impossible de charger les permissions';
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors du chargement des permissions');
        }
      });
  }

  /**
   * Applique le filtre de recherche
   */
  applyFilter(): void {
    let filtered = [...this.permissions];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(permission =>
        permission.nom.toLowerCase().includes(term) ||
        (permission.description && permission.description.toLowerCase().includes(term))
      );
    }

    this.filteredPermissions = filtered;
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
    this.paginatedPermissions = this.filteredPermissions.slice(startIndex, endIndex);
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
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: {
        permission: null,
        title: 'Nouvelle Permission'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPermission(result);
      }
    });
  }

  /**
   * Ouvre le dialog de modification
   */
  openEditDialog(permission: Permission): void {
    const dialogRef = this.dialog.open(PermissionDialogComponent, {
      width: '500px',
      data: {
        permission: { ...permission },
        title: 'Modifier Permission'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePermission(permission.id!, result);
      }
    });
  }

  /**
   * Crée une nouvelle permission
   */
  createPermission(permissionData: Permission): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.permissionService.createPermission(permissionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (permission) => {
          this.permissions.push(permission);
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Permission créée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la création de la permission');
        }
      });
  }

  /**
   * Met à jour une permission existante
   */
  updatePermission(id: string, permissionData: Permission): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.permissionService.updatePermission(id, permissionData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedPermission) => {
          const index = this.permissions.findIndex(p => p.id === id);
          if (index !== -1) {
            this.permissions[index] = updatedPermission;
            this.applyFilter();
          }
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Permission modifiée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la modification de la permission');
        }
      });
  }

  /**
   * Supprime une permission avec confirmation native
   */
  deletePermission(permission: Permission): void {
    // Utilisation de la confirmation native du navigateur - SIMPLE ET SANS ERREUR
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer la permission "${permission.nom}" ?`);

    if (confirmed) {
      this.performDelete(permission);
    }
  }

  /**
   * Effectue la suppression
   */
  private performDelete(permission: Permission): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.permissionService.deletePermission(permission.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.permissions = this.permissions.filter(p => p.id !== permission.id);
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Permission supprimée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.loading = false;
          this.cdr.markForCheck();
          this.showNotification('Erreur lors de la suppression de la permission');
        }
      });
  }

  /**
   * Recharge les données
   */
  refreshData(): void {
    this.loadPermissions();
  }

  /**
   * Efface le filtre de recherche
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
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
  trackByPermissionId(index: number, permission: Permission): string {
    return permission.id || index.toString();
  }
}
