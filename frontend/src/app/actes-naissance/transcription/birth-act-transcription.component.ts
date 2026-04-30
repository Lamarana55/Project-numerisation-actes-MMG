import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, startWith, map } from 'rxjs';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, PaysDTO, PrefectureDTO, QuartierDTO, RegionDTO, VilleDTO } from '../../models/geodata';
import { ActeNaissanceService, ActeNaissanceDTO } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { ProfessionService, Profession } from '../../services/profession.service';
import { NationaliteService, Nationalite } from '../../services/nationalite.service';

export interface Step { number: number; label: string; }

@Component({
  selector: 'app-birth-act-transcription',
  templateUrl: './birth-act-transcription.component.html',
  styleUrls: ['../creation/birth-act-creation.component.css'],
})
export class BirthActTranscriptionComponent implements OnInit {

  currentStep = 1;
  readonly today = new Date();
  isSaving = false;

  readonly steps: Step[] = [
    { number: 1, label: 'Jugement' },
    { number: 2, label: 'Enfant' },
    { number: 3, label: 'Père' },
    { number: 4, label: 'Mère' },
    { number: 5, label: 'Transcription' },
  ];

  jugementForm!:      FormGroup;
  enfantForm!:        FormGroup;
  pereForm!:          FormGroup;
  mereForm!:          FormGroup;
  transcriptionForm!: FormGroup;

  // ── Géographie — naissance enfant ─────────────────────────────────
  pays:        PaysDTO[]       = [];
  regions:     RegionDTO[]     = [];
  prefectures: PrefectureDTO[] = [];
  communes:    CommuneDTO[]    = [];
  quartiers:   QuartierDTO[]   = [];

  isLoadingRegions     = false;
  isLoadingPrefectures = false;
  isLoadingCommunes    = false;
  isLoadingQuartiers   = false;
  villes: VilleDTO[]   = [];
  isLoadingVilles      = false;

  // ── Géographie — lieu de naissance père ───────────────────────────
  pereNaissRegions:     RegionDTO[]     = [];
  pereNaissPrefectures: PrefectureDTO[] = [];
  pereNaissCommunes:    CommuneDTO[]    = [];
  pereNaissQuartiers:   QuartierDTO[]   = [];
  pereNaissVilles:      VilleDTO[]      = [];

  isLoadingPereNaissRegions     = false;
  isLoadingPereNaissPrefectures = false;
  isLoadingPereNaissCommunes    = false;
  isLoadingPereNaissQuartiers   = false;
  isLoadingPereNaissVilles      = false;

  // ── Géographie — domicile père ─────────────────────────────────────
  pereRegions:     RegionDTO[]     = [];
  perePrefectures: PrefectureDTO[] = [];
  pereCommunes:    CommuneDTO[]    = [];
  pereQuartiers:   QuartierDTO[]   = [];

  isLoadingPereRegions     = false;
  isLoadingPerePrefectures = false;
  isLoadingPereCommunes    = false;
  isLoadingPereQuartiers   = false;

  // ── Géographie — lieu de naissance mère ───────────────────────────
  mereNaissRegions:     RegionDTO[]     = [];
  mereNaissPrefectures: PrefectureDTO[] = [];
  mereNaissCommunes:    CommuneDTO[]    = [];
  mereNaissQuartiers:   QuartierDTO[]   = [];
  mereNaissVilles:      VilleDTO[]      = [];

  isLoadingMereNaissRegions     = false;
  isLoadingMereNaissPrefectures = false;
  isLoadingMereNaissCommunes    = false;
  isLoadingMereNaissQuartiers   = false;
  isLoadingMereNaissVilles      = false;

  // ── Géographie — domicile mère ─────────────────────────────────────
  mereRegions:     RegionDTO[]     = [];
  merePrefectures: PrefectureDTO[] = [];
  mereCommunes:    CommuneDTO[]    = [];
  mereQuartiers:   QuartierDTO[]   = [];

  isLoadingMereRegions     = false;
  isLoadingMerePrefectures = false;
  isLoadingMereCommunes    = false;
  isLoadingMereQuartiers   = false;

  // ── Commune de mariage ─────────────────────────────────────────────
  communesMariage:         CommuneDTO[] = [];
  isLoadingCommunesMariage = false;

  private readonly GUINEE_CODE = 'GIN';

