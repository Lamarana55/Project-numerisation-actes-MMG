import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { GeodataService } from '../services/geodata.service';
import { Profession, ProfessionService } from '../services/profession.service';
import { Nationalite, NationaliteService } from '../services/nationalite.service';
import { ApiService } from '../services/api.service';
import { RegionDTO, PrefectureDTO, CommuneDTO, QuartierDTO, PaysDTO, VilleDTO } from '../models/geodata';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

export interface ActeData {
  // Identification
  numero_acte?: string;
  numero_registre?: string;
  annee_registre?: string;
  feuillet?: string;
  date_etablissement_acte?: string;

  // Zone de collecte
  region_collecte?: string;
  prefecture_collecte?: string;
  commune?: string;
  district?: string;

  // Enfant
  prenoms?: string;
  nom_membre?: string;
  date_de_nais_membre?: string;
  heure_naissance?: string;
  rang_de_naissance?: string | number;
  genre_membre?: string;
  code_profession?: number | string;
  nationalite_du_membre?: string;

  // Lieu de naissance enfant
  pays_de_naissance?: string;
  region_naissance?: string;
  prefecture_naissance?: string;
  commune_de_nais?: string;
  district_de_nais?: string;
  ville_naissance?: string;

  // Père
  prenoms_pere?: string;
  nom_pere?: string;
  date_de_nais_pere?: string;
  nationalite_pere?: string;
  code_profession_pere?: number | string;

  // Lieu de naissance père
  pays_naissance_pere?: string;
  region_naissance_pere?: string;
  prefecture_naissance_pere?: string;
  commune_naissance_pere?: string;
  district_naissance_pere?: string;
  ville_naissance_pere?: string;

  // Mère
  prenoms_mere?: string;
  nom_mere?: string;
  date_de_nais_mere?: string;
  nationalite_mere?: string;
  code_profession_mere?: number | string;
  domicileParent?: string;

  // Lieu de naissance mère
  pays_naissance_mere?: string;
  region_naissance_mere?: string;
  prefecture_naissance_mere?: string;
  commune_naissance_mere?: string;
  district_naissance_mere?: string;
  ville_naissance_mere?: string;

  // Déclarant
  prenom_1_declarant?: string;
  nom_declarant?: string;
  lien_de_prarente_avec_le_declarant?: string;

  // Officier
  prenom_1_officier?: string;
  nom_officier?: string;
  profession_officier?: string;
}

@Component({
  selector: 'app-numerisation-indexation',
  templateUrl: './numerisation-indexation.component.html',
  styleUrls: ['./numerisation-indexation.component.css'],
})
export class NumerisationIndexationComponent implements OnInit {

  // ── État général ──────────────────────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileBase64: string | null = null;
  fileMediaType = 'image/jpeg';

  data: ActeData = {};
  isEditing = false;
  isSaving = false;

  // ── Référentiels géographiques ────────────────────────────────────────────
  allRegions: RegionDTO[] = [];
  allPays: PaysDTO[] = [];

  // Zone de collecte
  prefecturesCollecte: PrefectureDTO[] = [];
  communesCollecte: CommuneDTO[] = [];
  quartiersCollecte: QuartierDTO[] = [];
  isLoadingPrefecturesCollecte = false;
  isLoadingCommunesCollecte = false;
  isLoadingQuartiersCollecte = false;

  // Lieu de naissance
  prefecturesNaissance: PrefectureDTO[] = [];
  communesNaissance: CommuneDTO[] = [];
  quartiersNaissance: QuartierDTO[] = [];
  isLoadingPrefecturesNaissance = false;
  isLoadingCommunesNaissance = false;
  isLoadingQuartiersNaissance = false;

  // Lieu de naissance — villes (pays étranger)
  villesNaissance: VilleDTO[] = [];
  isLoadingVillesNaissance = false;

  // Lieu de naissance père
  prefecturesNaissancePere: PrefectureDTO[] = [];
  communesNaissancePere: CommuneDTO[] = [];
  quartiersNaissancePere: QuartierDTO[] = [];
  villesNaissancePere: VilleDTO[] = [];
  isLoadingPrefecturesNaissancePere = false;
  isLoadingCommunesNaissancePere = false;
  isLoadingQuartiersNaissancePere = false;
  isLoadingVillesNaissancePere = false;

