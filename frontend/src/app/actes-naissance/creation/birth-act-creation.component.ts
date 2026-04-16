import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, PaysDTO, PrefectureDTO, QuartierDTO, RegionDTO } from '../../models/geodata';

export interface Step {
  number: number;
  label: string;
}

@Component({
  selector: 'app-birth-act-creation',
  templateUrl: './birth-act-creation.component.html',
  styleUrls: ['./birth-act-creation.component.css'],
})
export class BirthActCreationComponent implements OnInit {

  currentStep = 1;
  readonly today = new Date();

  readonly steps: Step[] = [
    { number: 1, label: 'Enfant' },
    { number: 2, label: 'Naissance' },
    { number: 3, label: 'Père' },
    { number: 4, label: 'Mère' },
    { number: 5, label: 'Déclaration' },
    { number: 6, label: 'Acte' },
  ];

  enfantForm!: FormGroup;
  naissanceForm!: FormGroup;
  pereForm!: FormGroup;
  mereForm!: FormGroup;
  declarationForm!: FormGroup;
  acteForm!: FormGroup;

  // ── Géographie — naissance enfant ─────────────────────────────────
  pays: PaysDTO[] = [];
  regions: RegionDTO[] = [];
  prefectures: PrefectureDTO[] = [];
  communes: CommuneDTO[] = [];
  quartiers: QuartierDTO[] = [];

  isLoadingRegions       = false;
  isLoadingPrefectures   = false;
  isLoadingCommunes      = false;
  isLoadingQuartiers     = false;

  // ── Géographie — domicile père ─────────────────────────────────────
  perePrefectures: PrefectureDTO[] = [];
  pereCommunes:    CommuneDTO[]    = [];
  pereQuartiers:   QuartierDTO[]   = [];

  isLoadingPerePrefectures = false;
  isLoadingPereCommunes    = false;
  isLoadingPereQuartiers   = false;

  // ── Géographie — domicile mère ─────────────────────────────────────
  merePrefectures: PrefectureDTO[] = [];
  mereCommunes:    CommuneDTO[]    = [];
  mereQuartiers:   QuartierDTO[]   = [];

  isLoadingMerePrefectures = false;
  isLoadingMereCommunes    = false;
  isLoadingMereQuartiers   = false;

  private readonly GUINEE_CODE = 'GN';

  // Guinée par défaut quand aucun pays sélectionné (comme dans numérisation)
  get isGuinee(): boolean {
    const v = this.enfantForm?.get('paysNaissance')?.value;
    return !v || v === this.GUINEE_CODE;
  }

  get isAutrePays(): boolean {
    const v = this.enfantForm?.get('paysNaissance')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }

  // Getters pour l'affichage progressif (contrôles désactivés → .value = valeur courante)
  get regionNaissanceVal(): string    { return this.enfantForm?.get('regionNaissance')?.value ?? ''; }
  get prefectureNaissanceVal(): string { return this.enfantForm?.get('prefectureNaissance')?.value ?? ''; }
  get communeNaissanceVal(): string   { return this.enfantForm?.get('communeNaissance')?.value ?? ''; }

  get isPerePaysGuinee(): boolean {
    return this.pereForm?.get('pays')?.value === this.GUINEE_CODE;
  }

  get isMerePaysGuinee(): boolean {
    return this.mereForm?.get('pays')?.value === this.GUINEE_CODE;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private geodata: GeodataService,
    private dialog: MatDialog,
  ) {}

  // Formations sanitaires (viendra du paramétrage)
  readonly formationsSanitaires: string[] = [
    'Hôpital National Donka',
    'Hôpital National Ignace Deen',
    'Clinique Ambroise Paré',
    'Maternité de Ratoma',
    'Centre de Santé de Matam',
    'Maternité de Dixinn',
    'Clinique Les Palmiers',
    'Centre de Santé de Kaloum',
  ];