  professions: Profession[] = [];
  nationalites: Nationalite[] = [];
  filteredProfessionsPere$!:  Observable<Profession[]>;
  filteredProfessionsMere$!:  Observable<Profession[]>;

  // ── Getters enfant ─────────────────────────────────────────────────
  get isGuinee(): boolean {
    const v = this.enfantForm?.get('paysNaissance')?.value;
    return !v || v === this.GUINEE_CODE;
  }
  get isAutrePays(): boolean {
    const v = this.enfantForm?.get('paysNaissance')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }
  get regionNaissanceVal(): string    { return this.enfantForm?.get('regionNaissance')?.value ?? ''; }
  get prefectureNaissanceVal(): string { return this.enfantForm?.get('prefectureNaissance')?.value ?? ''; }
  get communeNaissanceVal(): string   { return this.enfantForm?.get('communeNaissance')?.value ?? ''; }

  // ── Getters père ───────────────────────────────────────────────────
  get isPereConnu(): boolean { return this.pereForm?.get('pereConnu')?.value === 'oui'; }
  get isPereHasNpi(): boolean { return this.pereForm?.get('hasNpi')?.value === 'oui'; }
  get isPereNationaliteConnue(): boolean { return this.pereForm?.get('nationaliteConnue')?.value === 'oui'; }

  get isPerePaysNaissGuinee(): boolean {
    const v = this.pereForm?.get('paysNaissancePere')?.value;
    return !v || v === this.GUINEE_CODE;
  }
  get isPereAutrePaysNaiss(): boolean {
    const v = this.pereForm?.get('paysNaissancePere')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }
  get pereNaissRegionVal(): string    { return this.pereForm?.get('regionNaissancePere')?.value ?? ''; }
  get pereNaissPrefectureVal(): string { return this.pereForm?.get('prefectureNaissancePere')?.value ?? ''; }
  get pereNaissCommuneVal(): string   { return this.pereForm?.get('communeNaissancePere')?.value ?? ''; }

  get isPerePaysGuinee(): boolean { return this.pereForm?.get('pays')?.value === this.GUINEE_CODE; }
  get pereRegionDomicileVal(): string  { return this.pereForm?.get('regionDomicilePere')?.value ?? ''; }
  get perePrefectureDomicileVal(): string { return this.pereForm?.get('prefecture')?.value ?? ''; }

  // ── Getters mère ───────────────────────────────────────────────────
  get isMereConnue(): boolean { return this.mereForm?.get('mereConnue')?.value === 'oui'; }
  get isMereHasNpi(): boolean { return this.mereForm?.get('hasNpi')?.value === 'oui'; }
  get isMereNationaliteConnue(): boolean { return this.mereForm?.get('nationaliteConnue')?.value === 'oui'; }

  get isMerePaysNaissGuinee(): boolean {
    const v = this.mereForm?.get('paysNaissanceMere')?.value;
    return !v || v === this.GUINEE_CODE;
  }
  get isMereAutrePaysNaiss(): boolean {
    const v = this.mereForm?.get('paysNaissanceMere')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }
  get mereNaissRegionVal(): string    { return this.mereForm?.get('regionNaissanceMere')?.value ?? ''; }
  get mereNaissPrefectureVal(): string { return this.mereForm?.get('prefectureNaissanceMere')?.value ?? ''; }
  get mereNaissCommuneVal(): string   { return this.mereForm?.get('communeNaissanceMere')?.value ?? ''; }

  get isMerePaysGuinee(): boolean { return this.mereForm?.get('pays')?.value === this.GUINEE_CODE; }
  get mereRegionDomicileVal(): string  { return this.mereForm?.get('regionDomicileMere')?.value ?? ''; }
  get merePrefectureDomicileVal(): string { return this.mereForm?.get('prefecture')?.value ?? ''; }

  get isMemeDomicileQuePere(): boolean { return this.mereForm?.get('memeDomicileQuePere')?.value === 'oui'; }
  get isParentsMaries(): boolean { return this.mereForm?.get('parentsMaries')?.value === 'oui'; }
  get isDocumentMariage(): boolean { return this.mereForm?.get('documentMariage')?.value === 'oui'; }

  // ── Getters lieu d'accouchement ────────────────────────────────────
  get lieuAccouchement(): string {
    return this.enfantForm?.get('lieuAccouchement')?.value ?? 'formation_sanitaire';
  }
  get isFormationSanitaire(): boolean { return this.lieuAccouchement === 'formation_sanitaire'; }
  get isAdresseLieu(): boolean { return this.lieuAccouchement === 'domicile' || this.lieuAccouchement === 'autre'; }

