import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';
import { LocalitesService } from './localites.service';
import { HierarchyLevel } from './localites.models';

@Component({
  selector: 'app-localites',
  templateUrl: './localites.component.html',
  styleUrls: ['./localites.component.css']
})
export class LocalitesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  /* ── État global ──────────────────────── */
  activeTab: 'admin' | 'monde' = 'admin';
  loading = false;
  error: string | null = null;

  /* ── Données ──────────────────────────── */
  adminHierarchy: HierarchyLevel[] = [];
  worldHierarchy: HierarchyLevel[] = [];

  /* ── Filtres & recherche ──────────────── */
  searchQuery  = '';
  filterType   = '';           // '' | 'region' | 'prefecture' | 'commune' | 'quartier' | 'pays' | 'ville'
  filteredHierarchy: HierarchyLevel[] = [];

  /* ── Sélection & formulaire ───────────── */
  selectedNode: HierarchyLevel | null = null;
  editMode    = false;
  createMode  = false;
  editForm: FormGroup;
  expandedNodes = new Set<string>();
  formErrors: any[] = [];

  /* ── Config types ─────────────────────── */
  readonly typeConfig: { [k: string]: { label: string; icon: string; color: string } } = {
    region:     { label: 'Région',     icon: 'public',        color: '#00853F' },
    prefecture: { label: 'Préfecture', icon: 'location_city', color: '#0284c7' },
    commune:    { label: 'Commune',    icon: 'apartment',     color: '#d97706' },
    quartier:   { label: 'Quartier',   icon: 'home',          color: '#7c3aed' },
    pays:       { label: 'Pays',       icon: 'language',      color: '#00853F' },
    ville:      { label: 'Ville',      icon: 'location_city', color: '#0284c7' }
  };

  private readonly childTypeMap: { [k: string]: string } = {
    region: 'prefecture', prefecture: 'commune', commune: 'quartier', pays: 'ville'
  };

  constructor(
    private service: LocalitesService,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.editForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(2)]],
      nom:  ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void { this.loadData(); }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  /* ══ STATS (pour l'en-tête) ═══════════ */

  private countNodes(nodes: HierarchyLevel[], type: string): number {
    let count = 0;
    for (const n of nodes) {
      if (n.type === type) count++;
      if (n.children) count += this.countNodes(n.children, type);
    }
    return count;
  }

  get totalRegions():     number { return this.adminHierarchy.length; }
  get totalPrefectures(): number { return this.countNodes(this.adminHierarchy, 'prefecture'); }
  get totalCommunes():    number { return this.countNodes(this.adminHierarchy, 'commune'); }
  get totalQuartiers():   number { return this.countNodes(this.adminHierarchy, 'quartier'); }
  get totalPays():        number { return this.worldHierarchy.length; }
  get totalVilles():      number { return this.countNodes(this.worldHierarchy, 'ville'); }

  get totalAdminCount(): number {
    return this.totalRegions + this.totalPrefectures + this.totalCommunes + this.totalQuartiers;
  }
  get totalWorldCount(): number { return this.totalPays + this.totalVilles; }
  get totalCount(): number {
    return this.activeTab === 'admin' ? this.totalAdminCount : this.totalWorldCount;
  }

  /* ── Filtres admins disponibles selon l'onglet ── */
  get availableTypeFilters(): { value: string; label: string; color: string; count: number }[] {
    if (this.activeTab === 'admin') {
      return [
        { value: 'region',     label: 'Régions',     color: '#00853F', count: this.totalRegions },
        { value: 'prefecture', label: 'Préfectures', color: '#0284c7', count: this.totalPrefectures },
        { value: 'commune',    label: 'Communes',    color: '#d97706', count: this.totalCommunes },
        { value: 'quartier',   label: 'Quartiers',   color: '#7c3aed', count: this.totalQuartiers }
      ];
    }
    return [
      { value: 'pays',  label: 'Pays',   color: '#00853F', count: this.totalPays },
      { value: 'ville', label: 'Villes', color: '#0284c7', count: this.totalVilles }
    ];
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery.trim() || !!this.filterType;
  }

  get filteredCount(): number { return this.countNodes(this.filteredHierarchy, ''); }

  /* ══ CHARGEMENT ════════════════════════ */

  loadData(): void {
    this.loading = true;
    this.error = null;
    this.service.loadAdminHierarchy()
      .pipe(finalize(() => this.loading = false), takeUntil(this.destroy$))
      .subscribe({
        next: h => { this.adminHierarchy = h; this.applyFilter(); },
        error: () => { this.error = 'Erreur lors du chargement des localités'; }
      });
  }

  private loadWorldData(): void {
    this.loading = true;
    this.error = null;
    this.service.loadWorldHierarchy()
      .pipe(finalize(() => this.loading = false), takeUntil(this.destroy$))
      .subscribe({
        next: h => { this.worldHierarchy = h; this.applyFilter(); },
        error: () => { this.error = 'Erreur lors du chargement des pays et villes'; }
      });
  }

  /* ══ NAVIGATION ONGLETS ════════════════ */

  switchTab(tab: 'admin' | 'monde'): void {
    this.activeTab = tab;
    this.selectedNode = null;
    this.closeEdit();
    this.clearFilters();
    if (tab === 'monde' && this.worldHierarchy.length === 0) this.loadWorldData();
  }

  /* ══ FILTRES & RECHERCHE ═══════════════ */

  onSearch(): void { this.applyFilter(); }

  clearSearch(): void { this.searchQuery = ''; this.applyFilter(); }

  setTypeFilter(type: string): void {
    this.filterType = this.filterType === type ? '' : type;
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterType  = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const base = this.activeTab === 'admin' ? this.adminHierarchy : this.worldHierarchy;
    const q = this.searchQuery.toLowerCase().trim();
    const t = this.filterType;

    if (!q && !t) {
      this.filteredHierarchy = base;
      return;
    }
    this.filteredHierarchy = this.filterNodes(base, q, t);
  }

  private filterNodes(nodes: HierarchyLevel[], q: string, t: string): HierarchyLevel[] {
    const result: HierarchyLevel[] = [];
    for (const node of nodes) {
      const matchText = !q ||
        node.data.nom?.toLowerCase().includes(q) ||
        node.data.code?.toLowerCase().includes(q);
      const matchType = !t || node.type === t;
      const filteredChildren = node.children ? this.filterNodes(node.children, q, t) : [];
      const selfMatch = matchText && matchType;

      if (selfMatch || filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children });
        if (filteredChildren.length > 0) this.expandedNodes.add(node.data.id);
      }
    }
    return result;
  }

  /* ══ SÉLECTION & TOGGLE ════════════════ */

  selectNode(node: HierarchyLevel): void {
    this.selectedNode = node;
    this.editMode = false;
    this.createMode = false;
    this.editForm.reset();
    this.formErrors = [];
  }

  toggleNode(nodeId: string): void {
    if (this.expandedNodes.has(nodeId)) this.expandedNodes.delete(nodeId);
    else this.expandedNodes.add(nodeId);
    this.expandedNodes = new Set(this.expandedNodes);
  }

  /* ══ FORMULAIRES ═══════════════════════ */

  openCreate(parentNode?: HierarchyLevel): void {
    if (!parentNode) return;
    const allowed = ['prefecture', 'commune', 'pays'];
    if (!allowed.includes(parentNode.type)) return;
    this.selectedNode = parentNode;
    this.editMode = false;
    this.createMode = true;
    this.editForm.reset();
    this.formErrors = [];
  }

  openCreateCommune(): void {
    if (this.selectedNode?.type === 'prefecture') {
      this.openCreate(this.selectedNode);
    } else {
      this.toast.info('Sélectionnez une préfecture dans l\'arborescence pour créer une commune.');
    }
  }

  openCreateVille(): void {
    if (this.selectedNode?.type === 'pays') {
      this.openCreate(this.selectedNode);
    } else {
      this.toast.info('Sélectionnez un pays dans l\'arborescence pour créer une ville.');
    }
  }

  openEdit(node: HierarchyLevel): void {
    this.selectedNode = node;
    this.editMode = true;
    this.createMode = false;
    this.formErrors = [];
    this.editForm.patchValue({ code: node.data.code, nom: node.data.nom });
  }

  closeEdit(): void {
    this.editMode = false;
    this.createMode = false;
    this.editForm.reset();
    this.formErrors = [];
  }

  /* ══ SUPPRESSION ═══════════════════════ */

  deleteNode(node: HierarchyLevel): void {
    const label = this.formatLabel(node.type);
    if (!confirm(`Supprimer « ${node.data.nom} » (${label}) ?\nCette action est irréversible.`)) return;
    this.loading = true;
    const op = this.getDeleteOp(node);
    if (!op) { this.loading = false; return; }
    op.pipe(finalize(() => this.loading = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`${label} supprimé(e) avec succès`);
          if (this.selectedNode?.data.id === node.data.id) this.selectedNode = null;
          this.loadData();
        },
        error: () => this.toast.error('Erreur lors de la suppression')
      });
  }

  /* ══ SAUVEGARDE ════════════════════════ */

  saveNode(): void {
    if (!this.editForm.valid) { this.editForm.markAllAsTouched(); return; }
    this.formErrors = [];
    const data = this.editForm.value;
    if (this.editMode && this.selectedNode) this.performUpdate(data);
    else if (this.createMode) this.performCreate(data);
  }

  private performUpdate(data: any): void {
    const { type, data: nd } = this.selectedNode!;
    const payload = { ...data };
    switch (type) {
      case 'prefecture': payload.regionCode    = nd.codeRegion;     break;
      case 'commune':    payload.prefectureCode = nd.codePrefecture; break;
      case 'quartier':   payload.communeCode    = nd.codeCommune;    break;
      case 'ville':      payload.paysCode       = nd.codePays;       break;
    }
    const op = this.getUpdateOp(type, nd.id, payload);
    if (!op) return;
    this.loading = true;
    op.pipe(finalize(() => this.loading = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`${this.formatLabel(type)} modifié(e) avec succès`);
          this.closeEdit(); this.loadData();
        },
        error: () => this.toast.error('Erreur lors de la modification')
      });
  }

  private performCreate(data: any): void {
    const parent = this.selectedNode;
    if (!parent) return; // root-level creation (region/pays) not allowed
    const createType = this.childTypeMap[parent.type] || '';
    if (!createType) return;
    const payload = { ...data };
    if (parent) {
      switch (createType) {
        case 'prefecture': payload.regionCode    = parent.data.code; break;
        case 'commune':    payload.prefectureCode = parent.data.code; break;
        case 'quartier':   payload.communeCode   = parent.data.code; break;
        case 'ville':      payload.paysCode      = parent.data.code; break;
      }
    }
    const op = this.getCreateOp(createType, payload);
    if (!op) return;
    this.loading = true;
    op.pipe(finalize(() => this.loading = false), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast.success(`${this.formatLabel(createType)} créé(e) avec succès`);
          this.closeEdit(); this.loadData();
        },
        error: () => this.toast.error('Erreur lors de la création')
      });
  }

  /* ══ HELPERS ═══════════════════════════ */

  formatLabel(type: string): string { return this.typeConfig[type]?.label ?? type; }
  getIcon(type: string): string     { return this.typeConfig[type]?.icon  ?? 'location_on'; }
  getColor(type: string): string    { return this.typeConfig[type]?.color ?? '#6b7280'; }

  getCreateTypeLabel(): string {
    if (!this.selectedNode) return 'une Localité';
    const child = this.childTypeMap[this.selectedNode.type];
    if (!child) return 'une Localité';
    const label = this.formatLabel(child);
    return `une ${label}`;
  }

  getChildTypeLabel(parentType: string): string {
    const child = this.childTypeMap[parentType];
    return child ? this.formatLabel(child) : '';
  }

  trackById(_: number, node: HierarchyLevel): string { return node.data.id ?? node.data.code; }

  get formValid(): boolean { return this.editForm?.valid ?? false; }
  get showForm(): boolean  { return this.editMode || this.createMode; }

  /* ── Opérations CRUD ─── */
  private getDeleteOp(node: HierarchyLevel): Observable<any> | null {
    switch (node.type) {
      case 'region':     return this.service.deleteRegion(node.data.id);
      case 'prefecture': return this.service.deletePrefecture(node.data.id);
      case 'commune':    return this.service.deleteCommune(node.data.id);
      case 'quartier':   return this.service.deleteQuartier(node.data.id);
      case 'pays':       return this.service.deletePays(node.data.id);
      case 'ville':      return this.service.deleteVille(node.data.id);
      default: return null;
    }
  }
  private getUpdateOp(type: string, id: string, data: any): Observable<any> | null {
    switch (type) {
      case 'region':     return this.service.updateRegion(id, data);
      case 'prefecture': return this.service.updatePrefecture(id, data);
      case 'commune':    return this.service.updateCommune(id, data);
      case 'quartier':   return this.service.updateQuartier(id, data);
      case 'pays':       return this.service.updatePays(id, data);
      case 'ville':      return this.service.updateVille(id, data);
      default: return null;
    }
  }
  private getCreateOp(type: string, data: any): Observable<any> | null {
    switch (type) {
      case 'region':     return this.service.createRegion(data);
      case 'prefecture': return this.service.createPrefecture(data);
      case 'commune':    return this.service.createCommune(data);
      case 'quartier':   return this.service.createQuartier(data);
      case 'pays':       return this.service.createPays(data);
      case 'ville':      return this.service.createVille(data);
      default: return null;
    }
  }
}
