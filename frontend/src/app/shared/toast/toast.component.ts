// frontend/src/app/shared/toast/toast.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarRef,
} from '@angular/material/snack-bar';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-content">
      <div class="toast-icon-wrapper">
        <mat-icon class="toast-icon">{{ data.icon }}</mat-icon>
      </div>
      <span class="toast-message">{{ data.message }}</span>
      <button mat-icon-button class="toast-close" (click)="close()">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .toast-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 2px 4px;
        min-width: 320px;
        max-width: 400px;
      }

      .toast-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .toast-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #ffffff;
      }

      .toast-message {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        line-height: 1.4;
        letter-spacing: 0.2px;
      }

      .toast-close {
        flex-shrink: 0;
        color: rgba(255, 255, 255, 0.8) !important;
        width: 30px;
        height: 30px;
        line-height: 30px;
      }

      .toast-close mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: rgba(255, 255, 255, 0.8);
      }

      .toast-close:hover {
        color: #ffffff !important;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 50%;
      }
    `,
  ],
})
export class ToastComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA)
    public data: { message: string; icon: string; type: string },
    private snackBarRef: MatSnackBarRef<ToastComponent>,
  ) {}

  close(): void {
    this.snackBarRef.dismiss();
  }
}
