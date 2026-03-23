import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Subject, takeUntil, catchError, of, interval } from 'rxjs';
import { DashboardData, DashboardService } from '../services/dashboard.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  providers: [provideCharts(withDefaultRegisterables())],
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  // États de l'application
  isLoading = false;
  hasError = false;
  errorMessage = '';
  lastUpdate: Date | null = null;
  connectionStatus: 'connected' | 'disconnected' | 'checking' = 'checking';

  // Données
  dashboardData: DashboardData | null = null;

  // Statistiques pour les cartes
  statsArray: Array<{
    label: string;
    value: number;
    backgroundColor: string;
    icon: string;
    percentage?: number;
    trend?: 'up' | 'down' | 'stable';
  }> = [];

  // Configuration des graphiques
  public barChartType: ChartType = 'bar';

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          color: '#666',
          font: { size: 11 },
          maxRotation: 45,
          minRotation: 0
        },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#666',
          font: { size: 11 },
          callback: (value) => this.dashboardService.formatNumber(Number(value))
        },
        grid: {
          display: true,
          color: 'rgba(0,0,0,0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            // const value = this.dashboardService.formatNumber(context.parsed.y);
            const value = context.parsed.y !== null
              ? this.dashboardService.formatNumber(context.parsed.y)
              : '0';
            return `${label}: ${value}`;
          }
        }
      }
    }
  };

  // Données des graphiques
  public menagesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Populations par Commune',
      backgroundColor: 'rgba(75, 192, 192, 0.7)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 2,
      borderRadius: 4,
      borderSkipped: false,
    }]
  };

  public demographieChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Hommes',
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        data: [],
        label: 'Femmes',
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.checkConnection();
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Vérifier la connexion au serveur
   */
  private checkConnection(): void {
    this.connectionStatus = 'checking';
    this.dashboardService.healthCheck()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.connectionStatus = response.status === 'UP' ? 'connected' : 'disconnected';
        },
        error: () => {
          this.connectionStatus = 'disconnected';
        }
      });
  }

  /**
   * Configurer le rafraîchissement automatique
   */
  private setupAutoRefresh(): void {
    interval(environment.refreshInterval)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.connectionStatus === 'connected') {
          this.loadDashboardData(true); // Mode silencieux
        }
      });
  }

  /**
   * Charger les données depuis l'API
   */
  loadDashboardData(silent: boolean = false): void {
    if (!silent) {
      this.isLoading = true;
      this.hasError = false;
      this.errorMessage = '';
    }

    this.dashboardService.getDashboardData()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Erreur lors du chargement des données:', error);
          this.hasError = true;
          this.errorMessage = error.message;
          this.connectionStatus = 'disconnected';
          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          this.isLoading = false;
          if (data) {
            this.dashboardData = data;
            this.updateStatsCards(data);
            this.updateCharts(data);
            this.lastUpdate = new Date();
            this.connectionStatus = 'connected';

            if (!silent) {
              console.log('Données chargées avec succès:', data);
            }
          }
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  /**
   * Mettre à jour les cartes de statistiques
   */
  private updateStatsCards(data: DashboardData): void {
    this.statsArray = [
      {
        label: 'Collectes Synchronisées',
        value: data.total_collectes,
        backgroundColor: 'rgba(149, 153, 155, 0.8)',
        icon: 'sync'
      },
      {
        label: 'Personnes avec Actes',
        value: data.total_collecte_avec_actes,
        backgroundColor: 'rgba(75, 161, 160, 0.8)',
        icon: 'groups',
        percentage: data.taux_avec_actes
      },
      {
        label: 'Personnes sans Actes',
        value: data.total_collecte_sans_actes,
        backgroundColor: 'rgba(243, 110, 134, 0.8)',
        icon: 'group_off',
        percentage: data.taux_sans_actes
      },
      {
        label: 'Actes Validés',
        value: data.total_valid_acte,
        backgroundColor: '#00853F',
        icon: 'verified'
      },
      {
        label: 'Actes Rejetés',
        value: data.total_rejected_acte,
        backgroundColor: '#f28686',
        icon: 'error'
      },
      {
        label: 'Total Femmes',
        value: data.total_femmes,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        icon: 'female',
        percentage: 100 - data.taux_masculinite
      }
    ];
  }

  /**
   * Mettre à jour les graphiques
   */
  private updateCharts(data: DashboardData): void {
    const sortedCommunes = this.dashboardService.sortCommunesByName(data.communes_data);

    const communeLabels = sortedCommunes.map(commune => commune.nom_commune);
    const menagesData = sortedCommunes.map(commune => commune.resultat_menages_commune);
    const hommesData = sortedCommunes.map(commune => commune.homme);
    const femmesData = sortedCommunes.map(commune => commune.femme);

    // Graphique des ménages
    this.menagesChartData = {
      labels: communeLabels,
      datasets: [{
        data: menagesData,
        label: 'Ménages par Commune',
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };

    // Graphique démographique
    this.demographieChartData = {
      labels: communeLabels,
      datasets: [
        {
          data: hommesData,
          label: 'Hommes',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        },
        {
          data: femmesData,
          label: 'Femmes',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
        }
      ]
    };
  }

  /**
   * Rafraîchir manuellement les données
   */
  refreshData(): void {
    this.loadDashboardData();
  }

  /**
   * Méthodes de formatage (délègue au service)
   */
  formatNumber(value: number): string {
    return this.dashboardService.formatNumber(value);
  }

  formatPercentage(value: number): string {
    return this.dashboardService.formatPercentage(value);
  }

  /**
   * Obtenir des statistiques rapides
   */
  getQuickStats() {
    if (!this.dashboardData) {
      return {
        totalPopulation: 0,
        tauxMasculinite: 0,
        tauxAvecActes: 0,
        topCommune: 'N/A',
        tauxValidation: 0
      };
    }

    const globalStats = this.dashboardService.calculateGlobalStats(this.dashboardData);

    return {
      totalPopulation: this.dashboardData.total_population,
      tauxMasculinite: this.dashboardData.taux_masculinite,
      tauxAvecActes: this.dashboardData.taux_avec_actes,
      topCommune: globalStats.communeLaPlusPopuleuse,
      tauxValidation: globalStats.tauxValidationActes
    };
  }

  /**
   * Obtenir la commune avec le plus de ménages
   */
  getTopCommune(): string {
    if (!this.dashboardData?.communes_data?.length) {
      return 'N/A';
    }

    const topCommune = this.dashboardService.getTopCommuneByMenages(this.dashboardData.communes_data);
    return topCommune?.nom_commune || 'N/A';
  }

  /**
   * Calculer le taux de validation des actes
   */
  getTauxValidation(): number {
    if (!this.dashboardData || this.dashboardData.total_collecte_avec_actes === 0) {
      return 0;
    }
    return (this.dashboardData.total_valid_acte / this.dashboardData.total_collecte_avec_actes) * 100;
  }

  /**
   * Obtenir l'état de connexion avec style CSS
   */
  getConnectionStatusClass(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'text-success';
      case 'disconnected': return 'text-danger';
      default: return 'text-warning';
    }
  }

  /**
   * Obtenir l'icône pour l'état de connexion
   */
  getConnectionStatusIcon(): string {
    switch (this.connectionStatus) {
      case 'connected': return 'wifi';
      case 'disconnected': return 'wifi_off';
      default: return 'sync';
    }
  }
}
