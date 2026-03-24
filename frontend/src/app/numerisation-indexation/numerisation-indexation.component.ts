import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent } from '../shared/toast/toast.component';
import { GeodataService } from '../services/geodata.service';
import { Profession, ProfessionService } from '../services/profession.service';
import { ApiService } from '../services/api.service';
import {
  RegionDTO,
  PrefectureDTO,
  CommuneDTO,
  QuartierDTO,
  PaysDTO,
} from '../models/geodata';

// ─── Modèle de données de l'acte ─────────────────────────────────────────────
export interface ActeNaissanceData {
  // Identification
  numero_certificat?: string;
  numero_identification_national?: string;
  numero_acte?: string;
  numero_registre?: string;
  annee_registre?: string;
  feuillet?: string;
  date_etablissement_acte?: string;
  date_dresse?: string;

  // Zone de collecte
  region_collecte?: string;
  prefecture_collecte?: string;
  commune?: string;
  district?: string;
  ville_prefecture?: string;
  officier_etat_civil?: string;

  // Enfant
  prenoms?: string;
  nom_membre?: string;
  date_de_nais_membre?: string;
  heure_naissance?: string;
  rang_de_naissance?: string | number;
  genre_membre?: string;

  // Lieu de naissance de l'enfant
  pays_de_naissance?: string;
  region_naissance?: string;
  prefecture_naissance?: string;
  commune_de_nais?: string;
  quartier_naissance?: string;
  ville_naissance?: string;

  nationalite_du_membre?: string;

  // Père
  prenoms_pere?: string;
  nom_pere?: string;
  date_de_nais_pere?: string;
  nationalite_pere?: string;
  code_profession_pere?: number | string;
  profession_pere_texte?: string;

  // Mère
  prenoms_mere?: string;
  nom_mere?: string;
  date_de_nais_mere?: string;
  nationalite_mere?: string;
  code_profession_mere?: number | string;
  profession_mere_texte?: string;
  domicileParent?: string;

  // Déclarant
  prenom_1_declarant?: string;
  nom_declarant?: string;
  lien_de_prarente_avec_le_declarant?: string;

  // Officier
  prenom_1_officier?: string;
  nom_officier?: string;
  profession_officier?: string;
}

export type OcrStep = 'idle' | 'ocr' | 'done' | 'error';

// ─── Config toast ─────────────────────────────────────────────────────────────
interface ToastConfig {
  message: string;
  icon: string;
  panelClass: string;
}

const TOAST: Record<'success' | 'error' | 'warning', ToastConfig> = {
  success: { message: '', icon: 'check_circle',  panelClass: 'success-snackbar' },
  error:   { message: '', icon: 'error',          panelClass: 'error-snackbar'   },
  warning: { message: '', icon: 'warning',        panelClass: 'info-snackbar'    },
};

@Component({
  selector: 'app-numerisation-indexation',
  templateUrl: './numerisation-indexation.component.html',
  styleUrls: ['./numerisation-indexation.component.css'],
})
export class NumerisationIndexationComponent implements OnInit {

  // ─── UI state ────────────────────────────────────────────────────────────────
  activeTab: 'numerisation' | 'indexation' = 'numerisation';
  ocrStep: OcrStep = 'idle';
  ocrMessage = '';
  ocrConfidence = 0;
  isSaving = false;

  // ─── Fichier ──────────────────────────────────────────────────────────────────
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  fileBase64: string | null = null;
  fileMediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' = 'image/jpeg';

  // ─── Données OCR ──────────────────────────────────────────────────────────────
  data: ActeNaissanceData = {};

  // ─── Référentiels géographiques ───────────────────────────────────────────────
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
  villesByPays: any[] = [];
  isLoadingPrefecturesNaissance = false;
  isLoadingCommunesNaissance = false;
  isLoadingQuartiersNaissance = false;
  isLoadingVilles = false;

  // ─── Professions ──────────────────────────────────────────────────────────────
  professions: Profession[] = [];

