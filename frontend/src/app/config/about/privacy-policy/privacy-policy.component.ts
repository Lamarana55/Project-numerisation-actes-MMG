import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {

  lastUpdated = new Date('2025-01-15');
  currentYear = new Date().getFullYear();

  sections = [
    {
      id: 'introduction',
      title: 'Introduction',
      icon: 'info'
    },
    {
      id: 'data-collection',
      title: 'Collecte des Données',
      icon: 'database'
    },
    {
      id: 'data-usage',
      title: 'Utilisation des Données',
      icon: 'settings'
    },
    {
      id: 'data-sharing',
      title: 'Partage des Données',
      icon: 'share'
    },
    {
      id: 'data-security',
      title: 'Sécurité des Données',
      icon: 'security'
    },
    {
      id: 'user-rights',
      title: 'Droits des Utilisateurs',
      icon: 'account_circle'
    },
    {
      id: 'cookies',
      title: 'Cookies et Technologies',
      icon: 'cookie'
    },
    {
      id: 'data-retention',
      title: 'Conservation des Données',
      icon: 'schedule'
    },
    {
      id: 'contact',
      title: 'Contact',
      icon: 'contact_mail'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  printPolicy(): void {
    window.print();
  }

  downloadPDF(): void {
    // Ici vous pourriez implémenter la génération PDF
    console.log('Génération PDF en cours...');
  }
}
