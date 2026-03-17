export enum Delete{
  Yes, No
}

export enum PaymentType{
  CASH, CHECK, TRANSFERT, DEPOSIT
}

export enum PaymentStatus{
  CREATED, VALIDATED, REJECTED
}


export interface PageResponseDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}


export interface ValidationStats {
  // Période
  dateDebut: string;
  dateFin: string;

  // Territoire
  nomRegion?: string;
  nomPrefecture?: string;

  // Statistiques principales
  totalActesTraites: number;
  totalActesValides: number;
  totalActesRejetes: number;
  tauxValidation: number;
  tauxRejet: number;

  // Répartition par genre
  validesHommes: number;
  validesFemmes: number;
  rejetesHommes: number;
  rejetesFemmes: number;

  // Top raisons de rejet
  topRaisonsRejet: Array<{
    raison: string;
    nombre: number;
    pourcentage: number;
  }>;

  // Performance coordinateurs
  performanceCoordinateurs: Array<{
    nomComplet: string;
    prefecture: string;
    totalTraites: number;
    totalValides: number;
    tauxValidation: number;
  }>;

  // Évolution quotidienne
  evolutionQuotidienne: Array<{
    date: string;
    valides: number;
    rejetes: number;
  }>;
}