  // ─── Zoom image ───────────────────────────────────────────────────────────────
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
    private snackBar: MatSnackBar,
    private geodataService: GeodataService,
    private professionService: ProfessionService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      regions:    this.geodataService.getAllRegions(),
      pays:       this.geodataService.getAllPays(),
      professions: this.professionService.getProfessions(),
    }).subscribe({
      next: ({ regions, pays, professions }) => {
        this.allRegions   = regions;
        this.allPays      = pays;
        this.professions  = professions;
      },
      error: (err) => console.error('Erreur chargement référentiels :', err),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOAST — wrappers utilisant ToastComponent
  // ═══════════════════════════════════════════════════════════════════════════

  private toast(type: 'success' | 'error' | 'warning', message: string): void {
    const cfg = TOAST[type];
    this.snackBar.openFromComponent(ToastComponent, {
      data:               { message, icon: cfg.icon, type },
      panelClass:         [cfg.panelClass],
      duration:           4000,
      horizontalPosition: 'end',
      verticalPosition:   'top',
    });
  }

  private showSuccess(msg: string): void { this.toast('success', msg); }
  private showError(msg: string):   void { this.toast('error',   msg); }
  private showWarning(msg: string): void { this.toast('warning', msg); }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Zone de collecte
  // ═══════════════════════════════════════════════════════════════════════════

  onRegionCollecteChange(codeRegion: string): void {
    this.data.prefecture_collecte = '';
    this.data.commune = '';
    this.data.district = '';
    this.prefecturesCollecte = [];
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    if (!codeRegion) return;

    this.isLoadingPrefecturesCollecte = true;
    this.geodataService.getPrefecturesByRegion(codeRegion).subscribe({
      next: (d) => { this.prefecturesCollecte = d; this.isLoadingPrefecturesCollecte = false; },
      error: () => (this.isLoadingPrefecturesCollecte = false),
    });
  }

  onPrefectureCollecteChange(codePrefecture: string): void {
    this.data.commune = '';
    this.data.district = '';
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    if (!codePrefecture) return;

    this.isLoadingCommunesCollecte = true;
    this.geodataService.getCommunesByPrefecture(codePrefecture).subscribe({
      next: (d) => { this.communesCollecte = d; this.isLoadingCommunesCollecte = false; },
      error: () => (this.isLoadingCommunesCollecte = false),
    });
  }

  onCommuneCollecteChange(codeCommune: string): void {
    this.data.district = '';
    this.quartiersCollecte = [];
    if (!codeCommune) return;

    this.isLoadingQuartiersCollecte = true;
    this.geodataService.getQuartiersByCommune(codeCommune).subscribe({
      next: (d) => { this.quartiersCollecte = d; this.isLoadingQuartiersCollecte = false; },
      error: () => (this.isLoadingQuartiersCollecte = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CASCADE GÉOGRAPHIQUE — Lieu de naissance
  // ═══════════════════════════════════════════════════════════════════════════

  isGuinee(): boolean {
    return !this.data.pays_de_naissance || this.data.pays_de_naissance === 'GN';
  }

  onPaysNaissanceChange(codePays: string): void {
    this.data.region_naissance = '';
    this.data.prefecture_naissance = '';
    this.data.commune_de_nais = '';
    this.data.quartier_naissance = '';
    this.data.ville_naissance = '';
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    this.villesByPays = [];
    if (!codePays || codePays === 'GN') return;

    this.isLoadingVilles = true;
    this.geodataService.getVillesByPays(codePays).subscribe({
      next: (d) => { this.villesByPays = d; this.isLoadingVilles = false; },
      error: () => (this.isLoadingVilles = false),
    });
  }

  onRegionNaissanceChange(codeRegion: string): void {
    this.data.prefecture_naissance = '';
    this.data.commune_de_nais = '';
    this.data.quartier_naissance = '';
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    if (!codeRegion) return;

    this.isLoadingPrefecturesNaissance = true;
    this.geodataService.getPrefecturesByRegion(codeRegion).subscribe({
      next: (d) => { this.prefecturesNaissance = d; this.isLoadingPrefecturesNaissance = false; },
      error: () => (this.isLoadingPrefecturesNaissance = false),
    });
  }

  onPrefectureNaissanceChange(codePrefecture: string): void {
    this.data.commune_de_nais = '';
    this.data.quartier_naissance = '';
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    if (!codePrefecture) return;

    this.isLoadingCommunesNaissance = true;
    this.geodataService.getCommunesByPrefecture(codePrefecture).subscribe({
      next: (d) => { this.communesNaissance = d; this.isLoadingCommunesNaissance = false; },
      error: () => (this.isLoadingCommunesNaissance = false),
    });
  }

  onCommuneNaissanceChange(codeCommune: string): void {
    this.data.quartier_naissance = '';
    this.quartiersNaissance = [];
    if (!codeCommune) return;

    this.isLoadingQuartiersNaissance = true;
    this.geodataService.getQuartiersByCommune(codeCommune).subscribe({
      next: (d) => { this.quartiersNaissance = d; this.isLoadingQuartiersNaissance = false; },
      error: () => (this.isLoadingQuartiersNaissance = false),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS D'AFFICHAGE
  // ═══════════════════════════════════════════════════════════════════════════

  getNomPays(code: string): string {
    return this.allPays.find((p) => p.code === code)?.nom ?? code ?? '—';
  }

  getNationalite(code: string): string {
    return this.professionService.getNationalite(code);
  }

  getProfessionLabel(code: number | string | undefined, genre: 'M' | 'F' = 'M'): string {
    if (!code) return '—';
    const n = typeof code === 'string' ? parseInt(code) : code;
    return this.professionService.getProfessionBySex(n, genre, this.professions);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GESTION DU FICHIER
  // ═══════════════════════════════════════════════════════════════════════════

  onFileSelected(event: Event): void {
    const f = (event.target as HTMLInputElement).files?.[0];
    if (f) this.processFile(f);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); event.stopPropagation(); }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const f = event.dataTransfer?.files?.[0];
    if (f) this.processFile(f);
  }

  private processFile(file: File): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.showError('Format non supporté. Utilisez JPG, PNG, WEBP ou PDF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.showError('Fichier trop volumineux (max 10 Mo).');
      return;
    }
    this.selectedFile = file;
    this.fileMediaType = file.type as any;
    this.ocrStep = 'idle';
    this.data = {};
    this.resetGeoData();

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.previewUrl = result;
      this.fileBase64 = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  clearFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileBase64 = null;
    this.data = {};
    this.ocrStep = 'idle';
    this.ocrMessage = '';
    this.ocrConfidence = 0;
    this.resetGeoData();
  }

  private resetGeoData(): void {
    this.prefecturesCollecte = [];
    this.communesCollecte = [];
    this.quartiersCollecte = [];
    this.prefecturesNaissance = [];
    this.communesNaissance = [];
    this.quartiersNaissance = [];
    this.villesByPays = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // OCR VIA ANTHROPIC API
  // ═══════════════════════════════════════════════════════════════════════════

  async extractWithOCR(): Promise<void> {
    if (!this.fileBase64) {
      this.showWarning("Sélectionnez d'abord un document.");
      return;
    }

    this.ocrStep = 'ocr';
    this.ocrMessage = 'Analyse du document par intelligence artificielle...';

    const prompt = `Tu es un expert en lecture d'actes d'état civil de la République de Guinée.
Analyse cet acte de naissance et extrais toutes les informations visibles.
Retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks) avec ces champs :

{
  "numero_certificat": "",
  "numero_identification_national": "",
  "numero_acte": "",
  "numero_registre": "",
  "annee_registre": "",
  "feuillet": "",
  "date_etablissement_acte": "JJ/MM/AAAA",
  "date_dresse": "JJ/MM/AAAA",
  "ville_prefecture": "",
  "officier_etat_civil": "",
  "prenoms": "",
  "nom_membre": "",
  "date_de_nais_membre": "JJ/MM/AAAA",
  "heure_naissance": "HH:MM",
  "rang_de_naissance": "",
  "genre_membre": "M ou F",
  "nationalite_du_membre": "GN",
  "pays_de_naissance": "GN",
  "prenoms_pere": "",
  "nom_pere": "",
  "date_de_nais_pere": "JJ/MM/AAAA",
  "nationalite_pere": "GN",
  "profession_pere_texte": "",
  "prenoms_mere": "",
  "nom_mere": "",
  "date_de_nais_mere": "JJ/MM/AAAA",
  "nationalite_mere": "GN",
  "profession_mere_texte": "",
  "domicileParent": "",
  "prenom_1_declarant": "",
  "nom_declarant": "",
  "lien_de_prarente_avec_le_declarant": "",
  "prenom_1_officier": "",
  "nom_officier": "",
  "profession_officier": "",
  "confidence": 0.95
}

Règles :
- Dates au format JJ/MM/AAAA. Si inconnue : "".
- genre_membre : "M" ou "F".
- nationalite : code ISO-2 (ex: GN pour Guinée).
- pays_de_naissance : code ISO-2.
- confidence : nombre entre 0 et 1.
- Champ absent ou illisible → "".`;

    try {
      const contentBlock: any =
        this.fileMediaType === 'application/pdf'
          ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: this.fileBase64 } }
          : { type: 'image',    source: { type: 'base64', media_type: this.fileMediaType,  data: this.fileBase64 } };

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: prompt }] }],
        }),
      });

      if (!response.ok) throw new Error(`Erreur API HTTP ${response.status}`);

      const result = await response.json();
      const text = result.content
        ?.filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('') ?? '';

      const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      this.ocrConfidence = parsed.confidence ?? 0;
      delete parsed.confidence;

      // Normaliser le genre
      if (parsed.genre_membre) {
        const g = (parsed.genre_membre as string).toLowerCase();
        parsed.genre_membre = g.startsWith('f') || g.includes('fémin') ? 'F' : 'M';
      }

      this.data = { ...parsed };

      // Déclencher la cascade pays si étranger
      if (parsed.pays_de_naissance && parsed.pays_de_naissance !== 'GN') {
        this.onPaysNaissanceChange(parsed.pays_de_naissance);
      }

      this.ocrStep = 'done';
      this.ocrMessage = `Extraction terminée — confiance : ${Math.round(this.ocrConfidence * 100)}%`;
      this.activeTab = 'indexation';

      this.showSuccess('Données extraites ! Complétez la géolocalisation et vérifiez les professions.');

    } catch (err: any) {
      console.error('OCR error:', err);
      this.ocrStep = 'error';
      this.ocrMessage = `Extraction échouée : ${err.message}`;
      this.showError("Impossible d'extraire les données. Vérifiez le document.");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ONGLETS
  // ═══════════════════════════════════════════════════════════════════════════

  switchTab(tab: 'numerisation' | 'indexation'): void {
    this.activeTab = tab;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ZOOM & ROTATION
  // ═══════════════════════════════════════════════════════════════════════════

  zoomIn(): void  { this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + 0.25); }
  zoomOut(): void { this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - 0.25); }
  resetZoom(): void { this.zoomLevel = 1; this.panX = 0; this.panY = 0; this.rotation = 0; }
  rotateImage(): void { this.rotation = (this.rotation + 90) % 360; }

  onImageWheel(event: WheelEvent): void {
    event.preventDefault();
    const d = event.deltaY > 0 ? -0.1 : 0.1;
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
    return `translate(${this.panX}px, ${this.panY}px) scale(${this.zoomLevel}) rotate(${this.rotation}deg)`;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORMATAGE DES DATES
  // ═══════════════════════════════════════════════════════════════════════════

  formatDateOnInput(event: any, fieldName: keyof ActeNaissanceData): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 8) v = v.substring(0, 8);
    let f = v.substring(0, 2);
    if (v.length >= 3) f += '/' + v.substring(2, 4);
    if (v.length >= 5) f += '/' + v.substring(4, 8);
    (this.data as any)[fieldName] = f;
    setTimeout(() => input.setSelectionRange(f.length, f.length), 0);
  }

  handleDateKeydown(event: KeyboardEvent, fieldName: keyof ActeNaissanceData): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? 0;
    if (event.key === 'Backspace' && pos > 0 && input.value[pos - 1] === '/') {
      event.preventDefault();
      (this.data as any)[fieldName] = input.value.substring(0, pos - 1) + input.value.substring(pos);
      setTimeout(() => input.setSelectionRange(pos - 1, pos - 1), 0);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SAUVEGARDE
  // ═══════════════════════════════════════════════════════════════════════════

  saveIndexation(): void {
    if (!this.data.nom_membre || !this.data.prenoms || !this.data.date_de_nais_membre) {
      this.showWarning('Nom, prénoms et date de naissance sont obligatoires.');
      return;
    }
    this.isSaving = true;
    const payload = {
      ...this.data,
      image_base64: this.fileBase64,
      media_type:   this.fileMediaType,
      date_indexation: new Date().toISOString(),
    };
    this.apiService.saveActe(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.showSuccess('Acte indexé et sauvegardé avec succès !');
        this.resetForm();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur sauvegarde:', err);
        this.showError('Erreur lors de la sauvegarde. Veuillez réessayer.');
      },
    });
  }

  resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.fileBase64 = null;
    this.data = {};
    this.ocrStep = 'idle';
    this.ocrMessage = '';
    this.ocrConfidence = 0;
    this.activeTab = 'numerisation';
    this.resetGeoData();
    this.resetZoom();
  }

  // ─── Helpers UI ──────────────────────────────────────────────────────────────
  get confidenceClass(): string {
    if (this.ocrConfidence >= 0.85) return 'text-success';
    if (this.ocrConfidence >= 0.65) return 'text-warning';
    return 'text-danger';
  }

  get confidenceIcon(): string {
    if (this.ocrConfidence >= 0.85) return '✅';
    if (this.ocrConfidence >= 0.65) return '⚠️';
    return '❌';
  }
}
