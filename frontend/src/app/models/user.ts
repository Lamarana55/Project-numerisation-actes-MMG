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
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}
