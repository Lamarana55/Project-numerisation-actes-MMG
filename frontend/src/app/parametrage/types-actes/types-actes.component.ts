import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface TypeActe {
  id: number;
  code: string;
  libelle: string;
  description: string;
  actif: boolean;
}

@Component({
  selector: 'app-types-actes',
  templateUrl: './types-actes.component.html',
  styleUrls: ['./types-actes.component.css'],
})
export class TypesActesComponent implements OnInit {

  displayedColumns = ['code', 'libelle', 'description', 'actif', 'actions'];
  dataSource = new MatTableDataSource<TypeActe>();
  filterTexte = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly mockData: TypeActe[] = [
    { id: 1, code: 'NAISS', libelle: 'Naissance', description: 'Déclaration et enregistrement d\'un acte de naissance', actif: true },
    { id: 2, code: 'DECES', libelle: 'Décès', description: 'Déclaration et enregistrement d\'un acte de décès', actif: true },
    { id: 3, code: 'MARIAGE', libelle: 'Mariage', description: 'Enregistrement d\'un acte de mariage', actif: true },
    { id: 4, code: 'DIVOR', libelle: 'Divorce', description: 'Enregistrement d\'un acte de divorce', actif: false },
    { id: 5, code: 'RECONN', libelle: 'Reconnaissance', description: 'Acte de reconnaissance de paternité', actif: true },
    { id: 6, code: 'TRANS_NAISS', libelle: 'Transcription naissance', description: 'Transcription du jugement supplétif de naissance', actif: true },
    { id: 7, code: 'TRANS_DECES', libelle: 'Transcription décès', description: 'Transcription du jugement supplétif de décès', actif: true },
  ];

  get totalActif(): number { return this.mockData.filter(t => t.actif).length; }
  get totalInactif(): number { return this.mockData.filter(t => !t.actif).length; }

  ngOnInit(): void {
    this.dataSource.data = this.mockData;
    this.dataSource.filterPredicate = (data, filter) =>
      data.libelle.toLowerCase().includes(filter) ||
      data.code.toLowerCase().includes(filter) ||
      data.description.toLowerCase().includes(filter);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    this.dataSource.filter = this.filterTexte.toLowerCase().trim();
  }
}
