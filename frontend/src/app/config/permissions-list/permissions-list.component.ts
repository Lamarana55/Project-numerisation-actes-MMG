import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

import { Permission } from '../../models/permission';
import { PermissionService } from '../../services/permission.service';
import { PermissionDialogComponent } from './permission-dialog/permission-dialog.component';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-permissions-list',
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissionsListComponent implements OnInit, OnDestroy {

  private readonly permService = inject(PermissionService);
  private readonly snackBar    = inject(MatSnackBar);
  private readonly dialog      = inject(MatDialog);
  private readonly cdr         = inject(ChangeDetectorRef);
  private readonly destroy$    = new Subject<void>();

  permissions:          Permission[] = [];
  filteredPermissions:  Permission[] = [];
  paginatedPermissions: Permission[] = [];
  loading = false;
  error: string | null = null;

  searchControl = new FormControl('');

  pageSize        = 10;
  pageSizeOptions = [5, 10, 25, 50];
  currentPage     = 0;
  totalItems      = 0;

  displayedColumns = ['nom', 'description', 'actions'];

  ngOnInit(): void { this.loadPermissions(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadPermissions(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();
    this.permService.getAllPermissions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perms) => {
          this.permissions = perms;
          this.applyFilter();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = 'Impossible de charger les permissions';
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors du chargement', 'error');
        }
      });
  }

  applyFilter(): void {
    const term = (this.searchControl.value || '').toLowerCase().trim();
    this.filteredPermissions = term
      ? this.permissions.filter(p =>
          p.nom.toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term))
      : [...this.permissions];
    this.totalItems  = this.filteredPermissions.length;
    this.currentPage = 0;
    this.updatePaginated();
  }

  private updatePaginated(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedPermissions = this.filteredPermissions.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize    = e.pageSize;
    this.updatePaginated();
  }

  clearSearch(): void { this.searchControl.setValue(''); this.applyFilter(); }
  refreshData(): void { this.loadPermissions(); }

  // ── CRUD ──────────────────────────────────────────────────────
  openAddDialog(): void {
    const ref = this.dialog.open(PermissionDialogComponent, {
      width: '500px', maxWidth: '95vw',
      data: { mode: 'create', permission: null }
    });
    ref.afterClosed().subscribe(result => { if (result) this.createPermission(result); });
  }

  openEditDialog(perm: Permission): void {
    const ref = this.dialog.open(PermissionDialogComponent, {
      width: '500px', maxWidth: '95vw',
      data: { mode: 'edit', permission: { ...perm } }
    });
    ref.afterClosed().subscribe(result => { if (result) this.updatePermission(perm.id!, result); });
  }

  private createPermission(data: any): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.permService.createPermission(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (perm) => {
          this.permissions = [perm, ...this.permissions];
          this.loading = false;
          this.applyFilter();
          this.notify('Permission créée avec succès', 'success');
        },
        error: (err) => {
          this.loading = false;
          this.cdr.markForCheck();
          const msg = err.status === 409 ? 'Cette permission existe déjà' : 'Erreur lors de la création';
          this.notify(msg, 'error');
        }
      });
  }

  private updatePermission(id: string, data: any): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.permService.updatePermission(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.permissions.findIndex(p => p.id === id);
          if (idx !== -1) this.permissions[idx] = updated;
          this.loading = false;
          this.applyFilter();
          this.notify('Permission modifiée avec succès', 'success');
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors de la modification', 'error');
        }
      });
  }

  deletePermission(perm: Permission): void {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      width: '440px', maxWidth: '95vw',
      data: { type: 'delete', userName: perm.nom }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.cdr.markForCheck();
      this.permService.deletePermission(perm.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.permissions = this.permissions.filter(p => p.id !== perm.id);
            this.loading = false;
            this.applyFilter();
            this.notify('Permission supprimée avec succès', 'success');
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
            this.notify('Erreur lors de la suppression', 'error');
          }
        });
    });
  }

  private notify(msg: string, type: 'success' | 'error'): void {
    this.snackBar.open(msg, 'Fermer', {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? 'snackbar-success' : 'snackbar-error'
    });
  }

  trackById(_: number, p: Permission): string { return p.id ?? ''; }
}
