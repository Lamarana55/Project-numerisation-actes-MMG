import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface Registre {
  id: number;
  numero: string;
  annee: number;
  centreNom: string;
  typeActe: string;
  nbActes: number;
  actif: boolean;
}

@Component({
  selector: 'app-registres',
  templateUrl: './registres.component.html',
  styleUrls: ['./registres.component.css'],
})
export class RegistresComponent implements OnInit {

  displayedColumns = ['numero', 'annee', 'centreNom', 'typeActe', 'nbActes', 'actif', 'actions'];
  dataSource = new MatTableDataSource<Registre>();
  filterTexte = '';
  filterAnnee = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  readonly mockData: Registre[] = [
    { id: 1, numero: 'REG-2024-001', annee: 2024, centreNom: 'CEC Kaloum', typeActe: 'Naissance', nbActes: 142, actif: true },
    { id: 2, numero: 'REG-2024-002', annee: 2024, centreNom: 'CEC Kaloum', typeActe: 'Décès', nbActes: 67, actif: true },
    { id: 3, numero: 'REG-2024-003', annee: 2024, centreNom: 'CEC Dixinn', typeActe: 'Naissance', nbActes: 198, actif: true },
    { id: 4, numero: 'REG-2023-001', annee: 2023, centreNom: 'CEC Matam', typeActe: 'Naissance', nbActes: 310, actif: false },
    { id: 5, numero: 'REG-2024-004', annee: 2024, centreNom: 'CEC Ratoma', typeActe: 'Mariage', nbActes: 44, actif: true },
    { id: 6, numero: 'REG-2023-002', annee: 2023, centreNom: 'CEC Dixinn', typeActe: 'Décès', nbActes: 88, actif: false },
  ];

  get annees(): number[] {
    return [...new Set(this.mockData.map(r => r.annee))].sort((a, b) => b - a);
  }
  get totalActes(): number { return this.mockData.reduce((s, r) => s + r.nbActes, 0); }
  get totalActif(): number { return this.mockData.filter(r => r.actif).length; }

  ngOnInit(): void {
    this.dataSource.data = this.mockData;
    this.dataSource.filterPredicate = (data, filter) => {
      const f = JSON.parse(filter);
      const matchTexte = !f.texte ||
        data.numero.toLowerCase().includes(f.texte) ||
        data.centreNom.toLowerCase().includes(f.texte) ||
        data.typeActe.toLowerCase().includes(f.texte);
      const matchAnnee = !f.annee || data.annee === +f.annee;
      return matchTexte && matchAnnee;
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(): void {
    this.dataSource.filter = JSON.stringify({ texte: this.filterTexte.toLowerCase().trim(), annee: this.filterAnnee });
  }

  resetFilter(): void {
    this.filterTexte = '';
    this.filterAnnee = '';
    this.applyFilter();
  }
}