  // Lieu de naissance mère
  prefecturesNaissanceMere: PrefectureDTO[] = [];
  communesNaissanceMere: CommuneDTO[] = [];
  quartiersNaissanceMere: QuartierDTO[] = [];
  villesNaissanceMere: VilleDTO[] = [];
  isLoadingPrefecturesNaissanceMere = false;
  isLoadingCommunesNaissanceMere = false;
  isLoadingQuartiersNaissanceMere = false;
  isLoadingVillesNaissanceMere = false;

  // ── Professions / nationalités ────────────────────────────────────────────
  professions: Profession[] = [];
  nationalites: Nationalite[] = [];

  // ── Liens de parenté (déclarant) ──────────────────────────────────────────
  readonly LIENS_PARENTE = [
    {
      groupe: 'Famille directe',
      liens: ['Père', 'Mère', 'Fils', 'Fille', 'Frère', 'Soeur', 'Grand frère', 'Grande soeur', 'Mari'],
    },
    {
      groupe: 'Grands-parents',
      liens: ['Grand-père paternel', 'Grand-père maternel', 'Grand-mère paternelle', 'Grand-mère maternelle'],
    },
    {
      groupe: 'Oncles & Tantes',
      liens: ['Oncle paternel', 'Oncle maternel', 'Tante paternelle', 'Tante maternelle'],
    },
    {
      groupe: 'Cousins & Petits-enfants',
      liens: ['Cousin', 'Cousine', 'Neveu', 'Nièce', 'Petit-fils', 'Petite-fille'],
    },
    {
      groupe: 'Tuteurs & Substituts',
      liens: ['Parâtre', 'Marâtre', 'Homonyme'],
    },
    {
      groupe: 'Entourage',
      liens: ['Ami du père', 'Amie du père', 'Ami de la mère', 'Amie de la mère', 'Voisin', 'Voisine'],
    },
    {
      groupe: 'Professionnels',
      liens: ['Employeur du père', 'Employeur de la mère', 'Animateur', 'Animatrice'],
    },
    {
      groupe: 'Autre',
      liens: ['Inconnu'],
    },
  ];

  // ── Zoom image ────────────────────────────────────────────────────────────
  zoomLevel = 1;
  maxZoom = 3;
  minZoom = 0.5;
  panX = 0;
  panY = 0;
  isDragging = false;
  lastMouseX = 0;
  lastMouseY = 0;
  rotation = 0;
  Math = Math;

