/* ═══════════════════════════════════════════════════════════
   MODÈLES DE DONNÉES - GESTION DES LOCALITÉS
═══════════════════════════════════════════════════════════ */

export interface Localite {
  id?: string;
  code: string;
  nom: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/* ── Hiérarchie Administrative (Guinée) ────────────── */
export interface Region extends Localite {
  prefectures?: Prefecture[];
}

export interface Prefecture extends Localite {
  regionId?: string;
  region?: Region;
  communes?: Commune[];
  regionCode?: string;
}

export interface Commune extends Localite {
  prefectureId?: string;
  prefecture?: Prefecture;
  quartiers?: Quartier[];
  prefectureCode?: string;
}

export interface Quartier extends Localite {
  communeId?: string;
  commune?: Commune;
  communeCode?: string;
}

/* ── Hiérarchie Mondiale (Pays/Ville) ──────────────– */
export interface Pays extends Localite {
  codeRegion?: string;
  codeNumerique?: string;
  villes?: Ville[];
}

export interface Ville extends Localite {
  paysId?: string;
  pays?: Pays;
  codePays?: string;
}

/* ── Modèles d'état ────────────────────────────────– */
export interface HierarchyLevel {
  type: 'region' | 'prefecture' | 'commune' | 'quartier' | 'pays' | 'ville';
  label: string;
  icon: string;
  color: string;
  data: any;
  children?: HierarchyLevel[];
  expanded?: boolean;
  loading?: boolean;
}

export interface LocaliteState {
  activeTab: 'admin' | 'monde';
  regions: Region[];
  prefectures: Prefecture[];
  communes: Commune[];
  quartiers: Quartier[];
  pays: Pays[];
  villes: Ville[];
  expandedNodes: Set<string>;
  selectedNode: HierarchyLevel | null;
  editingNode: HierarchyLevel | null;
  loading: boolean;
  error: string | null;
}

export interface FormData {
  code: string;
  nom: string;
  parentId?: string;
  parentCode?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
