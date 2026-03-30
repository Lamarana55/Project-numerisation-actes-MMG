import { Role } from "./role";

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
  // Backend (UserDTO) retourne roleName (String)
  roleName?: string;
  // Utilisé uniquement pour l'envoi (création / mise à jour)
  role?: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
