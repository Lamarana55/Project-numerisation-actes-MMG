import { Injectable } from '@angular/core';

export interface UserPreferences {
  language: string;
  timezone: string;
  darkMode: boolean;
  emailNotifications: boolean;
  browserNotifications: boolean;
  soundNotifications: boolean;
}

const STORAGE_KEY = 'ravec_preferences';

const DEFAULTS: UserPreferences = {
  language: 'fr',
  timezone: 'Africa/Conakry',
  darkMode: false,
  emailNotifications: true,
  browserNotifications: false,
  soundNotifications: false
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {

  private key(username: string): string {
    return `${STORAGE_KEY}_${username}`;
  }

  /** Charge les préférences (avec fusion des valeurs par défaut) */
  get(username: string): UserPreferences {
    try {
      const raw = localStorage.getItem(this.key(username));
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  /** Persiste les préférences */
  save(username: string, prefs: UserPreferences): void {
    try {
      localStorage.setItem(this.key(username), JSON.stringify(prefs));
    } catch { /* localStorage plein */ }
  }
}
