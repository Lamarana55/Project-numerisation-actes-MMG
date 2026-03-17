import { Component, OnInit } from '@angular/core';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  category: 'system' | 'validation' | 'user' | 'report';
  actionUrl?: string;
  actionText?: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {

  notifications: Notification[] = [
    {
      id: '1',
      title: 'Nouvelle demande de validation',
      message: 'Plusieurs nouvelles demandes d\'actes civils sont en attente de validation.',
      type: 'info',
      read: false,
      createdAt: new Date(),
      category: 'validation',
      actionUrl: '/admin/validation/pending',
      actionText: 'Voir les demandes'
    },
    {
      id: '2',
      title: 'Données recensement mises à jour',
      message: 'Les informations de recensement de la commune de Kankan ont été mises à jour avec succès.',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 1800000), // 30 min ago
      category: 'system',
      actionUrl: '/admin/collectes/avec-actes',
      actionText: 'Voir les données'
    },
    {
      id: '3',
      title: 'Attention requise',
      message: 'Des données incomplètes ont été détectées dans plusieurs dossiers de recensement.',
      type: 'warning',
      read: true,
      createdAt: new Date(Date.now() - 7200000), // 2h ago
      category: 'validation',
      actionUrl: '/admin/validation/incomplete',
      actionText: 'Corriger les données'
    },
    {
      id: '4',
      title: 'Nouveau rapport disponible',
      message: 'Le rapport mensuel des statistiques démographiques est prêt à être consulté.',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 10800000), // 3h ago
      category: 'report',
      actionUrl: '/admin/reports/monthly',
      actionText: 'Télécharger'
    },
    {
      id: '5',
      title: 'Erreur de synchronisation',
      message: 'Échec de la synchronisation des données avec le serveur central. Intervention requise.',
      type: 'error',
      read: false,
      createdAt: new Date(Date.now() - 14400000), // 4h ago
      category: 'system',
      actionUrl: '/admin/settings/system',
      actionText: 'Diagnostiquer'
    },
    {
      id: '6',
      title: 'Utilisateur créé',
      message: 'Un nouvel utilisateur "Mariama Diallo" a été ajouté au système avec le rôle d\'agent de saisie.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      category: 'user',
      actionUrl: '/admin/users/list',
      actionText: 'Voir les utilisateurs'
    },
    {
      id: '7',
      title: 'Maintenance programmée',
      message: 'Le système sera mis à jour ce soir à 23h00 pour améliorer les performances. Durée estimée: 30 minutes.',
      type: 'warning',
      read: true,
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      category: 'system'
    },
    {
      id: '8',
      title: 'Sauvegarde complétée',
      message: 'La sauvegarde automatique quotidienne s\'est terminée avec succès. Toutes les données sont sécurisées.',
      type: 'success',
      read: false,
      createdAt: new Date(Date.now() - 259200000), // 3 days ago
      category: 'system',
      actionUrl: '/admin/settings/backup',
      actionText: 'Voir les sauvegardes'
    },
    {
      id: '9',
      title: 'Validation en cours',
      message: 'Les données de recensement pour la région de Labé sont en cours de validation par l\'équipe centrale.',
      type: 'info',
      read: true,
      createdAt: new Date(Date.now() - 345600000), // 4 days ago
      category: 'validation',
      actionUrl: '/admin/validation/approved',
      actionText: 'Suivre le processus'
    },
    {
      id: '10',
      title: 'Utilisateur déconnecté',
      message: 'L\'utilisateur "Amadou Bah" a été automatiquement déconnecté pour inactivité prolongée.',
      type: 'warning',
      read: true,
      createdAt: new Date(Date.now() - 432000000), // 5 days ago
      category: 'user'
    },
    {
      id: '11',
      title: 'Données exportées',
      message: 'L\'export des données démographiques de la préfecture de Kindia a été généré avec succès.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 518400000), // 6 days ago
      category: 'report',
      actionUrl: '/admin/reports/exports',
      actionText: 'Télécharger l\'export'
    },
    {
      id: '12',
      title: 'Anomalie détectée',
      message: 'Des incohérences ont été détectées dans les données de recensement de Faranah.',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 604800000), // 1 week ago
      category: 'validation',
      actionUrl: '/admin/validation/anomalies',
      actionText: 'Examiner les anomalies'
    },
    {
      id: '13',
      title: 'Formation terminée',
      message: 'La formation sur les nouvelles procédures de saisie s\'est terminée. Certificats disponibles.',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 691200000), // 8 days ago
      category: 'user',
      actionUrl: '/admin/users/formations',
      actionText: 'Voir les certificats'
    },
    {
      id: '14',
      title: 'Mise à jour des localités',
      message: 'Les informations des localités de la région de Mamou ont été mises à jour dans le système.',
      type: 'info',
      read: true,
      createdAt: new Date(Date.now() - 777600000), // 9 days ago
      category: 'system',
      actionUrl: '/admin/localites/list',
      actionText: 'Voir les localités'
    },
    {
      id: '15',
      title: 'Rapport statistique généré',
      message: 'Le rapport trimestriel des statistiques démographiques nationales est maintenant disponible.',
      type: 'info',
      read: true,
      createdAt: new Date(Date.now() - 864000000), // 10 days ago
      category: 'report',
      actionUrl: '/admin/reports/quarterly',
      actionText: 'Consulter le rapport'
    }
  ];

  filteredNotifications: Notification[] = [];
  selectedFilter: string = 'all';
  selectedCategory: string = 'all';
  searchTerm: string = '';

  // Filtres disponibles
  filters = [
    { value: 'all', label: 'Toutes', icon: 'notifications' },
    { value: 'unread', label: 'Non lues', icon: 'mark_email_unread' },
    { value: 'read', label: 'Lues', icon: 'mark_email_read' }
  ];

  categories = [
    { value: 'all', label: 'Toutes les catégories', icon: 'category' },
    { value: 'system', label: 'Système', icon: 'settings' },
    { value: 'validation', label: 'Validation', icon: 'fact_check' },
    { value: 'user', label: 'Utilisateurs', icon: 'people' },
    { value: 'report', label: 'Rapports', icon: 'assessment' }
  ];

  constructor() { }

  ngOnInit(): void {
    this.applyFilters();
  }

  /**
   * Obtenir l'icône pour un type de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  /**
   * Obtenir la couleur pour un type de notification
   */
  getNotificationColor(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'primary';
    }
  }

  /**
   * Obtenir l'icône pour une catégorie
   */
  getCategoryIcon(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.icon : 'category';
  }

  /**
   * Obtenir le label d'une catégorie
   */
  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  /**
   * Marquer une notification comme lue
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.applyFilters();
    }
  }

  /**
   * Marquer une notification comme non lue
   */
  markAsUnread(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && notification.read) {
      notification.read = false;
      this.applyFilters();
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.applyFilters();
  }

  /**
   * Supprimer une notification
   */
  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.applyFilters();
    }
  }

  /**
   * Supprimer toutes les notifications lues
   */
  deleteAllRead(): void {
    this.notifications = this.notifications.filter(n => !n.read);
    this.applyFilters();
  }

  /**
   * Appliquer les filtres
   */
  applyFilters(): void {
    let filtered = [...this.notifications];

    // Filtre par statut de lecture
    if (this.selectedFilter === 'read') {
      filtered = filtered.filter(n => n.read);
    } else if (this.selectedFilter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === this.selectedCategory);
    }

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    }

    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    this.filteredNotifications = filtered;
  }

  /**
   * Changer le filtre de statut
   */
  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    this.applyFilters();
  }

  /**
   * Changer le filtre de catégorie
   */
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /**
   * Rechercher dans les notifications
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * Effacer la recherche
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Obtenir le nombre de notifications lues
   */
  get readNotificationsCount(): number {
    return this.notifications.filter(n => n.read).length;
  }

  /**
   * Obtenir le nombre total de notifications
   */
  get totalCount(): number {
    return this.notifications.length;
  }

  /**
   * Formater la date relative
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }

  /**
   * Fonction de suivi pour trackBy
   */
  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
