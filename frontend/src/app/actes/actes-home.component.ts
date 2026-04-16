import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth.service';
import { ActeSelectionDialogComponent } from './acte-selection-dialog/acte-selection-dialog.component';

@Component({
  selector: 'app-actes-home',
  templateUrl: './actes-home.component.html',
  styleUrls: ['./actes-home.component.css'],
})
export class ActesHomeComponent {

  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);

  // Recherche
  searchNpi = '';
  searchNom = '';
  searchPrenom = '';
  searchDateDebut = '';
  searchDateFin = '';
  searchNumero = '';
  searchTypeActe = '';

  today = new Date();

  openCreationDialog(type: 'naissance' | 'deces' | 'autres'): void {
    const ref = this.dialog.open(ActeSelectionDialogComponent, {
      width: '960px',
      maxWidth: '96vw',
      data: { type },
      panelClass: 'acte-selection-panel',
    });
    ref.afterClosed().subscribe((route: string | undefined) => {
      if (route) {
        this.router.navigate([route]);
      }
    });
  }

  rechercher(): void {
    // TODO: implémenter la recherche d'actes
  }

  effacerCriteres(): void {
    this.searchNpi = '';
    this.searchNom = '';
    this.searchPrenom = '';
    this.searchDateDebut = '';
    this.searchDateFin = '';
    this.searchNumero = '';
    this.searchTypeActe = '';
  }
}