  // ── Délai jugement → transcription ────────────────────────────────
  get delaiDressageMois(): number {
    const dn = this.jugementForm?.get('dateJugement')?.value;
    const dd = this.transcriptionForm?.get('dateInscription')?.value;
    if (!dn || !dd) return 0;
    const debut = new Date(dn);
    const fin   = new Date(dd);
    return (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
  }
  get retardDressage(): boolean { return this.delaiDressageMois > 6; }

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

  readonly tribunaux: string[] = [
    'Tribunal de Première Instance de Conakry',
    'Tribunal de Première Instance de Kindia',
    'Tribunal de Première Instance de Labé',
    'Tribunal de Première Instance de Kankan',
    'Tribunal de Première Instance de Nzérékoré',
    'Tribunal de Première Instance de Faranah',
    'Tribunal de Première Instance de Mamou',
    'Tribunal de Première Instance de Boké',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private geodata: GeodataService,
    private dialog: MatDialog,
    private acteService: ActeNaissanceService,
    private toast: ToastService,
    private professionSvc: ProfessionService,
    private nationaliteSvc: NationaliteService,
  ) {}

  private getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  ngOnInit(): void {
    this.jugementForm = this.fb.group({
      dateJugement:   [null, Validators.required],
      numeroJugement: ['', Validators.required],
      tribunal:       ['', Validators.required],
    });

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

    this.pereForm = this.fb.group({
      pereConnu:               ['oui', Validators.required],
      pereDecede:              ['non', Validators.required],
      hasNpi:                  ['non'],
      npi:                     [''],
      prenom:                  ['', Validators.required],
      nom:                     ['', Validators.required],
      dateNaissance:           [null],
      paysNaissancePere:       ['', Validators.required],
      regionNaissancePere:     [{ value: '', disabled: true }, Validators.required],
      prefectureNaissancePere: [{ value: '', disabled: true }, Validators.required],
      communeNaissancePere:    [{ value: '', disabled: true }, Validators.required],
      quartierNaissancePere:   [{ value: '', disabled: true }],
      villeNaissancePere:      [''],
      nationaliteConnue:       ['oui'],
      nationalite:             [''],
      profession:              [''],
      telephone:               [''],
      situationMatrimoniale:   ['celibataire'],
      adresse:                 [''],
      pays:                    [''],
      regionDomicilePere:      [{ value: '', disabled: true }],
      prefecture:              [{ value: '', disabled: true }],
      commune:                 [{ value: '', disabled: true }],
      quartier:                [{ value: '', disabled: true }],
    });

    this.mereForm = this.fb.group({
      mereConnue:              ['oui', Validators.required],
      mereDecedee:             ['non', Validators.required],
      hasNpi:                  ['non'],
      npi:                     [''],
      prenom:                  ['', Validators.required],
      nom:                     ['', Validators.required],
      dateNaissance:           [null],
      paysNaissanceMere:       ['', Validators.required],
      regionNaissanceMere:     [{ value: '', disabled: true }, Validators.required],
      prefectureNaissanceMere: [{ value: '', disabled: true }, Validators.required],
      communeNaissanceMere:    [{ value: '', disabled: true }, Validators.required],
      quartierNaissanceMere:   [{ value: '', disabled: true }],
      villeNaissanceMere:      [''],
      nationaliteConnue:       ['oui'],
      nationalite:             [''],
      profession:              [''],
      telephone:               [''],
      situationMatrimoniale:   ['celibataire'],
      memeDomicileQuePere:     ['non'],
      adresse:                 [''],
      pays:                    [''],
      regionDomicileMere:      [{ value: '', disabled: true }],
      prefecture:              [{ value: '', disabled: true }],
      commune:                 [{ value: '', disabled: true }],
      quartier:                [{ value: '', disabled: true }],
      parentsMaries:           [''],
      documentMariage:         [''],
      numeroActeMariage:       [''],
      dateMariage:             [null],
      communeMariage:          [''],
    });

    this.transcriptionForm = this.fb.group({
      dateInscription:  [new Date(), Validators.required],
      heureInscription: [this.getCurrentTime()],
      actionsFaire:     ['en_cours_saisie', Validators.required],
    });

    // Chargements initiaux
    this.professionSvc.getProfessions().subscribe(data => {
      this.professions = data;
      this.filteredProfessionsPere$ = this.pereForm.get('profession')!.valueChanges.pipe(
        startWith(''),
        map(v => this._filterProfessions(v || '', 'M'))
      );
      this.filteredProfessionsMere$ = this.mereForm.get('profession')!.valueChanges.pipe(
        startWith(''),
        map(v => this._filterProfessions(v || '', 'F'))
      );
    });
    this.nationaliteSvc.getNationalites().subscribe(data => this.nationalites = data);
    this.geodata.getAllPays().subscribe(data => {
      const guinee = data.find(p => p.code === this.GUINEE_CODE);
      this.pays = guinee ? [guinee, ...data.filter(p => p.code !== this.GUINEE_CODE)] : data;
    });
    this.isLoadingCommunesMariage = true;
    this.geodata.getAllCommunes().subscribe({
      next: data => { this.communesMariage = data; this.isLoadingCommunesMariage = false; },
      error: () => this.isLoadingCommunesMariage = false,
    });
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
  //  CASCADES ENFANT
  // ══════════════════════════════════════════════════════════════════

  onPaysNaissanceChange(paysCode: string): void {
    const isGuinee = !paysCode || paysCode === this.GUINEE_CODE;
    ['regionNaissance', 'prefectureNaissance', 'communeNaissance', 'quartier'].forEach(f => {
      this.enfantForm.get(f)?.setValue('');
      this.enfantForm.get(f)?.disable();
    });
    this.regions = []; this.prefectures = []; this.communes = []; this.quartiers = []; this.villes = [];
    this.enfantForm.patchValue({ villeNaissance: '' });
    if (isGuinee) {
      this.isLoadingRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.regions = data; this.isLoadingRegions = false; this.enfantForm.get('regionNaissance')!.enable(); },
        error: () => this.isLoadingRegions = false,
      });
    } else if (paysCode) {
      this.isLoadingVilles = true;
      this.geodata.getVillesByPays(paysCode).subscribe({
        next: data => { this.villes = data; this.isLoadingVilles = false; },
        error: () => this.isLoadingVilles = false,
      });
    }
  }

  onRegionNaissanceChange(regionId: string): void {
    ['prefectureNaissance', 'communeNaissance', 'quartier'].forEach(f => {
      this.enfantForm.get(f)?.setValue(''); this.enfantForm.get(f)?.disable();
    });
    this.prefectures = []; this.communes = []; this.quartiers = [];
    if (!regionId) return;
    this.isLoadingPrefectures = true;
    this.geodata.getPrefecturesByRegion(regionId).subscribe({
      next: data => {
        this.prefectures = data; this.isLoadingPrefectures = false;
        this.enfantForm.get('prefectureNaissance')!.enable();
      },
      error: () => this.isLoadingPrefectures = false,
    });
  }

  onPrefectureNaissanceChange(prefId: string): void {
    ['communeNaissance', 'quartier'].forEach(f => {
      this.enfantForm.get(f)?.setValue(''); this.enfantForm.get(f)?.disable();
    });
    this.communes = []; this.quartiers = [];
    if (!prefId) return;
    this.isLoadingCommunes = true;
    this.geodata.getCommunesByPrefecture(prefId).subscribe({
      next: data => {
        this.communes = data; this.isLoadingCommunes = false;
        this.enfantForm.get('communeNaissance')!.enable();
      },
      error: () => this.isLoadingCommunes = false,
    });
  }

  onCommuneNaissanceChange(communeId: string): void {
    this.enfantForm.get('quartier')?.setValue(''); this.enfantForm.get('quartier')?.disable();
    this.quartiers = [];
    if (!communeId) return;
    this.isLoadingQuartiers = true;
    this.geodata.getQuartiersByCommune(communeId).subscribe({
      next: data => {
        this.quartiers = data; this.isLoadingQuartiers = false;
        this.enfantForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADES PÈRE — NAISSANCE
  // ══════════════════════════════════════════════════════════════════

  onPerePaysNaissanceChange(paysCode: string): void {
    const isGuinee = !paysCode || paysCode === this.GUINEE_CODE;
    ['regionNaissancePere','prefectureNaissancePere','communeNaissancePere','quartierNaissancePere'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.pereNaissRegions = []; this.pereNaissPrefectures = []; this.pereNaissCommunes = []; this.pereNaissQuartiers = []; this.pereNaissVilles = [];
    this.pereForm.patchValue({ villeNaissancePere: '' });
    if (isGuinee) {
      this.isLoadingPereNaissRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.pereNaissRegions = data; this.isLoadingPereNaissRegions = false; this.pereForm.get('regionNaissancePere')!.enable(); },
        error: () => this.isLoadingPereNaissRegions = false,
      });
    } else if (paysCode) {
      this.isLoadingPereNaissVilles = true;
      this.geodata.getVillesByPays(paysCode).subscribe({
        next: data => { this.pereNaissVilles = data; this.isLoadingPereNaissVilles = false; },
        error: () => this.isLoadingPereNaissVilles = false,
      });
    }
  }

  onPereRegionNaissanceChange(regionId: string): void {
    ['prefectureNaissancePere','communeNaissancePere','quartierNaissancePere'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.pereNaissPrefectures = []; this.pereNaissCommunes = []; this.pereNaissQuartiers = [];
    if (!regionId) return;
    this.isLoadingPereNaissPrefectures = true;
    this.geodata.getPrefecturesByRegion(regionId).subscribe({
      next: data => {
        this.pereNaissPrefectures = data; this.isLoadingPereNaissPrefectures = false;
        this.pereForm.get('prefectureNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissPrefectures = false,
    });
  }

  onPerePrefectureNaissanceChange(prefId: string): void {
    ['communeNaissancePere','quartierNaissancePere'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.pereNaissCommunes = []; this.pereNaissQuartiers = [];
    if (!prefId) return;
    this.isLoadingPereNaissCommunes = true;
    this.geodata.getCommunesByPrefecture(prefId).subscribe({
      next: data => {
        this.pereNaissCommunes = data; this.isLoadingPereNaissCommunes = false;
        this.pereForm.get('communeNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissCommunes = false,
    });
  }

  onPereCommuneNaissanceChange(communeId: string): void {
    this.pereForm.get('quartierNaissancePere')?.setValue(''); this.pereForm.get('quartierNaissancePere')?.disable();
    this.pereNaissQuartiers = [];
    if (!communeId) return;
    this.isLoadingPereNaissQuartiers = true;
    this.geodata.getQuartiersByCommune(communeId).subscribe({
      next: data => {
        this.pereNaissQuartiers = data; this.isLoadingPereNaissQuartiers = false;
        this.pereForm.get('quartierNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissQuartiers = false,
    });
  }

  // ── Domicile père ──────────────────────────────────────────────────

  onPerePaysChange(paysCode: string): void {
    ['regionDomicilePere','prefecture','commune','quartier'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.pereRegions = []; this.perePrefectures = []; this.pereCommunes = []; this.pereQuartiers = [];
    if (paysCode !== this.GUINEE_CODE) return;
    this.isLoadingPereRegions = true;
    this.geodata.getAllRegions().subscribe({
      next: data => {
        this.pereRegions = data; this.isLoadingPereRegions = false;
        this.pereForm.get('regionDomicilePere')!.enable();
      },
      error: () => this.isLoadingPereRegions = false,
    });
  }

  onPereRegionDomicileChange(regionId: string): void {
    ['prefecture','commune','quartier'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.perePrefectures = []; this.pereCommunes = []; this.pereQuartiers = [];
    if (!regionId) return;
    this.isLoadingPerePrefectures = true;
    this.geodata.getPrefecturesByRegion(regionId).subscribe({
      next: data => {
        this.perePrefectures = data; this.isLoadingPerePrefectures = false;
        this.pereForm.get('prefecture')!.enable();
      },
      error: () => this.isLoadingPerePrefectures = false,
    });
  }

  onPerePrefectureDomicileChange(prefId: string): void {
    ['commune','quartier'].forEach(f => {
      this.pereForm.get(f)?.setValue(''); this.pereForm.get(f)?.disable();
    });
    this.pereCommunes = []; this.pereQuartiers = [];
    if (!prefId) return;
    this.isLoadingPereCommunes = true;
    this.geodata.getCommunesByPrefecture(prefId).subscribe({
      next: data => {
        this.pereCommunes = data; this.isLoadingPereCommunes = false;
        this.pereForm.get('commune')!.enable();
      },
      error: () => this.isLoadingPereCommunes = false,
    });
  }

  onPereCommuneDomicileChange(communeId: string): void {
    this.pereForm.get('quartier')?.setValue(''); this.pereForm.get('quartier')?.disable();
    this.pereQuartiers = [];
    if (!communeId) return;
    this.isLoadingPereQuartiers = true;
    this.geodata.getQuartiersByCommune(communeId).subscribe({
      next: data => {
        this.pereQuartiers = data; this.isLoadingPereQuartiers = false;
        this.pereForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingPereQuartiers = false,
    });
  }

  onPereHasNpiChange(val: string): void {
    const ctrl = this.pereForm.get('npi')!;
    if (val === 'oui') {
      ctrl.setValidators(Validators.required); ctrl.enable();
    } else {
      ctrl.clearValidators(); ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADES MÈRE — NAISSANCE
  // ══════════════════════════════════════════════════════════════════

  onMerePaysNaissanceChange(paysCode: string): void {
    const isGuinee = !paysCode || paysCode === this.GUINEE_CODE;
    ['regionNaissanceMere','prefectureNaissanceMere','communeNaissanceMere','quartierNaissanceMere'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.mereNaissRegions = []; this.mereNaissPrefectures = []; this.mereNaissCommunes = []; this.mereNaissQuartiers = []; this.mereNaissVilles = [];
    this.mereForm.patchValue({ villeNaissanceMere: '' });
    if (isGuinee) {
      this.isLoadingMereNaissRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.mereNaissRegions = data; this.isLoadingMereNaissRegions = false; this.mereForm.get('regionNaissanceMere')!.enable(); },
        error: () => this.isLoadingMereNaissRegions = false,
      });
    } else if (paysCode) {
      this.isLoadingMereNaissVilles = true;
      this.geodata.getVillesByPays(paysCode).subscribe({
        next: data => { this.mereNaissVilles = data; this.isLoadingMereNaissVilles = false; },
        error: () => this.isLoadingMereNaissVilles = false,
      });
    }
  }

  onMereRegionNaissanceChange(regionId: string): void {
    ['prefectureNaissanceMere','communeNaissanceMere','quartierNaissanceMere'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.mereNaissPrefectures = []; this.mereNaissCommunes = []; this.mereNaissQuartiers = [];
    if (!regionId) return;
    this.isLoadingMereNaissPrefectures = true;
    this.geodata.getPrefecturesByRegion(regionId).subscribe({
      next: data => {
        this.mereNaissPrefectures = data; this.isLoadingMereNaissPrefectures = false;
        this.mereForm.get('prefectureNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissPrefectures = false,
    });
  }

  onMerePrefectureNaissanceChange(prefId: string): void {
    ['communeNaissanceMere','quartierNaissanceMere'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.mereNaissCommunes = []; this.mereNaissQuartiers = [];
    if (!prefId) return;
    this.isLoadingMereNaissCommunes = true;
    this.geodata.getCommunesByPrefecture(prefId).subscribe({
      next: data => {
        this.mereNaissCommunes = data; this.isLoadingMereNaissCommunes = false;
        this.mereForm.get('communeNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissCommunes = false,
    });
  }

  onMereCommuneNaissanceChange(communeId: string): void {
    this.mereForm.get('quartierNaissanceMere')?.setValue(''); this.mereForm.get('quartierNaissanceMere')?.disable();
    this.mereNaissQuartiers = [];
    if (!communeId) return;
    this.isLoadingMereNaissQuartiers = true;
    this.geodata.getQuartiersByCommune(communeId).subscribe({
      next: data => {
        this.mereNaissQuartiers = data; this.isLoadingMereNaissQuartiers = false;
        this.mereForm.get('quartierNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissQuartiers = false,
    });
  }

  // ── Domicile mère ──────────────────────────────────────────────────

  onMerePaysChange(paysCode: string): void {
    ['regionDomicileMere','prefecture','commune','quartier'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.mereRegions = []; this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
    if (paysCode !== this.GUINEE_CODE) return;
    this.isLoadingMereRegions = true;
    this.geodata.getAllRegions().subscribe({
      next: data => {
        this.mereRegions = data; this.isLoadingMereRegions = false;
        this.mereForm.get('regionDomicileMere')!.enable();
      },
      error: () => this.isLoadingMereRegions = false,
    });
  }

  onMereRegionDomicileChange(regionId: string): void {
    ['prefecture','commune','quartier'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
    if (!regionId) return;
    this.isLoadingMerePrefectures = true;
    this.geodata.getPrefecturesByRegion(regionId).subscribe({
      next: data => {
        this.merePrefectures = data; this.isLoadingMerePrefectures = false;
        this.mereForm.get('prefecture')!.enable();
      },
      error: () => this.isLoadingMerePrefectures = false,
    });
  }

  onMerePrefectureDomicileChange(prefId: string): void {
    ['commune','quartier'].forEach(f => {
      this.mereForm.get(f)?.setValue(''); this.mereForm.get(f)?.disable();
    });
    this.mereCommunes = []; this.mereQuartiers = [];
    if (!prefId) return;
    this.isLoadingMereCommunes = true;
    this.geodata.getCommunesByPrefecture(prefId).subscribe({
      next: data => {
        this.mereCommunes = data; this.isLoadingMereCommunes = false;
        this.mereForm.get('commune')!.enable();
      },
      error: () => this.isLoadingMereCommunes = false,
    });
  }

  onMereCommuneDomicileChange(communeId: string): void {
    this.mereForm.get('quartier')?.setValue(''); this.mereForm.get('quartier')?.disable();
    this.mereQuartiers = [];
    if (!communeId) return;
    this.isLoadingMereQuartiers = true;
    this.geodata.getQuartiersByCommune(communeId).subscribe({
      next: data => {
        this.mereQuartiers = data; this.isLoadingMereQuartiers = false;
        this.mereForm.get('quartier')!.enable();
      },
      error: () => this.isLoadingMereQuartiers = false,
    });
  }

  onMereHasNpiChange(val: string): void {
    const ctrl = this.mereForm.get('npi')!;
    if (val === 'oui') {
      ctrl.setValidators(Validators.required); ctrl.enable();
    } else {
      ctrl.clearValidators(); ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  onMemeDomicileQuePereChange(val: string): void {
    if (val !== 'oui') {
      ['adresse','pays','regionDomicileMere','prefecture','commune','quartier'].forEach(f => {
        this.mereForm.get(f)?.enable();
        this.mereForm.get(f)?.setValue('');
      });
      this.mereRegions = []; this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
      return;
    }
    // Copier les données de domicile du père
    const pere = this.pereForm.getRawValue();
    this.mereRegions    = [...this.pereRegions];
    this.merePrefectures = [...this.perePrefectures];
    this.mereCommunes   = [...this.pereCommunes];
    this.mereQuartiers  = [...this.pereQuartiers];

    const fields: Record<string, string> = {
      adresse: pere.adresse, pays: pere.pays,
      regionDomicileMere: pere.regionDomicilePere,
      prefecture: pere.prefecture, commune: pere.commune, quartier: pere.quartier,
    };
    Object.entries(fields).forEach(([key, value]) => {
      this.mereForm.get(key)?.enable();
      this.mereForm.get(key)?.setValue(value ?? '');
      this.mereForm.get(key)?.disable();
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  NAVIGATION STEPPER
  // ══════════════════════════════════════════════════════════════════

  get currentForm(): FormGroup {
    switch (this.currentStep) {
      case 1: return this.jugementForm;
      case 2: return this.enfantForm;
      case 3: return this.pereForm;
      case 4: return this.mereForm;
      case 5: return this.transcriptionForm;
      default: return this.jugementForm;
    }
  }

  isStepCompleted(n: number): boolean {
    if (n >= this.currentStep) return false;
    switch (n) {
      case 1: return this.jugementForm.valid;
      case 2: return this.enfantForm.valid;
      case 3: return this.pereForm.valid;
      case 4: return this.mereForm.valid;
      default: return false;
    }
  }

  goTo(step: number): void {
    if (step < this.currentStep || this.isStepCompleted(step - 1) || step === 1) {
      this.currentStep = step;
    }
  }

  goNext(): void {
    if (this.currentStep < 5) {
      this.currentStep++;
    } else {
      this.enregistrer();
    }
  }

  goPrev(): void {
    if (this.currentStep > 1) this.currentStep--;
  }

  private isAnyFormDirty(): boolean {
    return [this.jugementForm, this.enfantForm, this.pereForm,
            this.mereForm, this.transcriptionForm].some(f => f?.dirty);
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
    if (this.isSaving) return;

    const jugement = this.jugementForm.value;
    const enfant   = this.enfantForm.getRawValue();
    const pere     = this.pereForm.getRawValue();
    const mere     = this.mereForm.getRawValue();
    const trans    = this.transcriptionForm.value;

    const payload: ActeNaissanceDTO = {
      // Jugement
      dateJugement:   jugement.dateJugement,
      numeroJugement: jugement.numeroJugement,
      tribunal:       jugement.tribunal,
      // Enfant
      prenom:              enfant.prenom,
      nom:                 enfant.nom,
      sexe:                enfant.sexe,
      dateNaissance:       enfant.dateNaissance,
      heureNaissance:      enfant.heureNaissance,
      paysNaissance:       enfant.paysNaissance,
      regionNaissance:     enfant.regionNaissance,
      prefectureNaissance: enfant.prefectureNaissance,
      communeNaissance:    enfant.communeNaissance,
      quartier:            enfant.quartier,
      villeNaissance:      enfant.villeNaissance,
      lieuAccouchement:    enfant.lieuAccouchement,
      formationSanitaire:  enfant.formationSanitaire,
      adresseLieu:         enfant.adresseLieu,
      // Père
      pereConnu:               pere.pereConnu,
      pereDecede:              pere.pereDecede,
      prenomPere:              pere.prenom,
      nomPere:                 pere.nom,
      dateNaissancePere:       pere.dateNaissance,
      paysNaissancePere:       pere.paysNaissancePere,
      regionNaissancePere:     pere.regionNaissancePere,
      prefectureNaissancePere: pere.prefectureNaissancePere,
      communeNaissancePere:    pere.communeNaissancePere,
      quartierNaissancePere:   pere.quartierNaissancePere,
      villeNaissancePere:      pere.villeNaissancePere,
      nationalitePere:         pere.nationalite,
      professionPere:          pere.profession,
      telephonePere:           pere.telephone,
      situationMatrimPere:     pere.situationMatrimoniale,
      adressePere:             pere.adresse,
      paysResidencePere:       pere.pays,
      regionDomicilePere:      pere.regionDomicilePere,
      prefectureDomicilePere:  pere.prefecture,
      communeDomicilePere:     pere.commune,
      quartierDomicilePere:    pere.quartier,
      // Mère
      mereConnue:               mere.mereConnue,
      mereDecedee:              mere.mereDecedee,
      prenomMere:               mere.prenom,
      nomMere:                  mere.nom,
      dateNaissanceMere:        mere.dateNaissance,
      paysNaissanceMere:        mere.paysNaissanceMere,
      regionNaissanceMere:      mere.regionNaissanceMere,
      prefectureNaissanceMere:  mere.prefectureNaissanceMere,
      communeNaissanceMere:     mere.communeNaissanceMere,
      quartierNaissanceMere:    mere.quartierNaissanceMere,
      villeNaissanceMere:       mere.villeNaissanceMere,
      nationaliteMere:          mere.nationalite,
      professionMere:           mere.profession,
      telephoneMere:            mere.telephone,
      situationMatrimMere:      mere.situationMatrimoniale,
      memeDomicileQuePere:      mere.memeDomicileQuePere,
      adresseMere:              mere.adresse,
      paysResidenceMere:        mere.pays,
      regionDomicileMere:       mere.regionDomicileMere,
      prefectureDomicileMere:   mere.prefecture,
      communeDomicileMere:      mere.commune,
      quartierDomicileMere:     mere.quartier,
      parentsMaries:            mere.parentsMaries,
      documentMariage:          mere.documentMariage,
      numeroActeMariage:        mere.numeroActeMariage,
      dateMariage:              mere.dateMariage,
      communeMariage:           mere.communeMariage,
      // Inscription
      dateInscription:  trans.dateInscription,
      heureInscription: trans.heureInscription,
      actionsFaire:     trans.actionsFaire,
    };

    this.isSaving = true;
    this.acteService.createTranscription(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Transcription enregistrée avec succès.');
        this.router.navigate(['/admin/actes']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur enregistrement', err);
        this.toast.error('Une erreur est survenue lors de l\'enregistrement.');
      },
    });
  }

  _filterProfessions(value: string, sexe: 'M' | 'F'): Profession[] {
    const q = value.toLowerCase();
    return this.professions.filter(p =>
      (sexe === 'F' ? p.feminin : p.masculin).toLowerCase().includes(q)
    );
  }
}
