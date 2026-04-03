import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration: number;
}

const DEFAULTS: Record<ToastType, { title: string; duration: number }> = {
  success: { title: 'Succès',      duration: 4000 },
  error:   { title: 'Erreur',      duration: 6000 },
  warning: { title: 'Attention',   duration: 5000 },
  info:    { title: 'Information', duration: 4000 }
};

const MAX_TOASTS = 5;

@Injectable({ providedIn: 'root' })
export class ToastService {

  private _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();

  success(message: string, title?: string): void {
    this.push('success', message, title);
  }

  error(message: string, title?: string): void {
    this.push('error', message, title);
  }

  warning(message: string, title?: string): void {
    this.push('warning', message, title);
  }

  info(message: string, title?: string): void {
    this.push('info', message, title);
  }

  dismiss(id: string): void {
    this._toasts$.next(this._toasts$.getValue().filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts$.next([]);
  }

  private push(type: ToastType, message: string, title?: string): void {
    const def = DEFAULTS[type];
    const toast: Toast = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      title: title ?? def.title,
      message,
      duration: def.duration
    };
    const current = this._toasts$.getValue();
    this._toasts$.next([toast, ...current].slice(0, MAX_TOASTS));
    setTimeout(() => this.dismiss(toast.id), toast.duration);
  }
}
