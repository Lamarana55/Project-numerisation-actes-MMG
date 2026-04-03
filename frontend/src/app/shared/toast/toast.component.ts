import { Component } from '@angular/core';
import { ToastService, Toast, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {

  readonly toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: 'check_circle',
      error:   'error',
      warning: 'warning',
      info:    'info'
    };
    return icons[type];
  }

  trackById(_: number, toast: Toast): string {
    return toast.id;
  }
}
