import { Role } from './role';

export type NiveauAdministratif = 'CENTRAL' | 'REGIONAL' | 'PREFECTORAL' | 'COMMUNAL';

export interface User {
  id?: string;
  username: string;
  email: string;
  nom: string;
  prenom: string;
  fonction?: string;
  telephone?: string;
  code?: string;
  statut?: 'Activated' | 'Desactivated';
  isDelete?: 'Yes' | 'No';
  createdAt?: Date;
  updatedAt?: Date;

  // ── Profil métier (retourné par le backend via UserDTO) ──────────────────
  /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR) */
  roleName?: string;
  /** Libellé affiché (ex: Super-Administrateur) */
  roleLibelle?: string;
  /** Niveau administratif du profil */
  niveauAdministratif?: NiveauAdministratif;

  // ── Affectation territoriale ─────────────────────────────────────────────
  regionId?: string;
  regionNom?: string;
  prefectureId?: string;
  prefectureNom?: string;
  communeId?: string;
  communeNom?: string;

  // ── Champs utilisés uniquement pour l'envoi (création / mise à jour) ────
  role?: Role;
}
