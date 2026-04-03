import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, inject
} from '@angular/core';
import { ToastService } from '../../services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';

import { Role } from '../../models/role';
import { RoleService } from '../../services/role.service';
import { RoleFormDialogComponent } from './role-form-dialog/role-form-dialog.component';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';

@Component({
  selector: 'app-roles-list',
  templateUrl: './roles-list.component.html',
  styleUrls: ['./roles-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RolesListComponent implements OnInit, OnDestroy {

  private readonly roleService  = inject(RoleService);
  private readonly toast        = inject(ToastService);
  private readonly dialog       = inject(MatDialog);
  private readonly cdr          = inject(ChangeDetectorRef);
  private readonly destroy$     = new Subject<void>();

  roles:          Role[] = [];
  filteredRoles:  Role[] = [];
  paginatedRoles: Role[] = [];
  loading = false;
  error: string | null = null;

  searchControl = new FormControl('');

  pageSize        = 10;
  pageSizeOptions = [5, 10, 25];
  currentPage     = 0;
  totalItems      = 0;

  displayedColumns = ['nom', 'description', 'permissions', 'actions'];

  readonly SYSTEM_ROLES = ['ADMIN', 'SUPER_ADMIN', 'SYSTEM'];

  ngOnInit(): void { this.loadRoles(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

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
        error: () => {
          this.error = 'Impossible de charger les rôles';
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors du chargement des rôles', 'error');
        }
      });
  }

  applyFilter(): void {
    const term = (this.searchControl.value || '').toLowerCase().trim();
    this.filteredRoles = term
      ? this.roles.filter(r =>
          r.nom.toLowerCase().includes(term) ||
          (r.description || '').toLowerCase().includes(term))
      : [...this.roles];
    this.totalItems  = this.filteredRoles.length;
    this.currentPage = 0;
    this.updatePaginated();
  }

  private updatePaginated(): void {
    const start = this.currentPage * this.pageSize;
    this.paginatedRoles = this.filteredRoles.slice(start, start + this.pageSize);
    this.cdr.markForCheck();
  }

  onPageChange(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize    = e.pageSize;
    this.updatePaginated();
  }

  clearSearch(): void { this.searchControl.setValue(''); this.applyFilter(); }
  refreshData(): void { this.loadRoles(); }

  // ── CRUD ──────────────────────────────────────────────────────
  openAddDialog(): void {
    const ref = this.dialog.open(RoleFormDialogComponent, {
      width: '720px', maxWidth: '95vw',
      data: { mode: 'create', role: null }
    });
    ref.afterClosed().subscribe(result => { if (result) this.createRole(result); });
  }

  openEditDialog(role: Role): void {
    const ref = this.dialog.open(RoleFormDialogComponent, {
      width: '720px', maxWidth: '95vw',
      data: { mode: 'edit', role: { ...role } }
    });
    ref.afterClosed().subscribe(result => { if (result) this.updateRole(role.id!, result); });
  }

  private createRole(data: any): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.roleService.createRole(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (role) => {
          this.roles = [role, ...this.roles];
          this.loading = false;
          this.applyFilter();
          this.notify('Rôle créé avec succès', 'success');
        },
        error: (err) => {
          this.loading = false;
          this.cdr.markForCheck();
          const msg = err.status === 409 ? 'Ce nom de rôle existe déjà' : 'Erreur lors de la création';
          this.notify(msg, 'error');
        }
      });
  }

  private updateRole(id: string, data: any): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.roleService.updateRole(id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          const idx = this.roles.findIndex(r => r.id === id);
          if (idx !== -1) this.roles[idx] = updated;
          this.loading = false;
          this.applyFilter();
          this.notify('Rôle modifié avec succès', 'success');
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
          this.notify('Erreur lors de la modification', 'error');
        }
      });
  }

  deleteRole(role: Role): void {
    const ref = this.dialog.open(ConfirmActionDialogComponent, {
      width: '440px', maxWidth: '95vw',
      data: { type: 'delete', userName: role.nom }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.loading = true;
      this.cdr.markForCheck();
      this.roleService.deleteRole(role.id!)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.roles = this.roles.filter(r => r.id !== role.id);
            this.loading = false;
            this.applyFilter();
            this.notify('Rôle supprimé avec succès', 'success');
          },
          error: () => {
            this.loading = false;
            this.cdr.markForCheck();
            this.notify('Erreur lors de la suppression', 'error');
          }
        });
    });
  }

  // ── Helpers ───────────────────────────────────────────────────
  isSystemRole(role: Role): boolean {
    return this.SYSTEM_ROLES.includes(role.nom.toUpperCase());
  }

  getPermCount(role: Role): number {
    return role.permissions?.length ?? 0;
  }

  getPermPreview(role: Role, max = 3): string[] {
    return (role.permissions ?? []).slice(0, max).map(p => p.nom);
  }

  private notify(msg: string, type: 'success' | 'error'): void {
    this.toast[type](msg);
  }

  trackById(_: number, r: Role): string { return r.id ?? ''; }
}
