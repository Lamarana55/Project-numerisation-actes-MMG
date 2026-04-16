import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface ParametrageModule {
  icon: string;
  title: string;
  description: string;
  route: string;
  gradient: string;
  iconBg: string;
  accentColor: string;
  statLabel: string;
  statValue: number;
  tag: string;
}

@Component({
  selector: 'app-parametrage-home',
  templateUrl: './parametrage-home.component.html',
  styleUrls: ['./parametrage-home.component.css'],
})
export class ParametrageHomeComponent {

  readonly modules: ParametrageModule[] = [
    {
      icon: 'home_work',
      title: 'Centres d\'état civil',
      description: 'Gérez les communes et leurs centres d\'état civil. Définissez les types (principal / secondaire) et rattachez les centres secondaires à leur centre principal.',
      route: '/admin/parametrage/centres',
      gradient: 'linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)',
      iconBg: 'rgba(21,101,192,0.12)',
      accentColor: '#1565c0',
      statLabel: 'centres configurés',
      statValue: 6,
      tag: 'Communes',
    },
    {
      icon: 'category',
      title: 'Types d\'actes',
      description: 'Configurez le référentiel des types d\'actes civils reconnus : naissance, décès, mariage, transcription, jugement supplétif, etc.',
      route: '/admin/parametrage/types-actes',
      gradient: 'linear-gradient(135deg, #6a1b9a 0%, #ab47bc 100%)',
      iconBg: 'rgba(106,27,154,0.12)',
      accentColor: '#6a1b9a',
      statLabel: 'types actifs',
      statValue: 6,
      tag: 'Référentiel',
    },
    {
      icon: 'menu_book',
      title: 'Registres',
      description: 'Gérez les registres d\'état civil par centre et par année d\'exercice. Suivez le nombre d\'actes inscrits et le statut (ouvert / clôturé).',
      route: '/admin/parametrage/registres',
      gradient: 'linear-gradient(135deg, #00695c 0%, #26a69a 100%)',
      iconBg: 'rgba(0,105,92,0.12)',
      accentColor: '#00695c',
      statLabel: 'registres actifs',
      statValue: 4,
      tag: 'Archives',
    },
    {
      icon: 'badge',
      title: 'Officiers d\'état civil',
      description: 'Gérez les officiers principaux et les officiers délégués rattachés aux centres. L\'officier délégué d\'un centre principal signe les actes des centres secondaires.',
      route: '/admin/parametrage/officiers',
      gradient: 'linear-gradient(135deg, #bf360c 0%, #ef6c00 100%)',
      iconBg: 'rgba(191,54,12,0.12)',
      accentColor: '#bf360c',
      statLabel: 'officiers en fonction',
      statValue: 5,
      tag: 'Personnel',
    },
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
