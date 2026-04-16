import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface CentreEtatCivil {
  id: number;
  code: string;
  nom: string;
  commune: string;
  type: 'PRINCIPAL' | 'SECONDAIRE';
  centreParentNom?: string;
  officierDelegueNom?: string;
  actif: boolean;
}

@Component({
  selector: 'app-centres-etat-civil',
  templateUrl: './centres-etat-civil.component.html',
  styleUrls: ['./centres-etat-civil.component.css'],
})
export class CentresEtatCivilComponent implements OnInit {

  displayedColumns = ['code', 'nom', 'commune', 'type', 'centreParent', 'actif', 'actions'];
  dataSource = new MatTableDataSource<CentreEtatCivil>();
  filterTexte = '';
  filterType = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly mockData: CentreEtatCivil[] = [
    { id: 1, code: 'CEC-001', nom: 'Centre d\'état civil de Conakry Commune 1', commune: 'Kaloum', type: 'PRINCIPAL', actif: true },
    { id: 2, code: 'CEC-002', nom: 'Centre d\'état civil de Dixinn', commune: 'Dixinn', type: 'PRINCIPAL', actif: true },
    { id: 3, code: 'CEC-003', nom: 'Centre secondaire de Bellevue', commune: 'Kaloum', type: 'SECONDAIRE', centreParentNom: 'CEC-001 – Kaloum', officierDelegueNom: 'Mamadou Diallo', actif: true },
    { id: 4, code: 'CEC-004', nom: 'Centre d\'état civil de Matam', commune: 'Matam', type: 'PRINCIPAL', actif: true },
    { id: 5, code: 'CEC-005', nom: 'Centre secondaire de Koloma', commune: 'Ratoma', type: 'SECONDAIRE', centreParentNom: 'CEC-006 – Ratoma', officierDelegueNom: 'Fatoumata Camara', actif: false },
    { id: 6, code: 'CEC-006', nom: 'Centre d\'état civil de Ratoma', commune: 'Ratoma', type: 'PRINCIPAL', actif: true },
  ];

  get totalPrincipal(): number {
    return this.mockData.filter(c => c.type === 'PRINCIPAL').length;
  }
  get totalSecondaire(): number {
    return this.mockData.filter(c => c.type === 'SECONDAIRE').length;
  }
  get totalActif(): number {
    return this.mockData.filter(c => c.actif).length;
  }

  ngOnInit(): void {
    this.dataSource.data = this.mockData;
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);
      const matchTexte = !f.texte ||
        data.nom.toLowerCase().includes(f.texte) ||
        data.code.toLowerCase().includes(f.texte) ||
        data.commune.toLowerCase().includes(f.texte);
      const matchType = !f.type || data.type === f.type;
      return matchTexte && matchType;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({
      texte: this.filterTexte.toLowerCase().trim(),
      type: this.filterType,
    });
  }

  resetFilter(): void {
    this.filterTexte = '';
    this.filterType = '';
    this.applyFilter();
  }
}
