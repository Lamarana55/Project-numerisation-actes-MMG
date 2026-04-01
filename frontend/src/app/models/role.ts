import { Permission } from './permission';
import { NiveauAdministratif } from './user';

export interface Role {
  id?: string;
  /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR) */
  nom: string;
  /** Libellé affiché (ex: Super-Administrateur) */
  libelle?: string;
  description?: string;
  /** Niveau administratif déterminant la portée territoriale */
  niveauAdministratif?: NiveauAdministratif;
  permissions?: Permission[];
}

/** Métadonnées statiques des profils pour l'affichage */
export const PROFIL_META: Record<string, { libelle: string; niveau: NiveauAdministratif; couleur: string; icone: string }> = {
  SUPER_ADMINISTRATEUR: {
    libelle: 'Super-Administrateur',
    niveau: 'CENTRAL',
    couleur: '#7B1FA2',
    icone: 'admin_panel_settings'
  },
  ADMINISTRATEUR: {
    libelle: 'Administrateur',
    niveau: 'CENTRAL',
    couleur: '#1565C0',
    icone: 'manage_accounts'
  },
  ANALYSTE: {
    libelle: 'Analyste',
    niveau: 'CENTRAL',
    couleur: '#00838F',
    icone: 'analytics'
  },
  COORDINATEUR_REGIONAL: {
    libelle: 'Coordinateur Régional',
    niveau: 'REGIONAL',
    couleur: '#2E7D32',
    icone: 'map'
  },
  COORDINATEUR_PREFECTORAL: {
    libelle: 'Coordinateur Préfectoral',
    niveau: 'PREFECTORAL',
    couleur: '#F57F17',
    icone: 'location_city'
  },
  SUPERVISEUR: {
    libelle: 'Superviseur',
    niveau: 'COMMUNAL',
    couleur: '#E65100',
    icone: 'supervisor_account'
  },
  ODEC: {
    libelle: "Officier Délégué d'État Civil",
    niveau: 'COMMUNAL',
    couleur: '#4E342E',
    icone: 'badge'
  },
  AGENT: {
    libelle: 'Agent',
    niveau: 'COMMUNAL',
    couleur: '#37474F',
    icone: 'person'
  }
};

export const NIVEAU_LABELS: Record<NiveauAdministratif, string> = {
  CENTRAL: 'National (PN-RAVEC)',
  REGIONAL: 'Régional',
  PREFECTORAL: 'Préfectoral',
  COMMUNAL: 'Communal'
};
