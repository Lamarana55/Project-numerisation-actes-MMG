import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HierarchyLevel } from './localites.models';

@Component({
  selector: 'app-hierarchy-node',
  template: `
    <div class="tree-node">
      <!-- Ligne principale du nœud -->
      <div
        class="node-row"
        [class.is-selected]="isSelected"
        [attr.data-type]="node.type"
        (click)="onSelect()">

        <!-- Bouton toggle expand/collapse -->
        <button
          class="toggle-btn"
          *ngIf="node.children && node.children.length > 0"
          (click)="$event.stopPropagation(); onToggle()">
          <mat-icon>{{ expandedNodes.has(node.data.id) ? 'expand_more' : 'chevron_right' }}</mat-icon>
        </button>
        <span
          class="toggle-leaf"
          *ngIf="!node.children || node.children.length === 0">
        </span>

        <!-- Icône type -->
        <span class="node-dot" [style.background]="node.color"></span>

        <!-- Texte -->
        <span class="node-name">{{ node.data.nom }}</span>
        <span class="node-code-badge">{{ node.data.code }}</span>

        <!-- Actions rapides -->
        <div class="node-actions" (click)="$event.stopPropagation()">
          <button
            *ngIf="node.type === 'prefecture' || node.type === 'commune' || node.type === 'pays'"
            class="action-btn action-add"
            matTooltip="Ajouter un sous-élément"
            (click)="onCreateChild()">
            <mat-icon>add</mat-icon>
          </button>
          <button
            class="action-btn action-edit"
            matTooltip="Modifier"
            (click)="onEdit()">
            <mat-icon>edit</mat-icon>
          </button>
          <button
            class="action-btn action-delete"
            matTooltip="Supprimer"
            (click)="onDelete()">
            <mat-icon>delete_outline</mat-icon>
          </button>
        </div>
      </div>

      <!-- Enfants (récursif) — utilise expandedNodes.has() qui est la vraie source de vérité -->
      <div
        class="node-children"
        *ngIf="expandedNodes.has(node.data.id) && node.children && node.children.length > 0">
        <app-hierarchy-node
          *ngFor="let child of node.children; trackBy: trackById"
          [node]="child"
          [isSelected]="selectedNodeId === child.data.id"
          [selectedNodeId]="selectedNodeId"
          [expandedNodes]="expandedNodes"
          (select)="select.emit($event)"
          (toggleNode)="toggleNode.emit($event)"
          (createChild)="createChild.emit($event)"
          (editNode)="editNode.emit($event)"
          (deleteNode)="deleteNode.emit($event)">
        </app-hierarchy-node>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Nœud ─────────────────────────────── */
    .tree-node { position: relative; }

    .node-row {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 10px 7px 6px;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      transition: background 0.15s ease;
      position: relative;
    }

    .node-row:hover { background: rgba(0,0,0,.04); }

    .node-row.is-selected {
      background: rgba(0, 133, 63, .1);
    }

    .node-row.is-selected .node-name {
      color: #00853F;
      font-weight: 700;
    }

    /* ── Toggle ────────────────────────────── */
    .toggle-btn {
      width: 22px; height: 22px; min-width: 22px;
      padding: 0; border: none; background: transparent;
      color: #9ca3af; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      border-radius: 4px; flex-shrink: 0;
      transition: color .15s, background .15s;
    }
    .toggle-btn:hover { color: #374151; background: rgba(0,0,0,.06); }
    .toggle-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .toggle-leaf {
      width: 22px; height: 22px; flex-shrink: 0;
    }

    /* ── Dot couleur type ─────────────────── */
    .node-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* ── Texte ─────────────────────────────── */
    .node-name {
      flex: 1;
      font-size: .875rem;
      font-weight: 500;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      transition: color .15s;
    }

    .node-code-badge {
      font-size: .7rem;
      font-weight: 600;
      color: #9ca3af;
      font-family: 'SF Mono', 'Roboto Mono', monospace;
      letter-spacing: .02em;
      flex-shrink: 0;
      padding: 1px 5px;
      background: #f3f4f6;
      border-radius: 4px;
    }

    /* ── Actions (apparaissent au hover) ───── */
    .node-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
      opacity: 0;
      visibility: hidden;
      transition: opacity .15s, visibility .15s;
    }
    .node-row:hover .node-actions {
      opacity: 1;
      visibility: visible;
    }

    .action-btn {
      width: 24px; height: 24px;
      padding: 0; border: none; background: transparent;
      border-radius: 5px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: #9ca3af;
      transition: background .15s, color .15s;
    }
    .action-btn mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .action-add:hover    { background: #d1fae5; color: #059669; }
    .action-edit:hover   { background: #dbeafe; color: #2563eb; }
    .action-delete:hover { background: #fee2e2; color: #dc2626; }

    /* ── Enfants ────────────────────────────── */
    .node-children {
      margin-left: 16px;
      padding-left: 14px;
      border-left: 1.5px solid #e5e7eb;
      animation: fadeIn .18s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HierarchyNodeComponent {
  @Input() node!: HierarchyLevel;
  @Input() isSelected = false;
  @Input() selectedNodeId: string | null = null;
  @Input() expandedNodes: Set<string> = new Set();

  @Output() select      = new EventEmitter<HierarchyLevel>();
  @Output() toggleNode  = new EventEmitter<string>();
  @Output() createChild = new EventEmitter<HierarchyLevel>();
  @Output() editNode    = new EventEmitter<HierarchyLevel>();
  @Output() deleteNode  = new EventEmitter<HierarchyLevel>();

  onToggle(): void  { this.toggleNode.emit(this.node.data.id!); }
  onSelect(): void  { this.select.emit(this.node); }
  onCreateChild(): void { this.createChild.emit(this.node); }
  onEdit(): void    { this.editNode.emit(this.node); }
  onDelete(): void  { this.deleteNode.emit(this.node); }

  trackById(_: number, node: HierarchyLevel): string {
    return node.data.id ?? node.data.code;
  }
}
