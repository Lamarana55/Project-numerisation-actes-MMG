import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface OfficierEtatCivil {
  id: number;
  matricule: string;
  nom: string;
  prenom: string;
  centreNom: string;
  typeCentre: 'PRINCIPAL' | 'SECONDAIRE';
  type: 'OFFICIER_PRINCIPAL' | 'OFFICIER_DELEGUE';
  dateDebut: string;
  dateFin?: string;
  actif: boolean;
}

@Component({
  selector: 'app-officiers-etat-civil',
  templateUrl: './officiers-etat-civil.component.html',
  styleUrls: ['./officiers-etat-civil.component.css'],
})
export class OfficiersEtatCivilComponent implements OnInit {

  displayedColumns = ['matricule', 'identite', 'centre', 'type', 'dateDebut', 'actif', 'actions'];
  dataSource = new MatTableDataSource<OfficierEtatCivil>();
  filterTexte = '';
  filterType = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly mockData: OfficierEtatCivil[] = [
    { id: 1, matricule: 'OFC-001', nom: 'Diallo', prenom: 'Mamadou', centreNom: 'CEC Kaloum', typeCentre: 'PRINCIPAL', type: 'OFFICIER_PRINCIPAL', dateDebut: '2022-01-01', actif: true },
    { id: 2, matricule: 'OFC-002', nom: 'Camara', prenom: 'Fatoumata', centreNom: 'CEC Dixinn', typeCentre: 'PRINCIPAL', type: 'OFFICIER_PRINCIPAL', dateDebut: '2021-03-15', actif: true },
    { id: 3, matricule: 'OFC-003', nom: 'Kouyaté', prenom: 'Ibrahima', centreNom: 'CEC Bellevue', typeCentre: 'SECONDAIRE', type: 'OFFICIER_DELEGUE', dateDebut: '2023-06-01', actif: true },
    { id: 4, matricule: 'OFC-004', nom: 'Bah', prenom: 'Aissatou', centreNom: 'CEC Matam', typeCentre: 'PRINCIPAL', type: 'OFFICIER_PRINCIPAL', dateDebut: '2020-09-01', dateFin: '2023-12-31', actif: false },
    { id: 5, matricule: 'OFC-005', nom: 'Soumah', prenom: 'Lancinet', centreNom: 'CEC Koloma', typeCentre: 'SECONDAIRE', type: 'OFFICIER_DELEGUE', dateDebut: '2024-01-10', actif: true },
    { id: 6, matricule: 'OFC-006', nom: 'Sylla', prenom: 'Mariama', centreNom: 'CEC Ratoma', typeCentre: 'PRINCIPAL', type: 'OFFICIER_PRINCIPAL', dateDebut: '2022-07-01', actif: true },
  ];

  get totalPrincipal(): number { return this.mockData.filter(o => o.type === 'OFFICIER_PRINCIPAL').length; }
  get totalDelegue(): number { return this.mockData.filter(o => o.type === 'OFFICIER_DELEGUE').length; }
  get totalActif(): number { return this.mockData.filter(o => o.actif).length; }

  ngOnInit(): void {
    this.dataSource.data = this.mockData;
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);
      const matchTexte = !f.texte ||
        data.nom.toLowerCase().includes(f.texte) ||
        data.prenom.toLowerCase().includes(f.texte) ||
        data.matricule.toLowerCase().includes(f.texte) ||
        data.centreNom.toLowerCase().includes(f.texte);
      const matchType = !f.type || data.type === f.type;
      return matchTexte && matchType;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ texte: this.filterTexte.toLowerCase().trim(), type: this.filterType });
  }

  resetFilter(): void {
    this.filterTexte = '';
    this.filterType = '';
    this.applyFilter();
  }
}