  constructor(
    private toast: ToastService,
    private geodataService: GeodataService,
    private professionService: ProfessionService,
    private nationaliteService: NationaliteService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      regions:      this.geodataService.getAllRegions(),
      pays:         this.geodataService.getAllPays(),
      professions:  this.professionService.getProfessions(),
      nationalites: this.nationaliteService.getNationalites(),
    }).subscribe({
      next: ({ regions, pays, professions, nationalites }) => {
        this.allRegions   = regions;
        this.allPays      = pays;
        this.professions  = professions;
        this.nationalites = nationalites;
      },
      error: () => this.showError('Erreur lors du chargement des référentiels.'),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UPLOAD DU FICHIER
  // ═══════════════════════════════════════════════════════════════════════════

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.showError('Format non supporté. Utilisez JPG, PNG, WEBP ou PDF.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      this.showError('Fichier trop volumineux (max 20 Mo).');
      return;
    }
    this.selectedFile = file;
    this.fileMediaType = file.type;
    this.data = this.getTestData();
    this.isEditing = true; // on passe directement en mode saisie

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.previewUrl = result;
      this.fileBase64 = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ÉDITION — même pattern qu'avec-actes
  // ═══════════════════════════════════════════════════════════════════════════

  startEditing(): void  { this.isEditing = true; }
  cancelEditing(): void { this.isEditing = false; }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Zone de collecte
  // ═══════════════════════════════════════════════════════════════════════════

  onRegionCollecteChange(code: string): void {
    this.data.prefecture_collecte = '';
    this.data.commune = '';
    this.data.district = '';
    this.prefecturesCollecte = [];
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    if (!code) return;
    this.isLoadingPrefecturesCollecte = true;
    this.geodataService.getPrefecturesByRegion(code).subscribe({
      next: d => { this.prefecturesCollecte = d; this.isLoadingPrefecturesCollecte = false; },
      error: () => (this.isLoadingPrefecturesCollecte = false),
    });
  }

  onPrefectureCollecteChange(code: string): void {
    this.data.commune = '';
    this.data.district = '';
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    if (!code) return;
    this.isLoadingCommunesCollecte = true;
    this.geodataService.getCommunesByPrefecture(code).subscribe({
      next: d => { this.communesCollecte = d; this.isLoadingCommunesCollecte = false; },
      error: () => (this.isLoadingCommunesCollecte = false),
    });
  }

  onCommuneCollecteChange(code: string): void {
    this.data.district = '';
    this.quartiersCollecte = [];
    if (!code) return;
    this.isLoadingQuartiersCollecte = true;
    this.geodataService.getQuartiersByCommune(code).subscribe({
      next: d => { this.quartiersCollecte = d; this.isLoadingQuartiersCollecte = false; },
      error: () => (this.isLoadingQuartiersCollecte = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Lieu de naissance
  // ═══════════════════════════════════════════════════════════════════════════

  isGuinee(): boolean {
    return !this.data.pays_de_naissance || this.data.pays_de_naissance === 'GN';
  }

  onPaysNaissanceChange(code: string): void {
    this.data.region_naissance = '';
    this.data.prefecture_naissance = '';
    this.data.commune_de_nais = '';
    this.data.district_de_nais = '';
    this.data.ville_naissance = '';
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    this.villesNaissance = [];
    // Si pays étranger, charger les villes
    if (code && code !== 'GN') {
      this.isLoadingVillesNaissance = true;
      this.geodataService.getVillesByPays(code).subscribe({
        next: d => { this.villesNaissance = d; this.isLoadingVillesNaissance = false; },
        error: () => (this.isLoadingVillesNaissance = false),
      });
    }
  }

  onRegionNaissanceChange(code: string): void {
    this.data.prefecture_naissance = '';
    this.data.commune_de_nais = '';
    this.data.district_de_nais = '';
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    if (!code) return;
    this.isLoadingPrefecturesNaissance = true;
    this.geodataService.getPrefecturesByRegion(code).subscribe({
      next: d => { this.prefecturesNaissance = d; this.isLoadingPrefecturesNaissance = false; },
      error: () => (this.isLoadingPrefecturesNaissance = false),
    });
  }

  onPrefectureNaissanceChange(code: string): void {
    this.data.commune_de_nais = '';
    this.data.district_de_nais = '';
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    if (!code) return;
    this.isLoadingCommunesNaissance = true;
    this.geodataService.getCommunesByPrefecture(code).subscribe({
      next: d => { this.communesNaissance = d; this.isLoadingCommunesNaissance = false; },
      error: () => (this.isLoadingCommunesNaissance = false),
    });
  }

  onCommuneNaissanceChange(code: string): void {
    this.data.district_de_nais = '';
    this.quartiersNaissance = [];
    if (!code) return;
    this.isLoadingQuartiersNaissance = true;
    this.geodataService.getQuartiersByCommune(code).subscribe({
      next: d => { this.quartiersNaissance = d; this.isLoadingQuartiersNaissance = false; },
      error: () => (this.isLoadingQuartiersNaissance = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Lieu de naissance PÈRE
  // ═══════════════════════════════════════════════════════════════════════════

  isGuineePere(): boolean {
    return !this.data.pays_naissance_pere || this.data.pays_naissance_pere === 'GN';
  }

  onPaysNaissancePereChange(code: string): void {
    this.data.region_naissance_pere = '';
    this.data.prefecture_naissance_pere = '';
    this.data.commune_naissance_pere = '';
    this.data.district_naissance_pere = '';
    this.data.ville_naissance_pere = '';
    this.prefecturesNaissancePere = [];
    this.communesNaissancePere = [];
    this.quartiersNaissancePere = [];
    this.villesNaissancePere = [];
    if (code && code !== 'GN') {
      this.isLoadingVillesNaissancePere = true;
      this.geodataService.getVillesByPays(code).subscribe({
        next: d => { this.villesNaissancePere = d; this.isLoadingVillesNaissancePere = false; },
        error: () => (this.isLoadingVillesNaissancePere = false),
      });
    }
  }

  onRegionNaissancePereChange(code: string): void {
    this.data.prefecture_naissance_pere = '';
    this.data.commune_naissance_pere = '';
    this.data.district_naissance_pere = '';
    this.prefecturesNaissancePere = [];
    this.communesNaissancePere = [];
    this.quartiersNaissancePere = [];
    if (!code) return;
    this.isLoadingPrefecturesNaissancePere = true;
    this.geodataService.getPrefecturesByRegion(code).subscribe({
      next: d => { this.prefecturesNaissancePere = d; this.isLoadingPrefecturesNaissancePere = false; },
      error: () => (this.isLoadingPrefecturesNaissancePere = false),
    });
  }

  onPrefectureNaissancePereChange(code: string): void {
    this.data.commune_naissance_pere = '';
    this.data.district_naissance_pere = '';
    this.communesNaissancePere = [];
    this.quartiersNaissancePere = [];
    if (!code) return;
    this.isLoadingCommunesNaissancePere = true;
    this.geodataService.getCommunesByPrefecture(code).subscribe({
      next: d => { this.communesNaissancePere = d; this.isLoadingCommunesNaissancePere = false; },
      error: () => (this.isLoadingCommunesNaissancePere = false),
    });
  }

  onCommuneNaissancePereChange(code: string): void {
    this.data.district_naissance_pere = '';
    this.quartiersNaissancePere = [];
    if (!code) return;
    this.isLoadingQuartiersNaissancePere = true;
    this.geodataService.getQuartiersByCommune(code).subscribe({
      next: d => { this.quartiersNaissancePere = d; this.isLoadingQuartiersNaissancePere = false; },
      error: () => (this.isLoadingQuartiersNaissancePere = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Lieu de naissance MÈRE
  // ═══════════════════════════════════════════════════════════════════════════

  isGuineeMere(): boolean {
    return !this.data.pays_naissance_mere || this.data.pays_naissance_mere === 'GN';
  }

  onPaysNaissanceMereChange(code: string): void {
    this.data.region_naissance_mere = '';
    this.data.prefecture_naissance_mere = '';
    this.data.commune_naissance_mere = '';
    this.data.district_naissance_mere = '';
    this.data.ville_naissance_mere = '';
    this.prefecturesNaissanceMere = [];
    this.communesNaissanceMere = [];
    this.quartiersNaissanceMere = [];
    this.villesNaissanceMere = [];
    if (code && code !== 'GN') {
      this.isLoadingVillesNaissanceMere = true;
      this.geodataService.getVillesByPays(code).subscribe({
        next: d => { this.villesNaissanceMere = d; this.isLoadingVillesNaissanceMere = false; },
        error: () => (this.isLoadingVillesNaissanceMere = false),
      });
    }
  }

  onRegionNaissanceMereChange(code: string): void {
    this.data.prefecture_naissance_mere = '';
    this.data.commune_naissance_mere = '';
    this.data.district_naissance_mere = '';
    this.prefecturesNaissanceMere = [];
    this.communesNaissanceMere = [];
    this.quartiersNaissanceMere = [];
    if (!code) return;
    this.isLoadingPrefecturesNaissanceMere = true;
    this.geodataService.getPrefecturesByRegion(code).subscribe({
      next: d => { this.prefecturesNaissanceMere = d; this.isLoadingPrefecturesNaissanceMere = false; },
      error: () => (this.isLoadingPrefecturesNaissanceMere = false),
    });
  }

  onPrefectureNaissanceMereChange(code: string): void {
    this.data.commune_naissance_mere = '';
    this.data.district_naissance_mere = '';
    this.communesNaissanceMere = [];
    this.quartiersNaissanceMere = [];
    if (!code) return;
    this.isLoadingCommunesNaissanceMere = true;
    this.geodataService.getCommunesByPrefecture(code).subscribe({
      next: d => { this.communesNaissanceMere = d; this.isLoadingCommunesNaissanceMere = false; },
      error: () => (this.isLoadingCommunesNaissanceMere = false),
    });
  }

  onCommuneNaissanceMereChange(code: string): void {
    this.data.district_naissance_mere = '';
    this.quartiersNaissanceMere = [];
    if (!code) return;
    this.isLoadingQuartiersNaissanceMere = true;
    this.geodataService.getQuartiersByCommune(code).subscribe({
      next: d => { this.quartiersNaissanceMere = d; this.isLoadingQuartiersNaissanceMere = false; },
      error: () => (this.isLoadingQuartiersNaissanceMere = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONVERSION DATES — String ↔ Date (pour le datepicker Material)
  // ═══════════════════════════════════════════════════════════════════════════

  stringToDate(dateStr?: string): Date | null {
    if (!dateStr) return null;
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-').map(Number);
      if (parts.length === 3 && parts[0] > 31) {
        // YYYY-MM-DD
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
      // DD-MM-YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
  }

  dateToString(date: Date | null): string {
    if (!date || isNaN(date.getTime())) return '';
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear().toString();
    return `${d}/${m}/${y}`;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>, fieldName: keyof ActeData): void {
    (this.data as any)[fieldName] = this.dateToString(event.value);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS D'AFFICHAGE — même API qu'avec-actes
  // ═══════════════════════════════════════════════════════════════════════════

  getNomRegion(code: string): string {
    return this.allRegions.find(r => r.code === code)?.nom ?? '—';
  }

  getNomPrefecture(code: string, list: PrefectureDTO[]): string {
    return list.find(p => p.code === code)?.nom ?? '—';
  }

  getNomCommune(code: string, list: CommuneDTO[]): string {
    return list.find(c => c.code === code)?.nom ?? '—';
  }

  getNomQuartier(code: string, list: QuartierDTO[]): string {
    return list.find(q => q.code === code)?.nom ?? '—';
  }

  getNomPays(code: string): string {
    return this.allPays.find(p => p.code === code)?.nom ?? '—';
  }

  getNationalite(code: string): string {
    return this.nationaliteService.getLibelle(code, 'F', this.nationalites);
  }

  getProfession(code: number | string | undefined, genre: string): string {
    if (!code) return '—';
    const n = typeof code === 'string' ? parseInt(code) : code as number;
    return this.professionService.getProfessionBySex(n, genre === 'F' ? 'F' : 'M', this.professions);
  }

  getGenreDisplay(genre: string): string {
    return this.normalizeGenre(genre) === 'F' ? 'Féminin' : 'Masculin';
  }

  normalizeGenre(genre: string): 'M' | 'F' {
    if (!genre) return 'M';
    const c = genre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return c === 'f' || c === 'feminin' ? 'F' : 'M';
  }

  getDisplayHour(time?: string): string {
    if (!time) return '—';
    if (/^\d{2}:\d{2}$/.test(time)) return time;
    const parts = time.split(':');
    if (parts.length === 2) return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
    return time;
  }

  toTimeInputFormat(time?: string): string {
    return this.getDisplayHour(time) === '—' ? '' : this.getDisplayHour(time);
  }

  fromTimeInputFormat(time: string): string { return time || ''; }

  getImageSrc(): string {
    if (!this.previewUrl) return '';
    return this.previewUrl;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZOOM & ROTATION — identique à avec-actes
  // ═══════════════════════════════════════════════════════════════════════════

  zoomIn():    void { this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + 0.25); }
  zoomOut():   void { this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - 0.25); }
  rotateImage(): void { this.rotation = (this.rotation + 90) % 360; }

  resetZoom(): void {
    this.zoomLevel = 1; this.panX = 0; this.panY = 0; this.rotation = 0;
  }

  onImageLoad(): void {}

  onImageWheel(e: WheelEvent): void {
    e.preventDefault();
    const d = e.deltaY > 0 ? -0.1 : 0.1;
    this.zoomLevel = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoomLevel + d));
  }

  onImageMouseDown(e: MouseEvent): void {
    this.isDragging = true; this.lastMouseX = e.clientX; this.lastMouseY = e.clientY;
  }

  onImageMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    this.panX += e.clientX - this.lastMouseX; this.panY += e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX; this.lastMouseY = e.clientY;
  }

  onImageMouseUp(): void { this.isDragging = false; }

  getImageTransform(): string {
    return `translate(${this.panX}px,${this.panY}px) scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMATAGE DES DATES — identique à avec-actes
  // ═══════════════════════════════════════════════════════════════════════════

  formatDateOnInput(event: any, fieldName: keyof ActeData): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let f = v.substring(0, 2);
    if (v.length >= 3) f += '/' + v.substring(2, 4);
    if (v.length >= 5) f += '/' + v.substring(4, 8);
    (this.data as any)[fieldName] = f;
    setTimeout(() => input.setSelectionRange(f.length, f.length), 0);
  }

  handleDateKeydown(event: KeyboardEvent, fieldName: keyof ActeData): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? 0;
    if (event.key === 'Backspace' && pos > 0 && input.value[pos - 1] === '/') {
      event.preventDefault();
      (this.data as any)[fieldName] = input.value.substring(0, pos - 1) + input.value.substring(pos);
      setTimeout(() => input.setSelectionRange(pos - 1, pos - 1), 0);
    }
  }

  validateMemberDate(): void {
    const v = this.data.date_de_nais_membre;
    if (!v) { this.showWarning('La date de naissance est obligatoire.'); return; }
    const year = parseInt(v.split('/')[2]);
    if (!year || year < 1900) {
      this.showError("L'année de naissance doit être valide (> 1900).");
      this.data.date_de_nais_membre = '';
    }
  }

  validateFactDate(): void {
    const v = this.data.date_etablissement_acte;
    if (!v) return;
    const year = parseInt(v.split('/')[2]);
    if (!year || year < 1900) {
      this.showError("L'année de la date des faits doit être valide (> 1900).");
      this.data.date_etablissement_acte = '';
    }
  }

  validateParentDate(fieldName: keyof ActeData): void {
    const v = (this.data as any)[fieldName];
    if (!v || v === '00/00/0000') return;
    const year = parseInt(v.split('/')[2]);
    if (year > 0 && year < 1900) {
      this.showWarning("L'année doit être > 1900 ou 00/00/0000 si inconnue.");
      (this.data as any)[fieldName] = '00/00/0000';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAUVEGARDE & RÉINITIALISATION
  // ═══════════════════════════════════════════════════════════════════════════

  saveActe(): void {
    if (!this.data.nom_membre || !this.data.prenoms || !this.data.date_de_nais_membre) {
      this.showWarning('Nom, prénoms et date de naissance sont obligatoires.');
      return;
    }
    this.isSaving = true;
    const payload = {
      ...this.data,
      image_base64: this.fileBase64,
      media_type:   this.fileMediaType,
    };
    this.apiService.saveActe(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccess('Acte sauvegardé avec succès !');
        this.resetForm();
      },
      error: () => {
        this.isSaving = false;
        this.showError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      },
    });
  }

  resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileBase64 = null;
    this.data = {};
    this.isEditing = false;
    this.isSaving = false;
    this.prefecturesCollecte = [];
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    this.villesNaissance = [];
    this.prefecturesNaissancePere = [];
    this.communesNaissancePere = [];
    this.quartiersNaissancePere = [];
    this.villesNaissancePere = [];
    this.prefecturesNaissanceMere = [];
    this.communesNaissanceMere = [];
    this.quartiersNaissanceMere = [];
    this.villesNaissanceMere = [];
    this.resetZoom();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOASTS — ToastComponent (même pattern que le reste du projet)
  // ═══════════════════════════════════════════════════════════════════════════

  private showSuccess(msg: string): void { this.toast.success(msg); }
  private showError(msg: string):   void { this.toast.error(msg); }
  private showWarning(msg: string): void { this.toast.warning(msg); }

  /** Données de test pré-remplies au chargement d'une image. */
  private getTestData(): ActeData {
    return {
      // Registre
      numero_acte:             '0042',
      numero_registre:         '001',
      annee_registre:          '2010',
      feuillet:                '12',
      date_etablissement_acte: '05/01/2010',

      // Zone de collecte — Conakry / Kaloum
      region_collecte:    'Conakry',
      prefecture_collecte:'Kaloum',
      commune:            'Kaloum',
      district:           'Almamya',

      // Enfant
      prenoms:             'Yaya',
      nom_membre:          'Camara',
      date_de_nais_membre: '01/01/2010',
      genre_membre:        'M',
      nationalite_du_membre: 'GN',
      pays_de_naissance:   'GN',
      commune_de_nais:     'Kaloum',

      // Père
      prenoms_pere:       'Ousmane',
      nom_pere:           'Camara',
      date_de_nais_pere:  '01/01/1980',
      nationalite_pere:   'GN',
      pays_naissance_pere: 'GN',

      // Mère
      prenoms_mere:       'Aissata',
      nom_mere:           'Condé',
      date_de_nais_mere:  '01/01/1988',
      nationalite_mere:   'GN',
      pays_naissance_mere: 'GN',
      region_naissance:   'Kankan',
    };
  }
}
