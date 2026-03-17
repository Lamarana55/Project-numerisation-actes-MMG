import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrl: './admin-template.component.css'
})
export class AdminTemplateComponent implements OnInit {

  // État des sous-menus
  showActesSubmenu = false;
  showValidationSubmenu = false;
  showSettingsSubmenu = false;
  showUsersSubmenu = false;
  showRolesSubmenu = false;
  showLocalitiesSubmenu = false;
  showReportsSubmenu = false;
  showConfigSubmenu = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Écouter les changements de route pour auto-expand les menus
    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.autoExpandMenus(event.url);
    });

    // Initialiser l'état des menus basé sur l'URL actuelle
    this.autoExpandMenus(this.router.url);
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    this.authService.logout();
  }

  /**
   * Obtenir le rôle de l'utilisateur
   */
  getUserRole(): string {
    if (this.authService.roles && this.authService.roles.length > 0) {
      return this.authService.roles[0].replace('ROLE_', '').replace('_', ' ');
    }
    return 'Utilisateur';
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
   * Obtenir la couleur de l'icône pour un type de notification
   */
  getNotificationIconColor(type: string): string {
    switch (type) {
      case 'success': return 'primary';
      case 'warning': return 'accent';
      case 'error': return 'warn';
      default: return '';
    }
  }

  /**
   * Basculer le sous-menu des actes
   */
  toggleActesSubmenu(): void {
    this.showActesSubmenu = !this.showActesSubmenu;
  }

  /**
   * Basculer le sous-menu des utilisateurs
   */
  toggleUsersSubmenu(): void {
    this.showUsersSubmenu = !this.showUsersSubmenu;
  }

  /**
   * Basculer le sous-menu des rapports
   */
  toggleReportsSubmenu(): void {
    this.showReportsSubmenu = !this.showReportsSubmenu;
  }

  /**
   * Basculer le sous-menu de validation
   */
  toggleValidationSubmenu(): void {
    this.showValidationSubmenu = !this.showValidationSubmenu;
  }


  /**
   * Basculer le sous-menu des paramétrages
   */
  toggleSettingsSubmenu(): void {
    this.showSettingsSubmenu = !this.showSettingsSubmenu;
  }

  /**
   * Basculer le sous-menu des rôles
   */
  toggleRolesSubmenu(): void {
    this.showRolesSubmenu = !this.showRolesSubmenu;
  }

  /**
   * Basculer le sous-menu des localités
   */
  toggleLocalitiesSubmenu(): void {
    this.showLocalitiesSubmenu = !this.showLocalitiesSubmenu;
  }

  /**
   * Basculer le sous-menu de configuration
   */
  toggleConfigSubmenu(): void {
    this.showConfigSubmenu = !this.showConfigSubmenu;
  }

  /**
   * Fermer tous les sous-menus
   */
  closeAllSubmenus(): void {
    this.showActesSubmenu = false;
    this.showValidationSubmenu = false;
    this.showSettingsSubmenu = false;
    this.showUsersSubmenu = false;
    this.showRolesSubmenu = false;
    this.showLocalitiesSubmenu = false;
    this.showReportsSubmenu = false;
    this.showConfigSubmenu = false;
  }

  /**
   * Ouvrir tous les sous-menus
   */
  openAllSubmenus(): void {
    this.showActesSubmenu = true;
    this.showValidationSubmenu = true;
    this.showSettingsSubmenu = true;
    this.showUsersSubmenu = true;
    this.showRolesSubmenu = true;
    this.showLocalitiesSubmenu = true;
    this.showReportsSubmenu = true;
    this.showConfigSubmenu = true;
  }

  // Dans admin-template.component.ts - Remplacer la méthode autoExpandMenus

/**
 * Auto-expand des menus basé sur l'URL actuelle
 */
private autoExpandMenus(url: string): void {
  // Réinitialiser tous les sous-menus
  this.closeAllSubmenus();

  // Ouvrir le sous-menu approprié basé sur l'URL
  if (url.includes('/admin/collectes/')) {
    this.showActesSubmenu = true;
  } else if (url.includes('/admin/validation/')) {
    this.showValidationSubmenu = true;
  } else if (url.includes('/admin/users/') || url.includes('/admin/roles/') ||
             url.includes('/admin/permissions/') || url.includes('/admin/localites/') ||
             url.includes('/admin/settings/')) {
    this.showSettingsSubmenu = true;

    // Ouvrir les sous-menus de second niveau basé sur l'URL
    if (url.includes('/admin/users/')) {
      this.showUsersSubmenu = true;
    } else if (url.includes('/admin/roles/') || url.includes('/admin/permissions/')) {
      this.showRolesSubmenu = true;
    } else if (url.includes('/admin/localites/')) {
      this.showLocalitiesSubmenu = true;
    }
  } else if (url.includes('/admin/reports/')) {
    this.showReportsSubmenu = true;
  } else if (url.includes('/admin/config/')) {
    this.showConfigSubmenu = true;
  }
}

// Ajouter ces nouvelles méthodes pour vérifier les permissions

/**
 * Vérifier si l'utilisateur peut voir le menu Paramétrages
 */

canViewSettings(): boolean {
  return this.authService.roles?.includes('CAN_MANAGE_SETTINGS') ||
         this.authService.roles?.includes('CAN_MANAGE_USERS') ||
         this.authService.roles?.includes('CAN_MANAGE_ROLES') ||
         this.authService.roles?.includes('CAN_MANAGE_LOCALITES') || false;
}

/**
 * Vérifier si l'utilisateur peut voir le menu Validation
 */
canViewValidation(): boolean {
  return this.authService.roles?.includes('CAN_VIEW_VALIDATED_ACTS') || false;
}
/**
 * Vérifier si l'utilisateur peut voir le menu Utilisateurs
 */
canViewUsers(): boolean {
  return this.authService.roles?.includes('CAN_MANAGE_USERS') || false;
}

/**
 * Vérifier si l'utilisateur peut voir le menu Rôles
 */
canViewRoles(): boolean {
  return this.authService.roles?.includes('CAN_MANAGE_ROLES') ||
         this.authService.roles?.includes('CAN_MANAGE_PERMISSIONS') || false;
}

/**
 * Vérifier si l'utilisateur peut voir le menu Localités
 */
canViewLocalities(): boolean {
  return this.authService.roles?.includes('CAN_MANAGE_LOCALITES') ||
         this.authService.roles?.includes('CAN_MANAGE_SETTINGS') || false;
}

canViewReports(): boolean {
  return this.authService.roles?.includes('CAN_VIEW_REPORTS') ||
         this.authService.roles?.includes('CAN_MANAGE_SETTINGS') || false;
}

  /**
   * Vérifier si l'utilisateur a une permission spécifique
   */
  hasPermission(permission: string): boolean {
    return this.authService.roles?.includes(permission) || false;
  }

  /**
   * Vérifier si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.authService.roles?.includes(role));
  }

  /**
   * Obtenir le nom d'affichage de l'utilisateur
   */
  get displayName(): string {
    return this.authService.username || 'Utilisateur';
  }

  /**
   * Obtenir le nombre de notifications (exemple)
   */
  /* get notificationCount(): number {
    // Ici vous pouvez implémenter la logique pour récupérer le nombre réel de notifications
    return 5; // Valeur par défaut
  } */

  /**
   * Naviguer vers une route spécifique
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Gérer le clic sur un menu parent
   */
  onMenuParentClick(menuType: string): void {
    switch (menuType) {
      case 'actes':
        this.toggleActesSubmenu();
        break;
      case 'validation':
        this.toggleValidationSubmenu();
        break;
      case 'settings':
        this.toggleSettingsSubmenu();
        break;
      case 'users':
        this.toggleUsersSubmenu();
        break;
      case 'roles':
        this.toggleRolesSubmenu();
        break;
      case 'localities':
        this.toggleLocalitiesSubmenu();
        break;
      case 'reports':
        this.toggleReportsSubmenu();
        break;
      case 'config':
        this.toggleConfigSubmenu();
        break;
    }
  }

  /**
   * Vérifier si un sous-menu est ouvert
   */
  isSubmenuOpen(menuType: string): boolean {
    switch (menuType) {
      case 'actes':
        return this.showActesSubmenu;
      case 'validation':
        return this.showValidationSubmenu;
      case 'settings':
        return this.showSettingsSubmenu;
      case 'users':
        return this.showUsersSubmenu;
      case 'roles':
        return this.showRolesSubmenu;
      case 'localities':
        return this.showLocalitiesSubmenu;
      case 'reports':
        return this.showReportsSubmenu;
      case 'config':
        return this.showConfigSubmenu;
      default:
        return false;
    }
  }

}
