import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, PaysDTO, PrefectureDTO, QuartierDTO } from '../../models/geodata';

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

  readonly steps: Step[] = [
    { number: 1, label: 'Enfant' },
    { number: 2, label: 'Naissance' },
    { number: 3, label: 'Père' },
    { number: 4, label: 'Mère' },
    { number: 5, label: 'Déclaration' },
    { number: 6, label: 'Acte' },
  ];

  // ── Formulaires par étape ──────────────────────────────────────────
  enfantForm!: FormGroup;
  naissanceForm!: FormGroup;
  pereForm!: FormGroup;
  mereForm!: FormGroup;
  declarationForm!: FormGroup;
  acteForm!: FormGroup;

  pays: PaysDTO[] = [];
  prefectures: PrefectureDTO[] = [];
  communes: CommuneDTO[] = [];
  quartiers: QuartierDTO[] = [];

  // Code ISO de la Guinée dans la base
  private readonly GUINEE_CODE = 'GN';

  get isGuinee(): boolean {
    return this.enfantForm?.get('paysNaissance')?.value === this.GUINEE_CODE;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private geodata: GeodataService,
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
      // Identité
      prenom:              ['', Validators.required],
      nom:                 ['', Validators.required],
      sexe:                ['', Validators.required],
      // Naissance
      dateNaissance:       [null, Validators.required],
      heureNaissance:      [''],
      paysNaissance:       ['', Validators.required],
      prefectureNaissance: [''],
      communeNaissance:    [''],
      quartier:            [''],
      villeNaissance:      [''],
      lieuAccouchement:    ['formation_sanitaire', Validators.required],
      formationSanitaire:  [''],
      adresseLieu:         [''],
    });

    this.naissanceForm = this.fb.group({
      naissanceMultiple:   ['non', Validators.required],
      rangNaissance:       [null],
    });

    this.pereForm = this.fb.group({
      npi:           [''],
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      dateNaissance: [null],
      nationalite:   ['Guinéenne'],
      profession:    [''],
      adresse:       [''],
    });

    this.mereForm = this.fb.group({
      npi:           [''],
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      dateNaissance: [null],
      nationalite:   ['Guinéenne'],
      profession:    [''],
      adresse:       [''],
    });

    this.declarationForm = this.fb.group({
      qualite:       ['pere', Validators.required],
      npi:           [''],
      nom:           [''],
      prenom:        [''],
      profession:    [''],
      adresse:       [''],
      dateDeclaration: [new Date(), Validators.required],
    });

    // Charger la liste des pays
    this.geodata.getAllPays().subscribe(data => this.pays = data);

    // Pays → reset cascade + charger préfectures si Guinée
    this.enfantForm.get('paysNaissance')!.valueChanges.subscribe(() => {
      this.prefectures = [];
      this.communes = [];
      this.quartiers = [];
      this.enfantForm.patchValue(
        { prefectureNaissance: '', communeNaissance: '', quartier: '', villeNaissance: '' },
        { emitEvent: false },
      );
      if (this.isGuinee) {
        this.geodata.getAllPrefectures().subscribe(data => this.prefectures = data);
      }
    });

    // Préfecture → reset communes/quartiers + charger communes
    this.enfantForm.get('prefectureNaissance')!.valueChanges.subscribe(code => {
      this.communes = [];
      this.quartiers = [];
      this.enfantForm.patchValue(
        { communeNaissance: '', quartier: '' },
        { emitEvent: false },
      );
      if (code) {
        this.geodata.getCommunesByPrefecture(code).subscribe(data => this.communes = data);
      }
    });

    // Commune → reset quartiers + charger quartiers
    this.enfantForm.get('communeNaissance')!.valueChanges.subscribe(code => {
      this.quartiers = [];
      this.enfantForm.get('quartier')!.setValue('', { emitEvent: false });
      if (code) {
        this.geodata.getQuartiersByCommune(code).subscribe(data => this.quartiers = data);
      }
    });

    this.acteForm = this.fb.group({
      numeroActe:        [''],
      officier:          ['', Validators.required],
      dateEtablissement: [new Date(), Validators.required],
      observations:      [''],
    });
  }

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

  cancel(): void {
    this.router.navigate(['/admin/actes']);
  }

  enregistrer(): void {
    // TODO : appel API
    console.log('Enregistrement…', {
      enfant:      this.enfantForm.value,
      naissance:   this.naissanceForm.value,
      pere:        this.pereForm.value,
      mere:        this.mereForm.value,
      declaration: this.declarationForm.value,
      acte:        this.acteForm.value,
    });
  }

  // Déclarant autre que père/mère
  get declarantAutre(): boolean {
    return this.declarationForm.get('qualite')?.value === 'autre';
  }

  // Naissance multiple
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