  ngOnInit(): void {
    this.enfantForm = this.fb.group({
      prenom:              ['', Validators.required],
      nom:                 [''],
      sexe:                ['', Validators.required],
      dateNaissance:       [null, Validators.required],
      heureNaissance:      [''],
      paysNaissance:       ['', Validators.required],
      regionNaissance:     [{ value: '', disabled: true }],
      prefectureNaissance: [{ value: '', disabled: true }],
      communeNaissance:    [{ value: '', disabled: true }],
      quartier:            [{ value: '', disabled: true }],
      villeNaissance:      [''],
      lieuAccouchement:    ['formation_sanitaire', Validators.required],
      formationSanitaire:  [''],
      adresseLieu:         [''],
    });

    this.naissanceForm = this.fb.group({
      naissanceMultiple: ['non', Validators.required],
      rangNaissance:     [null],
    });

    this.pereForm = this.fb.group({
      npi:           [''],
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      dateNaissance: [null],
      nationalite:   ['Guinéenne'],
      profession:    [''],
      pays:          [''],
      prefecture:    [{ value: '', disabled: true }],
      commune:       [{ value: '', disabled: true }],
      quartier:      [{ value: '', disabled: true }],
      adresse:       [''],
    });

    this.mereForm = this.fb.group({
      npi:           [''],
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      dateNaissance: [null],
      nationalite:   ['Guinéenne'],
      profession:    [''],
      pays:          [''],
      prefecture:    [{ value: '', disabled: true }],
      commune:       [{ value: '', disabled: true }],
      quartier:      [{ value: '', disabled: true }],
      adresse:       [''],
    });

    this.declarationForm = this.fb.group({
      qualite:         ['pere', Validators.required],
      npi:             [''],
      nom:             [''],
      prenom:          [''],
      profession:      [''],
      adresse:         [''],
      dateDeclaration: [new Date(), Validators.required],
    });

    this.acteForm = this.fb.group({
      numeroActe:        [''],
      officier:          ['', Validators.required],
      dateEtablissement: [new Date(), Validators.required],
      observations:      [''],
    });

    // Charger les pays et les régions par défaut (Guinée est présélectionnée par défaut)
    this.geodata.getAllPays().subscribe(data => this.pays = data);
    this.isLoadingRegions = true;
    this.geodata.getAllRegions().subscribe({
      next: data => {
        this.regions = data;
        this.isLoadingRegions = false;
        this.enfantForm.get('regionNaissance')!.enable();
      },
      error: () => this.isLoadingRegions = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — LIEU DE NAISSANCE (ENFANT)
  // ══════════════════════════════════════════════════════════════════

  onPaysNaissanceChange(code: string): void {
    this.regions = [];
    this.prefectures = [];
    this.communes = [];
    this.quartiers = [];
    this.enfantForm.patchValue({ regionNaissance: '', prefectureNaissance: '', communeNaissance: '', quartier: '', villeNaissance: '' });
    this.enfantForm.get('regionNaissance')!.disable();
    this.enfantForm.get('prefectureNaissance')!.disable();
    this.enfantForm.get('communeNaissance')!.disable();
    this.enfantForm.get('quartier')!.disable();

    if (!code || code === this.GUINEE_CODE) {
      this.isLoadingRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => {
          this.regions = data;
          this.isLoadingRegions = false;
          this.enfantForm.get('regionNaissance')!.enable();
        },
        error: () => this.isLoadingRegions = false,
      });
    }
  }

  onRegionNaissanceChange(code: string): void {
    this.prefectures = [];
    this.communes = [];
    this.quartiers = [];
    this.enfantForm.patchValue({ prefectureNaissance: '', communeNaissance: '', quartier: '' });
    this.enfantForm.get('prefectureNaissance')!.disable();
    this.enfantForm.get('communeNaissance')!.disable();
    this.enfantForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingPrefectures = true;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => {
        this.prefectures = data;
        this.isLoadingPrefectures = false;
        this.enfantForm.get('prefectureNaissance')!.enable();
      },
      error: () => this.isLoadingPrefectures = false,
    });
  }

  onPrefectureNaissanceChange(code: string): void {
    this.communes = [];
    this.quartiers = [];
    this.enfantForm.patchValue({ communeNaissance: '', quartier: '' });
    this.enfantForm.get('communeNaissance')!.disable();
    this.enfantForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingCommunes = true;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => {
        this.communes = data;
        this.isLoadingCommunes = false;
        this.enfantForm.get('communeNaissance')!.enable();
      },
      error: () => this.isLoadingCommunes = false,
    });
  }

  onCommuneNaissanceChange(code: string): void {
    this.quartiers = [];
    this.enfantForm.patchValue({ quartier: '' });
    this.enfantForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingQuartiers = true;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => {
        this.quartiers = data;
        this.isLoadingQuartiers = false;
        this.enfantForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE PÈRE
  // ══════════════════════════════════════════════════════════════════

  onPerePaysChange(code: string): void {
    this.perePrefectures = [];
    this.pereCommunes = [];
    this.pereQuartiers = [];
    this.pereForm.patchValue({ prefecture: '', commune: '', quartier: '', adresse: '' });
    this.pereForm.get('prefecture')!.disable();
    this.pereForm.get('commune')!.disable();
    this.pereForm.get('quartier')!.disable();

    if (code === this.GUINEE_CODE) {
      this.isLoadingPerePrefectures = true;
      this.geodata.getAllPrefectures().subscribe({
        next: data => {
          this.perePrefectures = data;
          this.isLoadingPerePrefectures = false;
          this.pereForm.get('prefecture')!.enable();
        },
        error: () => this.isLoadingPerePrefectures = false,
      });
    }
  }

  onPerePrefectureChange(code: string): void {
    this.pereCommunes = [];
    this.pereQuartiers = [];
    this.pereForm.patchValue({ commune: '', quartier: '' });
    this.pereForm.get('commune')!.disable();
    this.pereForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingPereCommunes = true;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => {
        this.pereCommunes = data;
        this.isLoadingPereCommunes = false;
        this.pereForm.get('commune')!.enable();
      },
      error: () => this.isLoadingPereCommunes = false,
    });
  }

  onPereCommuneChange(code: string): void {
    this.pereQuartiers = [];
    this.pereForm.patchValue({ quartier: '' });
    this.pereForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingPereQuartiers = true;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => {
        this.pereQuartiers = data;
        this.isLoadingPereQuartiers = false;
        this.pereForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingPereQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE MÈRE
  // ══════════════════════════════════════════════════════════════════

  onMerePaysChange(code: string): void {
    this.merePrefectures = [];
    this.mereCommunes = [];
    this.mereQuartiers = [];
    this.mereForm.patchValue({ prefecture: '', commune: '', quartier: '', adresse: '' });
    this.mereForm.get('prefecture')!.disable();
    this.mereForm.get('commune')!.disable();
    this.mereForm.get('quartier')!.disable();

    if (code === this.GUINEE_CODE) {
      this.isLoadingMerePrefectures = true;
      this.geodata.getAllPrefectures().subscribe({
        next: data => {
          this.merePrefectures = data;
          this.isLoadingMerePrefectures = false;
          this.mereForm.get('prefecture')!.enable();
        },
        error: () => this.isLoadingMerePrefectures = false,
      });
    }
  }

  onMerePrefectureChange(code: string): void {
    this.mereCommunes = [];
    this.mereQuartiers = [];
    this.mereForm.patchValue({ commune: '', quartier: '' });
    this.mereForm.get('commune')!.disable();
    this.mereForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingMereCommunes = true;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => {
        this.mereCommunes = data;
        this.isLoadingMereCommunes = false;
        this.mereForm.get('commune')!.enable();
      },
      error: () => this.isLoadingMereCommunes = false,
    });
  }

  onMereCommuneChange(code: string): void {
    this.mereQuartiers = [];
    this.mereForm.patchValue({ quartier: '' });
    this.mereForm.get('quartier')!.disable();
    if (!code) return;

    this.isLoadingMereQuartiers = true;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => {
        this.mereQuartiers = data;
        this.isLoadingMereQuartiers = false;
        this.mereForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingMereQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  NAVIGATION STEPPER
  // ══════════════════════════════════════════════════════════════════

  get currentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.enfantForm;
      case 2: return this.naissanceForm;
      case 3: return this.pereForm;
      case 4: return this.mereForm;
      case 5: return this.declarationForm;
      case 6: return this.acteForm;
      default: return this.enfantForm;
    }
  }

  isStepCompleted(n: number): boolean {
    if (n >= this.currentStep) return false;
    switch (n) {
      case 1: return this.enfantForm.valid;
      case 2: return this.naissanceForm.valid;
      case 3: return this.pereForm.valid;
      case 4: return this.mereForm.valid;
      case 5: return this.declarationForm.valid;
      default: return false;
    }
  }

  goTo(step: number): void {
    if (step < this.currentStep || this.isStepCompleted(step - 1) || step === 1) {
      this.currentStep = step;
    }
  }

  goNext(): void {
    if (this.currentStep < 6) {
      this.currentStep++;
    } else {
      this.enregistrer();
    }
  }

  goPrev(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private isAnyFormDirty(): boolean {
    return [
      this.enfantForm, this.naissanceForm, this.pereForm,
      this.mereForm, this.declarationForm, this.acteForm,
    ].some(f => f?.dirty);
  }

  cancel(): void {
    if (this.isAnyFormDirty()) {
      const ref = this.dialog.open(ConfirmLeaveDialogComponent, {
        width: '460px',
        maxWidth: '96vw',
        disableClose: true,
        panelClass: 'confirm-leave-panel',
      });
      ref.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) this.router.navigate(['/admin/actes']);
      });
    } else {
      this.router.navigate(['/admin/actes']);
    }
  }

  enregistrer(): void {
    console.log('Enregistrement…', {
      enfant:      this.enfantForm.getRawValue(),
      naissance:   this.naissanceForm.value,
      pere:        this.pereForm.getRawValue(),
      mere:        this.mereForm.getRawValue(),
      declaration: this.declarationForm.value,
      acte:        this.acteForm.value,
    });
  }

  // ── Getters utilitaires ────────────────────────────────────────────

  get declarantAutre(): boolean {
    return this.declarationForm.get('qualite')?.value === 'autre';
  }

  get naissanceMultiple(): boolean {
    return this.naissanceForm.get('naissanceMultiple')?.value === 'oui';
  }

  get lieuAccouchement(): string {
    return this.enfantForm.get('lieuAccouchement')?.value ?? 'formation_sanitaire';
  }

  get isFormationSanitaire(): boolean {
    return this.lieuAccouchement === 'formation_sanitaire';
  }

  get isAdresseLieu(): boolean {
    return this.lieuAccouchement === 'domicile' || this.lieuAccouchement === 'autre';
  }
}
