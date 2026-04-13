export type ValidationStatut = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface ValidBirth {
  // ── Identité ──────────────────────────────────────────────
  id: string;
  ravecId?: string;

  // ── Localisation ──────────────────────────────────────────
  region?: string;
  prefecture?: string;
  commune?: string;
  district?: string;
  secteur?: string;

  // ── Registre ──────────────────────────────────────────────
  anneeRegistre?: string;
  numeroRegistre?: string;
  feuillet?: string;
  numeroActe?: string;
  numeroVolet?: string;

  // ── Enfant ────────────────────────────────────────────────
  prenoms?: string;
  nom?: string;
  genre?: string;
  dateNaissance?: string;
  jourNaissance?: string;
  moisNaissance?: string;
  anneeNaissance?: string;
  jours_des_faits?: string;
  mois_des_faits?: string;
  annee_des_faits?: string;
  heureNaissance?: string;
  minuteNaissance?: string;
  nationalite_du_membre?: string;
  pays_de_naissance?: string;
  place_de_naissance?: string;
  domicileParent?: string;

  // ── Parents ───────────────────────────────────────────────
  prenomPere?: string;
  nomPere?: string;
  dateNaissancePere?: string;
  nationalitePere?: string;
  professionPere?: string;
  prenomMere?: string;
  nomMere?: string;
  dateNaissanceMere?: string;
  nationaliteMere?: string;
  professionMere?: string;

  // ── Officier & Déclarant ──────────────────────────────────
  prenomOffichier?: string;
  nomOfficier?: string;
  prenomDeclarant?: string;
  nomDeclarant?: string;
  lien_de_prarente_avec_le_declarant?: string;

  // ── Agent saisisseur ──────────────────────────────────────
  agentId?: string;
  agentNomComplet?: string;
  agentUsername?: string;

  // ── Validation ────────────────────────────────────────────
  statut: ValidationStatut;
  dateAction?: string;
  validateurId?: string;
  validateurNomComplet?: string;
  motifRejet?: string;

  // ── Audit ─────────────────────────────────────────────────
  createdAt?: string;
  updatedAt?: string;

  // ── UI state (non-API) ───────────────────────────────────
  _pdfLoading?: boolean;
}

export interface ValidBirthPage {
  content: ValidBirth[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ValidationActionRequest {
  motifRejet?: string;
}

export const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  VALIDE:     'Validé',
  REJETE:     'Rejeté',
};

export const STATUT_COLORS: Record<string, string> = {
  EN_ATTENTE: '#f59e0b',
  VALIDE:     '#10b981',
  REJETE:     '#ef4444',
};

export const STATUT_ICONS: Record<string, string> = {
  EN_ATTENTE: 'hourglass_empty',
  VALIDE:     'check_circle',
  REJETE:     'cancel',
};
