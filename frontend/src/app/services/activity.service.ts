import { Injectable } from '@angular/core';

export type ActivityType =
  | 'login'
  | 'logout'
  | 'update_profile'
  | 'change_password'
  | 'update_preferences';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string; // ISO string — sérialisable en localStorage
}

const STORAGE_KEY = 'ravec_activity_log';
const MAX_ACTIVITIES = 50;

@Injectable({ providedIn: 'root' })
export class ActivityService {

  private key(username: string): string {
    return `${STORAGE_KEY}_${username}`;
  }

  /** Retourne les activités d'un utilisateur (plus récentes en premier) */
  getActivities(username: string): Activity[] {
    try {
      const raw = localStorage.getItem(this.key(username));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /** Ajoute une activité en tête de liste */
  add(username: string, type: ActivityType, title: string, description: string): void {
    const list = this.getActivities(username);
    const entry: Activity = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    };
    list.unshift(entry);
    try {
      localStorage.setItem(this.key(username), JSON.stringify(list.slice(0, MAX_ACTIVITIES)));
    } catch { /* localStorage plein */ }
  }

  /** Efface l'historique d'un utilisateur */
  clear(username: string): void {
    localStorage.removeItem(this.key(username));
  }
}
