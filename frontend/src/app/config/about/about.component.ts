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
    name: 'RAVEC — Registre et Administration de l\'État Civil',
    version: '1.1.0',
    releaseDate: '2025-01-15',
    description: 'Plateforme nationale de numérisation des archives d\'état civil et d\'enregistrement des faits d\'état civil en République de Guinée',
    organization: 'Programme National de Recensement Administratif à vocation d\'État Civil (PN-RAVEC)',
    country: 'République de Guinée'
  };

  features: Feature[] = [
    {
      icon: 'scanner',
      title: 'Numérisation des Archives',
      description: 'Numérisation en haute résolution des anciens registres d\'état civil (actes de naissance, de décès et de mariage) conservés dans les centres d\'état civil.'
    },
    {
      icon: 'label',
      title: 'Indexation des Actes',
      description: 'Saisie et indexation précise des informations contenues dans les actes numérisés pour les rendre consultables et exploitables.'
    },
    {
      icon: 'child_care',
      title: 'Enregistrement des Naissances',
      description: 'Enregistrement des actes de naissance avec attribution du Numéro Personnel d\'Identification (NPI) et gestion des informations des parents.'
    },
    {
      icon: 'sentiment_very_dissatisfied',
      title: 'Enregistrement des Décès',
      description: 'Enregistrement des actes de décès avec gestion complète des informations du défunt, des circonstances et des déclarants.'
    },
    {
      icon: 'fact_check',
      title: 'Validation & Contrôle Qualité',
      description: 'Circuit de validation multi-niveaux (agent → superviseur → responsable) garantissant la qualité et l\'intégrité des données enregistrées.'
    },
    {
      icon: 'assessment',
      title: 'Rapports & Statistiques',
      description: 'Tableaux de bord analytiques avec indicateurs clés, évolution mensuelle et exports CSV / PDF par territoire et par période.'
    },
    {
      icon: 'security',
      title: 'Gestion des Accès',
      description: 'Authentification JWT avec gestion fine des rôles et permissions par niveau administratif : national, régional, préfectoral et communal.'
    },
    {
      icon: 'location_on',
      title: 'Couverture Territoriale',
      description: 'Structuration hiérarchique complète du territoire guinéen : régions → préfectures → communes, pour un suivi précis de chaque localité.'
    }
  ];

  statistics: Statistic[] = [
    {
      value: '2 000 000+',
      label: 'Archives à numériser',
      icon: 'scanner'
    },
    {
      value: '342',
      label: 'Communes couvertes',
      icon: 'location_city'
    },
    {
      value: '33',
      label: 'Préfectures',
      icon: 'map'
    },
    {
      value: '8',
      label: 'Régions administratives',
      icon: 'flag'
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
      name: 'Thierno Mouctar SOW',
      role: 'Administrateur Réseaux et Systèmes',
      email: 'admindb@ravec.gov.gn',
      avatar: 'T'
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
      version: '1.1.0',
      date: '2025-04-01',
      changes: [
        'Module Rapports & Statistiques avec sélection de période et exports CSV/PDF/PNG',
        'Indicateurs KPI détaillés : naissances/décès avec répartition par sexe',
        'Filtre territorial par région, préfecture et commune dans les rapports',
        'Correction de la liste des nationalités et des villes dans le formulaire de numérisation',
        'Tableau de bord connecté aux données réelles du backend',
        'Création automatique des utilisateurs pour toutes les communes',
        'Correction du calcul du taux de féminisation à zéro donnée'
      ]
    },
    {
      version: '1.0.0',
      date: '2024-10-15',
      changes: [
        'Module de numérisation et indexation des anciens actes d\'état civil',
        'Enregistrement des actes de naissance avec attribution du NPI',
        'Enregistrement des actes de décès',
        'Circuit de validation multi-niveaux (en attente → validé / rejeté)',
        'Gestion des utilisateurs avec rôles et permissions par niveau administratif',
        'Structuration territoriale : régions, préfectures et communes de Guinée',
        'Tableau de bord statistique par territoire',
        'Authentification sécurisée par JWT avec renouvellement automatique'
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
    const colors = ['#00853F', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#4caf50'];
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
