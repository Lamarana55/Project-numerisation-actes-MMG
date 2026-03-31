import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize, debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalitesService } from './localites.service';
import { HierarchyLevel } from './localites.models';

@Component({
  selector: 'app-localites',
  templateUrl: './localites.component.html',
  styleUrls: ['./localites.component.css']
})
export class LocalitesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Estado
  activeTab: 'admin' | 'monde' = 'admin';
  loading = false;
  error: string | null = null;

  // Hierarquias
  adminHierarchy: HierarchyLevel[] = [];
  worldHierarchy: HierarchyLevel[] = [];

  // Recherche / filtre
  searchControl = new FormControl('');
  searchTerm = '';
  displayedHierarchy: HierarchyLevel[] = [];

  // Edición y selección
  selectedNode: HierarchyLevel | null = null;
  editMode = false;
  editForm: FormGroup;
  expandedNodes = new Set<string>();
  formErrors: any[] = [];

  // Config iconos y colores
  typeConfig: { [key: string]: any } = {
    region: { label: 'Región', icon: 'public', color: '#00853F' },
    prefecture: { label: 'Prefectura', icon: 'location_city', color: '#0084d0' },
    commune: { label: 'Comuna', icon: 'apartment', color: '#b45309' },
    quartier: { label: 'Barrio', icon: 'home', color: '#7c3aed' },
    pays: { label: 'País', icon: 'language', color: '#00853F' },
    ville: { label: 'Ciudad', icon: 'location_city', color: '#0084d0' }
  };

  constructor(
    private service: LocalitesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.editForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(val => {
        this.searchTerm = val || '';
        this.applySearch();
      });
  }

  applySearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const hierarchy = this.activeTab === 'admin' ? this.adminHierarchy : this.worldHierarchy;
    this.displayedHierarchy = term ? this.filterHierarchy(hierarchy, term) : hierarchy;
  }

  private filterHierarchy(nodes: HierarchyLevel[], term: string): HierarchyLevel[] {
    const result: HierarchyLevel[] = [];
    for (const node of nodes) {
      const nodeMatches =
        node.data.nom?.toLowerCase().includes(term) ||
        node.data.code?.toLowerCase().includes(term);
      const filteredChildren = node.children
        ? this.filterHierarchy(node.children, term)
        : [];
      if (nodeMatches) {
        result.push({ ...node, expanded: true });
      } else if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren, expanded: true });
      }
    }
    return result;
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchTerm = '';
    this.applySearch();
  }

  get hasSearch(): boolean {
    return !!this.searchTerm;
  }

  loadData(): void {
    this.loading = true;
    this.service.loadAdminHierarchy()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (hierarchy) => {
          this.adminHierarchy = hierarchy;
          this.applySearch();
        },
        error: (err: any) => {
          this.error = 'Error cargando localidades';
          this.snackBar.open(this.error, 'Cerrar', { duration: 5000 });
        }
      });
  }

  switchTab(tab: 'admin' | 'monde'): void {
    this.activeTab = tab;
    this.selectedNode = null;
    this.closeEdit();
    this.applySearch();

    if (tab === 'monde' && this.worldHierarchy.length === 0) {
      this.loadWorldData();
    }
  }

  private loadWorldData(): void {
    this.loading = true;
    this.service.loadWorldHierarchy()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (hierarchy) => {
          this.worldHierarchy = hierarchy;
          this.applySearch();
        },
        error: (err: any) => {
          this.error = 'Error cargando países';
          this.snackBar.open(this.error, 'Cerrar', { duration: 5000 });
        }
      });
  }

  selectNode(node: HierarchyLevel): void {
    this.selectedNode = node;
    this.closeEdit();
  }

  toggleNode(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) {
      this.expandedNodes.delete(nodeId);
    } else {
      this.expandedNodes.add(nodeId);
    }
  }

  openCreate(parentNode?: HierarchyLevel): void {
    this.selectedNode = parentNode || null;
    this.editMode = false;
    this.editForm.reset();
  }

  openEdit(node: HierarchyLevel): void {
    this.selectedNode = node;
    this.editMode = true;
    this.editForm.patchValue({
      code: node.data.code,
      nom: node.data.nom
    });
  }

  closeEdit(): void {
    this.editMode = false;
    this.editForm.reset();
  }

  deleteNode(node: HierarchyLevel): void {
    const confirmed = confirm(`Deseja excluir "${node.data.nom}"? Esta ação não pode ser desfeita.`);
    if (!confirmed) return;

    this.loading = true;
    const id = node.data.id;
    const type = node.type;

    let deleteOperation: Observable<any>;
    switch (type) {
      case 'region':
        deleteOperation = this.service.deleteRegion(id);
        break;
      case 'prefecture':
        deleteOperation = this.service.deletePrefecture(id);
        break;
      case 'commune':
        deleteOperation = this.service.deleteCommune(id);
        break;
      case 'quartier':
        deleteOperation = this.service.deleteQuartier(id);
        break;
      case 'pays':
        deleteOperation = this.service.deletePays(id);
        break;
      case 'ville':
        deleteOperation = this.service.deleteVille(id);
        break;
      default:
        this.loading = false;
        return;
    }

    deleteOperation
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.snackBar.open(`${type} excluído com sucesso`, 'OK', { duration: 3000 });
          this.selectedNode = null;
          this.loadData();
        },
        error: () => {
          this.snackBar.open(`Erro ao excluir ${type}`, 'OK', { duration: 3000 });
        }
      });
  }

  saveNode(): void {
    if (!this.editForm.valid) {
      this.formErrors = [{ field: 'form', message: 'Formulário inválido' }];
      return;
    }

    const formData = this.editForm.value;
    if (this.editMode && this.selectedNode) {
      // Update operation
      const id = this.selectedNode.data.id;
      const type = this.selectedNode.type;
      let updateOperation: Observable<any>;

      switch (type) {
        case 'region':
          updateOperation = this.service.updateRegion(id, formData);
          break;
        case 'prefecture':
          updateOperation = this.service.updatePrefecture(id, formData);
          break;
        case 'commune':
          updateOperation = this.service.updateCommune(id, formData);
          break;
        case 'quartier':
          updateOperation = this.service.updateQuartier(id, formData);
          break;
        case 'pays':
          updateOperation = this.service.updatePays(id, formData);
          break;
        case 'ville':
          updateOperation = this.service.updateVille(id, formData);
          break;
        default:
          return;
      }

      this.loading = true;
      updateOperation
        .pipe(
          finalize(() => this.loading = false),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.snackBar.open(`${type} atualizado com sucesso`, 'OK', { duration: 3000 });
            this.closeEdit();
            this.loadData();
          },
          error: () => {
            this.snackBar.open(`Erro ao atualizar ${type}`, 'OK', { duration: 3000 });
          }
        });
    }
  }

  formatLabel(type: string): string {
    return this.getTypeLabel(type);
  }

  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  getHierarchyForTab(): HierarchyLevel[] {
    return this.displayedHierarchy;
  }

  getTypeLabel(type: string): string {
    return this.typeConfig[type]?.label || type;
  }

  getTypeIcon(type: string): string {
    return this.typeConfig[type]?.icon || 'location_on';
  }

  getTypeColor(type: string): string {
    return this.typeConfig[type]?.color || '#666';
  }

  getIcon(type: string): string {
    return this.getTypeIcon(type);
  }

  getColor(type: string): string {
    return this.getTypeColor(type);
  }

  getLabel(type: string): string {
    return this.getTypeLabel(type);
  }

  get formValid(): boolean {
    return this.editForm && this.editForm.valid;
  }
}
