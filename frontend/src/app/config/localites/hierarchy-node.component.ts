import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HierarchyLevel } from './localites.models';

@Component({
  selector: 'app-hierarchy-node',
  template: `
    <div class="hierarchy-node" [class.expanded]="node.expanded">
      <!-- Nœud Lui-même -->
      <div class="node-item" [class.selected]="isSelected">
        <!-- Bouton Expand/Collapse -->
        <button 
          *ngIf="node.children && node.children.length > 0"
          class="toggle-btn"
          (click)="onToggle()">
          <mat-icon>{{ node.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
        </button>
        <div *ngIf="!node.children || node.children.length === 0" class="toggle-placeholder"></div>

        <!-- Icône et Label -->
        <div class="node-info" (click)="onSelect()">
          <div class="node-icon" [style.background]="node.color">
            <mat-icon>{{ node.icon }}</mat-icon>
          </div>
          <div class="node-text">
            <span class="node-label">{{ node.data.nom }}</span>
            <span class="node-code">{{ node.data.code }}</span>
          </div>
        </div>

        <!-- Actions Rapides -->
        <div class="node-actions">
          <button 
            mat-icon-button 
            matTooltip="Ajouter un sous-élément"
            (click)="onCreateChild()">
            <mat-icon>add</mat-icon>
          </button>
          <button 
            mat-icon-button 
            matTooltip="Modifier"
            (click)="onEdit()">
            <mat-icon>edit</mat-icon>
          </button>
          <button 
            mat-icon-button 
            matTooltip="Supprimer"
            (click)="onDelete()">
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>
      </div>

      <!-- Enfants -->
      <div class="node-children" *ngIf="node.expanded && node.children && node.children.length > 0">
        <app-hierarchy-node
          *ngFor="let child of node.children"
          [node]="child"
          [isSelected]="false"
          [expandedNodes]="expandedNodes"
          (select)="onChildSelect($event)"
          (toggleNode)="onChildToggle($event)"
          (createChild)="onCreateChild()"
          (editNode)="onEdit()"
          (deleteNode)="onDelete()">
        </app-hierarchy-node>
      </div>
    </div>
  `,
  styles: [`
    .hierarchy-node {
      margin-bottom: 2px;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .node-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-left: 4px solid transparent;
      position: relative;
      overflow: hidden;
    }

    .node-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .node-item:hover {
      background: rgba(0, 133, 63, 0.08);
      transform: translateX(4px);
      box-shadow: 0 4px 12px rgba(0, 133, 63, 0.15);
    }

    .node-item:hover::before {
      opacity: 1;
    }

    .node-item.selected {
      background: linear-gradient(135deg, rgba(0, 133, 63, 0.15) 0%, rgba(0, 133, 63, 0.08) 100%);
      border-left-color: #00853F;
      font-weight: 600;
      box-shadow: 0 6px 20px rgba(0, 133, 63, 0.2);
      transform: translateX(6px);
    }

    .node-item.selected::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 60%;
      background: #00853F;
      border-radius: 2px 0 0 2px;
    }

    .toggle-btn {
      width: 32px;
      height: 32px;
      padding: 0;
      min-width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #64748b;
    }

    .toggle-btn:hover {
      background: #00853F;
      color: white;
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(0, 133, 63, 0.3);
    }

    .toggle-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      transition: transform 0.3s ease;
    }

    .toggle-placeholder {
      width: 32px;
      height: 32px;
    }

    .node-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }

    .node-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: white;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
    }

    .node-icon:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .node-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .node-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }

    .node-label {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s ease;
    }

    .node-item.selected .node-label {
      color: #00853F;
    }

    .node-code {
      font-size: 0.8rem;
      color: #64748b;
      font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      font-weight: 500;
      letter-spacing: 0.025em;
    }

    .node-actions {
      display: none;
      gap: 6px;
      flex-shrink: 0;
      opacity: 0;
      transform: translateX(10px);
      transition: all 0.3s ease;
    }

    .node-item:hover .node-actions {
      display: flex;
      opacity: 1;
      transform: translateX(0);
    }

    .node-actions button {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      transition: all 0.2s ease;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
      color: #64748b;
    }

    .node-actions button:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .node-actions button:nth-child(1):hover {
      background: #10b981;
      color: white;
    }

    .node-actions button:nth-child(2):hover {
      background: #3b82f6;
      color: white;
    }

    .node-actions button:nth-child(3):hover {
      background: #ef4444;
      color: white;
    }

    .node-children {
      padding-left: 20px;
      border-left: 2px solid #e2e8f0;
      margin-left: 16px;
      margin-top: 8px;
      position: relative;
    }

    .node-children::before {
      content: '';
      position: absolute;
      left: -2px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #e2e8f0 0%, rgba(226, 232, 240, 0.3) 100%);
    }

    /* Animation d'expansion */
    .node-children {
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        max-height: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        max-height: 1000px;
        transform: translateY(0);
      }
    }

    /* États responsives */
    @media (max-width: 768px) {
      .node-item {
        padding: 10px 12px;
        gap: 8px;
      }

      .node-icon {
        width: 32px;
        height: 32px;
      }

      .node-label {
        font-size: 0.9rem;
      }

      .node-code {
        font-size: 0.75rem;
      }

      .node-actions {
        gap: 4px;
      }

      .node-actions button {
        width: 28px;
        height: 28px;
      }
    }
  `]
})
export class HierarchyNodeComponent {
  @Input() node!: HierarchyLevel;
  @Input() isSelected = false;
  @Input() expandedNodes: Set<string> = new Set();

  @Output() select = new EventEmitter<HierarchyLevel>();
  @Output() toggleNode = new EventEmitter<string>();
  @Output() createChild = new EventEmitter<HierarchyLevel>();
  @Output() editNode = new EventEmitter<HierarchyLevel>();
  @Output() deleteNode = new EventEmitter<HierarchyLevel>();

  onToggle(): void {
    this.toggleNode.emit(this.node.data.id!);
  }

  onSelect(): void {
    this.select.emit(this.node);
  }

  onCreateChild(): void {
    this.createChild.emit(this.node);
  }

  onEdit($event?: any): void {
    $event?.stopPropagation();
    this.editNode.emit(this.node);
  }

  onDelete($event?: any): void {
    $event?.stopPropagation();
    this.deleteNode.emit(this.node);
  }

  onChildSelect(node: HierarchyLevel): void {
    this.select.emit(node);
  }

  onChildToggle(nodeId: string): void {
    this.toggleNode.emit(nodeId);
  }
}
