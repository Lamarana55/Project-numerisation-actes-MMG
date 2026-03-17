import { Component, OnInit } from '@angular/core';

interface TeamMember {
  name: string;
  role: string;
  email: string;
  avatar: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Statistic {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {

  currentYear = new Date().getFullYear();

  appInfo = {
    name: '- Système de Validations des Données Collectés',
    version: '1.1.0',
    releaseDate: '2025-01-15',
    description: 'Plateforme numérique moderne pour la validation des données de l\'enquête ménage',
    organization: 'Programme National de Recensement Administratif à vocation d\'Etat Civil',
    country: 'République de Guinée'
  };

  features: Feature[] = [
    {
      icon: 'assignment_ind',
      title: 'Gestion des Actes',
      description: 'Validations des données des personnes qui ont des actes d\'état civil '
    },
    {
      icon: 'fact_check',
      title: 'Génération des actes ',
      description: 'Système de génération des actes validés '
    },
    {
      icon: 'security',
      title: 'Sécurité Avancée',
      description: 'Authentification avec gestion des accès, des rôles et des permissions utilisateurs de manière fine et sécurisée.'
    },
    {
      icon: 'assessment',
      title: 'Rapports Détaillés',
      description: 'Génération des rapports statistiques et tableaux de bord interactifs'
    },
    {
      icon: 'location_on',
      title: 'Gestion des localités',
      description: 'Structuration hiérarchique des localités dans le cadre de la décentralisation.'
    },
    {
      icon: 'cloud_sync',
      title: 'Synchronisation',
      description: 'Synchronisation en temps réel entre les différents centres de collecte'
    }
  ];

  statistics: Statistic[] = [
    {
      value: '250,000+',
      label: 'Actes Traités',
      icon: 'description'
    },
    {
      value: '1,500+',
      label: 'Utilisateurs Actifs',
      icon: 'people'
    },
    {
      value: '33',
      label: 'Préfectures Couvertes',
      icon: 'location_city'
    },
    {
      value: '99.5%',
      label: 'Disponibilité',
      icon: 'trending_up'
    }
  ];

  teamMembers: TeamMember[] = [
    {
      name: 'Mohamed Franck SYLLA',
      role: 'Chef de Projet',
      email: 'chefserviceinfo@ravec.gov.gn',
      avatar: 'M'
    },
    {
      name: 'Mamadou Lamarana DIALLO',
      role: 'Ingénieur Développeur ',
      email: 'ml.diallo@ravec.gov.gn',
      avatar: 'I'
    },
    {
      name: 'Mohamed Lamine FOFANA',
      role: 'Administrateur Base de données',
      email: 'admindb@ravec.gov.gn',
      avatar: 'I'
    },
    {
      name: 'Ibrahima Sorry CONDE',
      role: 'Ingénieur Développeur',
      email: 'admindb@ravec.gov.gn',
      avatar: 'S'
    },
    {
      name: 'Sekou LOUA',
      role: 'DevOps',
      email: 'admindb@ravec.gov.gn',
      avatar: 'I'
    },
    {
      name: 'Raymon Gbamou KPOGOMOU',
      role: 'Administrateur Réseaux et Systèmes.',
      email: 'admindb@ravec.gov.gn',
      avatar: 'I'
    },
    {
      name: 'Ansoumane DIALLO',
      role: 'Administrateur Réseaux et Systèmes.',
      email: 'admindb@ravec.gov.gn',
      avatar: 'I'
    },
    {
      name: 'Yaya GNABALY',
      role: 'Administrateur Base de données',
      email: 'admindb@ravec.gov.gn',
      avatar: 'I'
    }
  ];

  technologies = [
    { name: 'Angular', version: '17.x', logo: 'web' },
    { name: 'Spring Boot', version: '3.x', logo: 'memory' },
    { name: 'PostgreSQL', version: '15.x', logo: 'storage' },
    { name: 'Docker', version: 'Latest', logo: 'developer_board' },
    { name: 'Kubernetes', version: '1.28', logo: 'cloud' },
    // { name: 'Redis', version: '7.x', logo: 'flash_on' }
  ];

  changelog = [
    {
      version: '1.0.0',
      date: '2024-10-15',
      changes: [
        'Verification des actes',
        'validations ou rejet des actes ',
        'Générations des actes',
        'Gestion des utisateurs',
        'Gestion des roles et permissions ',
        'Gestion des localités',
        'Export de données ',
        'Statistiques',
        'Système de sauvegarde automatique',
        'Corrections de bugs critiques'
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialisation si nécessaire
  }

  /**
   * Obtenir les initiales pour l'avatar
   */
  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  /**
   * Générer une couleur d'avatar basée sur le nom
   */
  getAvatarColor(name: string): string {
    const colors = ['#4a8a4e', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#4caf50'];
    const index = name.length % colors.length;
    return colors[index];
  }

  /**
   * Ouvrir un lien externe
   */
  openExternalLink(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Copier l'email dans le presse-papiers
   */
  copyEmail(email: string): void {
    navigator.clipboard.writeText(email).then(() => {
      // Ici vous pourriez ajouter une notification de succès
      console.log('Email copié dans le presse-papiers');
    });
  }
}
