import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, startWith, map } from 'rxjs';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, PaysDTO, PrefectureDTO, QuartierDTO, RegionDTO, VilleDTO } from '../../models/geodata';
import { ActeNaissanceService, ActeNaissanceDTO, ActeNaissanceDetail } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { ProfessionService, Profession } from '../../services/profession.service';
import { NationaliteService, Nationalite } from '../../services/nationalite.service';

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
  isRepris  = false;
  isSaving  = false;
  isEditMode = false;
  editId     = '';

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
  villes: VilleDTO[]     = [];
  isLoadingVilles        = false;

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

  // ── Géographie — commune de mariage ───────────────────────────────
  communesMariage: CommuneDTO[] = [];
  isLoadingCommunesMariage = false;

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

  private readonly GUINEE_CODE = 'GIN';

  // ── Professions & Nationalités ─────────────────────────────────────
  professions: Profession[] = [];
  nationalites: Nationalite[] = [];
  filteredProfessionsPere$!:   Observable<Profession[]>;
  filteredProfessionsMere$!:   Observable<Profession[]>;
  filteredProfessionsDecl$!:   Observable<Profession[]>;

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

  get isPereConnu(): boolean {
    return this.pereForm?.get('pereConnu')?.value === 'oui';
  }

  get isPereHasNpi(): boolean {
    return this.pereForm?.get('hasNpi')?.value === 'oui';
  }

  get isPereNationaliteConnue(): boolean {
    return this.pereForm?.get('nationaliteConnue')?.value === 'oui';
  }

  // Lieu de naissance père
  get isPerePaysNaissGuinee(): boolean {
    const v = this.pereForm?.get('paysNaissancePere')?.value;
    return !v || v === this.GUINEE_CODE;
  }
  get isPereAutrePaysNaiss(): boolean {
    const v = this.pereForm?.get('paysNaissancePere')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }
  get pereNaissRegionVal(): string     { return this.pereForm?.get('regionNaissancePere')?.value ?? ''; }
  get pereNaissPrefectureVal(): string  { return this.pereForm?.get('prefectureNaissancePere')?.value ?? ''; }
  get pereNaissCommuneVal(): string    { return this.pereForm?.get('communeNaissancePere')?.value ?? ''; }

  // Domicile père
  get isPerePaysGuinee(): boolean {
    return this.pereForm?.get('pays')?.value === this.GUINEE_CODE;
  }
  get pereRegionDomicileVal(): string  { return this.pereForm?.get('regionDomicilePere')?.value ?? ''; }
  get perePrefectureDomicileVal(): string { return this.pereForm?.get('prefecture')?.value ?? ''; }

  // Lieu de naissance mère
  get isMerePaysNaissGuinee(): boolean {
    const v = this.mereForm?.get('paysNaissanceMere')?.value;
    return !v || v === this.GUINEE_CODE;
  }
  get isMereAutrePaysNaiss(): boolean {
    const v = this.mereForm?.get('paysNaissanceMere')?.value;
    return !!v && v !== this.GUINEE_CODE;
  }
  get mereNaissRegionVal(): string     { return this.mereForm?.get('regionNaissanceMere')?.value ?? ''; }
  get mereNaissPrefectureVal(): string  { return this.mereForm?.get('prefectureNaissanceMere')?.value ?? ''; }
  get mereNaissCommuneVal(): string    { return this.mereForm?.get('communeNaissanceMere')?.value ?? ''; }

  // Domicile mère
  get mereRegionDomicileVal(): string  { return this.mereForm?.get('regionDomicileMere')?.value ?? ''; }
  get merePrefectureDomicileVal(): string { return this.mereForm?.get('prefecture')?.value ?? ''; }

  get isMereConnue(): boolean {
    return this.mereForm?.get('mereConnue')?.value === 'oui';
  }

  get isMereHasNpi(): boolean {
    return this.mereForm?.get('hasNpi')?.value === 'oui';
  }

  get isMereNationaliteConnue(): boolean {
    return this.mereForm?.get('nationaliteConnue')?.value === 'oui';
  }

  get isMerePaysGuinee(): boolean {
    return this.mereForm?.get('pays')?.value === this.GUINEE_CODE;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
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
      naissanceMultiple:      ['non', Validators.required],
      typeNaissanceMultiple:  [''],
      rangEnfant:             [null],
      rangNaissanceMere:      [null],
    });

    this.pereForm = this.fb.group({
      // Bloc 1 — Statut
      pereConnu:               ['oui', Validators.required],
      pereDecede:              ['non', Validators.required],
      // Bloc 2 — Identité
      hasNpi:                  ['non'],
      npi:                     [''],
      prenom:                  ['', Validators.required],
      nom:                     ['', Validators.required],
      dateNaissance:           [null],
      // Lieu de naissance père (cascade complète)
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
      // Bloc 3 — Domicile
      adresse:                 [''],
      pays:                    [''],
      regionDomicilePere:      [{ value: '', disabled: true }],
      prefecture:              [{ value: '', disabled: true }],
      commune:                 [{ value: '', disabled: true }],
      quartier:                [{ value: '', disabled: true }],
    });

    this.mereForm = this.fb.group({
      // Bloc 1 — Statut
      mereConnue:              ['oui', Validators.required],
      mereDecedee:             ['non', Validators.required],
      // Bloc 2 — Identité
      hasNpi:                  ['non'],
      npi:                     [''],
      prenom:                  ['', Validators.required],
      nom:                     ['', Validators.required],
      dateNaissance:           [null],
      // Lieu de naissance mère (cascade complète)
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
      // Bloc 3 — Domicile
      memeDomicileQuePere:     ['non'],
      adresse:                 [''],
      pays:                    [''],
      regionDomicileMere:      [{ value: '', disabled: true }],
      prefecture:              [{ value: '', disabled: true }],
      commune:                 [{ value: '', disabled: true }],
      quartier:                [{ value: '', disabled: true }],
      // Bloc 4 — Mariage
      parentsMaries:           [''],
      documentMariage:         [''],
      numeroActeMariage:       [''],
      dateMariage:             [null],
      communeMariage:          [''],
    });

    this.declarationForm = this.fb.group({
      // Bloc 1 — Déclarant
      qualite:               ['pere', Validators.required],
      dateDeclaration:       [new Date(), Validators.required],
      // Bloc 2 — Tiers (si qualite === 'autre')
      hasNpi:                ['non'],
      npi:                   [''],
      prenom:                [''],
      nom:                   [''],
      sexe:                  ['M'],
      dateNaissance:         [null],
      communeNaissance:      [''],
      nationaliteConnue:     ['oui'],
      nationalite:           [''],
      profession:            [''],
      adresse:               [''],
      communeDomicile:       [''],
      quartier:              [''],
      secteur:               [''],
      lienParente:           [''],
      situationMatrimoniale: ['celibataire'],
      // Bloc 3 — Téléphone
      telephone:             [''],
      // Bloc 4 — Signature
      signatureDeclarant:    ['oui'],
      raisonNonSignature:    [''],
    });

    this.acteForm = this.fb.group({
      pointCollecte:  [''],
      dateDressage:   [new Date(), Validators.required],
      heureDressage:  [this.getCurrentTime()],
      actionsFaire:   ['en_cours_saisie', Validators.required],
    });

    // Charger professions et nationalités depuis l'API
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
      this.filteredProfessionsDecl$ = this.declarationForm.get('profession')!.valueChanges.pipe(
        startWith(''),
        map(v => this._filterProfessions(v || '', 'M'))
      );
    });
    this.nationaliteSvc.getNationalites().subscribe(data => this.nationalites = data);

    // Charger les pays — Guinée toujours en tête de liste
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

    // Détecter le mode (repris / edit)
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['mode'] === 'repris') {
        this.isRepris = true;
        this.removeAllRequiredValidators();
      } else if (params['mode'] === 'edit' && params['id']) {
        this.isEditMode = true;
        this.editId     = params['id'];
        this.removeAllRequiredValidators();
        this.acteService.getByIdNaissance(this.editId).subscribe({
          next: detail => this.patchFormsFromDetail(detail),
          error: () => this.toast.error('Impossible de charger les données de l\'acte.'),
        });
      }
    });
  }

  private patchFormsFromDetail(d: ActeNaissanceDetail): void {
    this.enfantForm.patchValue({
      prenom:              d.prenom,
      nom:                 d.nom,
      sexe:                d.sexe,
      dateNaissance:       d.dateNaissance ? new Date(d.dateNaissance) : null,
      heureNaissance:      d.heureNaissance,
      paysNaissance:       d.paysNaissance,
      regionNaissance:     d.regionNaissance,
      prefectureNaissance: d.prefectureNaissance,
      communeNaissance:    d.communeNaissance,
      quartier:            d.quartierNaissance,
      villeNaissance:      d.villeNaissance,
      lieuAccouchement:    d.lieuAccouchement,
      formationSanitaire:  d.formationSanitaire,
      adresseLieu:         d.adresseLieu,
    });
    ['regionNaissance','prefectureNaissance','communeNaissance','quartier'].forEach(f => {
      const ctrl = this.enfantForm.get(f);
      if (ctrl && ctrl.disabled) ctrl.enable();
    });

    this.naissanceForm.patchValue({
      naissanceMultiple:     d.naissanceMultiple,
      typeNaissanceMultiple: d.typeNaissanceMultiple,
      rangEnfant:            d.rangEnfant,
      rangNaissanceMere:     d.rangNaissanceMere,
    });

    this.pereForm.patchValue({
      pereConnu:               d.pereConnu,
      pereDecede:              d.pereDecede,
      prenom:                  d.prenomPere,
      nom:                     d.nomPere,
      dateNaissance:           d.dateNaissancePere ? new Date(d.dateNaissancePere) : null,
      paysNaissancePere:       d.paysNaissancePere,
      regionNaissancePere:     d.regionNaissancePere,
      prefectureNaissancePere: d.prefectureNaissancePere,
      communeNaissancePere:    d.communeNaissancePere,
      quartierNaissancePere:   d.quartierNaissancePere,
      villeNaissancePere:      d.villeNaissancePere,
      nationalite:             d.nationalitePere,
      profession:              d.professionPere,
      telephone:               d.telephonePere,
      situationMatrimoniale:   d.situationMatrimPere,
      adresse:                 d.adressePere,
      pays:                    d.paysResidencePere,
      regionDomicilePere:      d.regionDomicilePere,
      prefecture:              d.prefectureDomicilePere,
      commune:                 d.communeDomicilePere,
      quartier:                d.quartierDomicilePere,
    });
    ['regionNaissancePere','prefectureNaissancePere','communeNaissancePere','quartierNaissancePere',
     'regionDomicilePere','prefecture','commune','quartier'].forEach(f => {
      const ctrl = this.pereForm.get(f);
      if (ctrl && ctrl.disabled) ctrl.enable();
    });

    this.mereForm.patchValue({
      mereConnue:              d.mereConnue,
      mereDecedee:             d.mereDecedee,
      prenom:                  d.prenomMere,
      nom:                     d.nomMere,
      dateNaissance:           d.dateNaissanceMere ? new Date(d.dateNaissanceMere) : null,
      paysNaissanceMere:       d.paysNaissanceMere,
      regionNaissanceMere:     d.regionNaissanceMere,
      prefectureNaissanceMere: d.prefectureNaissanceMere,
      communeNaissanceMere:    d.communeNaissanceMere,
      quartierNaissanceMere:   d.quartierNaissanceMere,
      villeNaissanceMere:      d.villeNaissanceMere,
      nationalite:             d.nationaliteMere,
      profession:              d.professionMere,
      telephone:               d.telephoneMere,
      situationMatrimoniale:   d.situationMatrimMere,
      memeDomicileQuePere:     d.memeDomicileQuePere,
      adresse:                 d.adresseMere,
      pays:                    d.paysResidenceMere,
      regionDomicileMere:      d.regionDomicileMere,
      prefecture:              d.prefectureDomicileMere,
      commune:                 d.communeDomicileMere,
      quartier:                d.quartierDomicileMere,
      parentsMaries:           d.parentsMaries,
      documentMariage:         d.documentMariage,
      numeroActeMariage:       d.numeroActeMariage,
      dateMariage:             d.dateMariage ? new Date(d.dateMariage) : null,
      communeMariage:          d.communeMariage,
    });
    ['regionNaissanceMere','prefectureNaissanceMere','communeNaissanceMere','quartierNaissanceMere',
     'regionDomicileMere','prefecture','commune','quartier'].forEach(f => {
      const ctrl = this.mereForm.get(f);
      if (ctrl && ctrl.disabled) ctrl.enable();
    });

    this.declarationForm.patchValue({
      qualite:            d.qualiteDeclarant,
      dateDeclaration:    d.dateDeclaration ? new Date(d.dateDeclaration) : null,
      prenom:             d.prenomDeclarant,
      nom:                d.nomDeclarant,
      sexe:               d.sexeDeclarant,
      telephone:          d.telephoneDeclarant,
      signatureDeclarant: d.signatureDeclarant,
      raisonNonSignature: d.raisonNonSignature,
    });

    this.acteForm.patchValue({
      pointCollecte: d.pointCollecte,
      dateDressage:  d.dateDressage ? new Date(d.dateDressage) : null,
      heureDressage: d.heureDressage,
      actionsFaire:  d.actionsFaire?.toLowerCase(),
    });
  }

  // ── Champs requis par défaut ──────────────────────────────────────
  private readonly requiredFieldsMap: Record<string, string[]> = {
    // prenom, sexe, dateNaissance restent obligatoires même en mode repris
    enfant:      ['paysNaissance', 'lieuAccouchement'],
    naissance:   ['naissanceMultiple'],
    pere:        ['pereConnu', 'pereDecede', 'prenom', 'nom',
                  'paysNaissancePere', 'regionNaissancePere',
                  'prefectureNaissancePere', 'communeNaissancePere'],
    mere:        ['mereConnue', 'mereDecedee', 'prenom', 'nom',
                  'paysNaissanceMere', 'regionNaissanceMere',
                  'prefectureNaissanceMere', 'communeNaissanceMere'],
    declaration: ['qualite', 'dateDeclaration'],
    acte:        ['dateDressage', 'actionsFaire'],
  };

  private removeAllRequiredValidators(): void {
    const forms: Record<string, FormGroup> = {
      enfant: this.enfantForm, naissance: this.naissanceForm,
      pere: this.pereForm, mere: this.mereForm,
      declaration: this.declarationForm, acte: this.acteForm,
    };
    Object.entries(this.requiredFieldsMap).forEach(([key, fields]) => {
      fields.forEach(f => {
        forms[key].get(f)?.clearValidators();
        forms[key].get(f)?.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  // ── Délai entre date de naissance et date de dressage ─────────────
  get delaiDressageMois(): number {
    const dn = this.enfantForm?.get('dateNaissance')?.value;
    const dd = this.acteForm?.get('dateDressage')?.value;
    if (!dn || !dd) return 0;
    const debut = new Date(dn);
    const fin   = new Date(dd);
    return (fin.getFullYear() - debut.getFullYear()) * 12
         + (fin.getMonth()    - debut.getMonth());
  }

  get retardDressage(): boolean {
    return this.delaiDressageMois > 6;
  }

  // ══════════════════════════════════════════════════════════════════
  //  NPI — VALIDATION DYNAMIQUE
  // ══════════════════════════════════════════════════════════════════

  onPereHasNpiChange(value: string): void {
    const ctrl = this.pereForm.get('npi')!;
    if (value === 'oui') {
      ctrl.setValidators(Validators.required);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  onMereHasNpiChange(value: string): void {
    const ctrl = this.mereForm.get('npi')!;
    if (value === 'oui') {
      ctrl.setValidators(Validators.required);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  get isNonSignature(): boolean {
    const v = this.declarationForm?.get('signatureDeclarant')?.value;
    return v === 'neSachant' || v === 'nePouvant';
  }

  get isDeclarantHasNpi(): boolean {
    return this.declarationForm?.get('hasNpi')?.value === 'oui';
  }

  get isDeclarantNationaliteConnue(): boolean {
    return this.declarationForm?.get('nationaliteConnue')?.value === 'oui';
  }

  onDeclarantHasNpiChange(value: string): void {
    const ctrl = this.declarationForm.get('npi')!;
    if (value === 'oui') {
      ctrl.setValidators(Validators.required);
    } else {
      ctrl.clearValidators();
      ctrl.setValue('');
    }
    ctrl.updateValueAndValidity();
  }

  get isParentsMaries(): boolean {
    return this.mereForm?.get('parentsMaries')?.value === 'oui';
  }

  get isDocumentMariage(): boolean {
    return this.mereForm?.get('documentMariage')?.value === 'oui';
  }

  get isMemeDomicileQuePere(): boolean {
    return this.mereForm?.get('memeDomicileQuePere')?.value === 'oui';
  }

  onMemeDomicileQuePereChange(value: string): void {
    const domicileControls = ['adresse', 'pays', 'regionDomicileMere', 'prefecture', 'commune', 'quartier'];

    if (value === 'oui') {
      // Copier les tableaux géographiques du père
      this.mereRegions     = [...this.pereRegions];
      this.merePrefectures = [...this.perePrefectures];
      this.mereCommunes    = [...this.pereCommunes];
      this.mereQuartiers   = [...this.pereQuartiers];

      // Activer les contrôles pour pouvoir y écrire les valeurs
      domicileControls.forEach(c => this.mereForm.get(c)!.enable());

      // Copier les valeurs du père
      this.mereForm.patchValue({
        adresse:           this.pereForm.get('adresse')?.value ?? '',
        pays:              this.pereForm.get('pays')?.value ?? '',
        regionDomicileMere: this.pereForm.get('regionDomicilePere')?.value ?? '',
        prefecture:        this.pereForm.get('prefecture')?.value ?? '',
        commune:           this.pereForm.get('commune')?.value ?? '',
        quartier:          this.pereForm.get('quartier')?.value ?? '',
      });

      // Désactiver les champs (lecture seule)
      domicileControls.forEach(c => this.mereForm.get(c)!.disable());

    } else {
      // Réinitialiser et réactiver l'adresse et le pays
      this.mereRegions = []; this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
      domicileControls.forEach(c => this.mereForm.get(c)!.disable());
      this.mereForm.get('adresse')!.enable();
      this.mereForm.get('pays')!.enable();
      this.mereForm.patchValue({
        adresse: '', pays: '', regionDomicileMere: '', prefecture: '', commune: '', quartier: '',
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — LIEU DE NAISSANCE (ENFANT)
  // ══════════════════════════════════════════════════════════════════

  onPaysNaissanceChange(code: string): void {
    this.regions = []; this.prefectures = []; this.communes = []; this.quartiers = []; this.villes = [];
    this.enfantForm.patchValue({ regionNaissance: '', prefectureNaissance: '', communeNaissance: '', quartier: '', villeNaissance: '' });
    this.enfantForm.get('regionNaissance')!.disable();
    this.enfantForm.get('prefectureNaissance')!.disable();
    this.enfantForm.get('communeNaissance')!.disable();
    this.enfantForm.get('quartier')!.disable();

    if (!code || code === this.GUINEE_CODE) {
      this.isLoadingRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.regions = data; this.isLoadingRegions = false; this.enfantForm.get('regionNaissance')!.enable(); },
        error: () => this.isLoadingRegions = false,
      });
    } else {
      this.isLoadingVilles = true;
      this.geodata.getVillesByPays(code).subscribe({
        next: data => { this.villes = data; this.isLoadingVilles = false; },
        error: () => this.isLoadingVilles = false,
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
  //  CASCADE — LIEU DE NAISSANCE PÈRE
  // ══════════════════════════════════════════════════════════════════

  onPerePaysNaissanceChange(code: string): void {
    this.pereNaissRegions = []; this.pereNaissPrefectures = [];
    this.pereNaissCommunes = []; this.pereNaissQuartiers = []; this.pereNaissVilles = [];
    this.pereForm.patchValue({
      regionNaissancePere: '', prefectureNaissancePere: '',
      communeNaissancePere: '', quartierNaissancePere: '', villeNaissancePere: '',
    });
    ['regionNaissancePere','prefectureNaissancePere','communeNaissancePere','quartierNaissancePere']
      .forEach(c => this.pereForm.get(c)!.disable());

    if (!code || code === this.GUINEE_CODE) {
      this.isLoadingPereNaissRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.pereNaissRegions = data; this.isLoadingPereNaissRegions = false; this.pereForm.get('regionNaissancePere')!.enable(); },
        error: () => this.isLoadingPereNaissRegions = false,
      });
    } else {
      this.isLoadingPereNaissVilles = true;
      this.geodata.getVillesByPays(code).subscribe({
        next: data => { this.pereNaissVilles = data; this.isLoadingPereNaissVilles = false; },
        error: () => this.isLoadingPereNaissVilles = false,
      });
    }
  }

  onPereRegionNaissanceChange(code: string): void {
    this.pereNaissPrefectures = []; this.pereNaissCommunes = []; this.pereNaissQuartiers = [];
    this.pereForm.patchValue({ prefectureNaissancePere: '', communeNaissancePere: '', quartierNaissancePere: '' });
    ['prefectureNaissancePere','communeNaissancePere','quartierNaissancePere']
      .forEach(c => this.pereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingPereNaissPrefectures = true;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => {
        this.pereNaissPrefectures = data;
        this.isLoadingPereNaissPrefectures = false;
        this.pereForm.get('prefectureNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissPrefectures = false,
    });
  }

  onPerePrefectureNaissanceChange(code: string): void {
    this.pereNaissCommunes = []; this.pereNaissQuartiers = [];
    this.pereForm.patchValue({ communeNaissancePere: '', quartierNaissancePere: '' });
    ['communeNaissancePere','quartierNaissancePere'].forEach(c => this.pereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingPereNaissCommunes = true;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => {
        this.pereNaissCommunes = data;
        this.isLoadingPereNaissCommunes = false;
        this.pereForm.get('communeNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissCommunes = false,
    });
  }

  onPereCommuneNaissanceChange(code: string): void {
    this.pereNaissQuartiers = [];
    this.pereForm.patchValue({ quartierNaissancePere: '' });
    this.pereForm.get('quartierNaissancePere')!.disable();
    if (!code) return;

    this.isLoadingPereNaissQuartiers = true;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => {
        this.pereNaissQuartiers = data;
        this.isLoadingPereNaissQuartiers = false;
        this.pereForm.get('quartierNaissancePere')!.enable();
      },
      error: () => this.isLoadingPereNaissQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE PÈRE
  // ══════════════════════════════════════════════════════════════════

  onPerePaysChange(code: string): void {
    this.pereRegions = []; this.perePrefectures = [];
    this.pereCommunes = []; this.pereQuartiers = [];
    this.pereForm.patchValue({ regionDomicilePere: '', prefecture: '', commune: '', quartier: '' });
    ['regionDomicilePere','prefecture','commune','quartier'].forEach(c => this.pereForm.get(c)!.disable());

    if (code === this.GUINEE_CODE) {
      this.isLoadingPereRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => {
          this.pereRegions = data;
          this.isLoadingPereRegions = false;
          this.pereForm.get('regionDomicilePere')!.enable();
        },
        error: () => this.isLoadingPereRegions = false,
      });
    }
  }

  onPereRegionDomicileChange(code: string): void {
    this.perePrefectures = []; this.pereCommunes = []; this.pereQuartiers = [];
    this.pereForm.patchValue({ prefecture: '', commune: '', quartier: '' });
    ['prefecture','commune','quartier'].forEach(c => this.pereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingPerePrefectures = true;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => {
        this.perePrefectures = data;
        this.isLoadingPerePrefectures = false;
        this.pereForm.get('prefecture')!.enable();
      },
      error: () => this.isLoadingPerePrefectures = false,
    });
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
  //  CASCADE — LIEU DE NAISSANCE MÈRE
  // ══════════════════════════════════════════════════════════════════

  onMerePaysNaissanceChange(code: string): void {
    this.mereNaissRegions = []; this.mereNaissPrefectures = [];
    this.mereNaissCommunes = []; this.mereNaissQuartiers = []; this.mereNaissVilles = [];
    this.mereForm.patchValue({
      regionNaissanceMere: '', prefectureNaissanceMere: '',
      communeNaissanceMere: '', quartierNaissanceMere: '', villeNaissanceMere: '',
    });
    ['regionNaissanceMere','prefectureNaissanceMere','communeNaissanceMere','quartierNaissanceMere']
      .forEach(c => this.mereForm.get(c)!.disable());

    if (!code || code === this.GUINEE_CODE) {
      this.isLoadingMereNaissRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => { this.mereNaissRegions = data; this.isLoadingMereNaissRegions = false; this.mereForm.get('regionNaissanceMere')!.enable(); },
        error: () => this.isLoadingMereNaissRegions = false,
      });
    } else {
      this.isLoadingMereNaissVilles = true;
      this.geodata.getVillesByPays(code).subscribe({
        next: data => { this.mereNaissVilles = data; this.isLoadingMereNaissVilles = false; },
        error: () => this.isLoadingMereNaissVilles = false,
      });
    }
  }

  onMereRegionNaissanceChange(code: string): void {
    this.mereNaissPrefectures = []; this.mereNaissCommunes = []; this.mereNaissQuartiers = [];
    this.mereForm.patchValue({ prefectureNaissanceMere: '', communeNaissanceMere: '', quartierNaissanceMere: '' });
    ['prefectureNaissanceMere','communeNaissanceMere','quartierNaissanceMere']
      .forEach(c => this.mereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingMereNaissPrefectures = true;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => {
        this.mereNaissPrefectures = data;
        this.isLoadingMereNaissPrefectures = false;
        this.mereForm.get('prefectureNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissPrefectures = false,
    });
  }

  onMerePrefectureNaissanceChange(code: string): void {
    this.mereNaissCommunes = []; this.mereNaissQuartiers = [];
    this.mereForm.patchValue({ communeNaissanceMere: '', quartierNaissanceMere: '' });
    ['communeNaissanceMere','quartierNaissanceMere'].forEach(c => this.mereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingMereNaissCommunes = true;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => {
        this.mereNaissCommunes = data;
        this.isLoadingMereNaissCommunes = false;
        this.mereForm.get('communeNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissCommunes = false,
    });
  }

  onMereCommuneNaissanceChange(code: string): void {
    this.mereNaissQuartiers = [];
    this.mereForm.patchValue({ quartierNaissanceMere: '' });
    this.mereForm.get('quartierNaissanceMere')!.disable();
    if (!code) return;

    this.isLoadingMereNaissQuartiers = true;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => {
        this.mereNaissQuartiers = data;
        this.isLoadingMereNaissQuartiers = false;
        this.mereForm.get('quartierNaissanceMere')!.enable();
      },
      error: () => this.isLoadingMereNaissQuartiers = false,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE MÈRE
  // ══════════════════════════════════════════════════════════════════

  onMerePaysChange(code: string): void {
    this.mereRegions = []; this.merePrefectures = [];
    this.mereCommunes = []; this.mereQuartiers = [];
    this.mereForm.patchValue({ regionDomicileMere: '', prefecture: '', commune: '', quartier: '' });
    ['regionDomicileMere','prefecture','commune','quartier'].forEach(c => this.mereForm.get(c)!.disable());

    if (code === this.GUINEE_CODE) {
      this.isLoadingMereRegions = true;
      this.geodata.getAllRegions().subscribe({
        next: data => {
          this.mereRegions = data;
          this.isLoadingMereRegions = false;
          this.mereForm.get('regionDomicileMere')!.enable();
        },
        error: () => this.isLoadingMereRegions = false,
      });
    }
  }

  onMereRegionDomicileChange(code: string): void {
    this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
    this.mereForm.patchValue({ prefecture: '', commune: '', quartier: '' });
    ['prefecture','commune','quartier'].forEach(c => this.mereForm.get(c)!.disable());
    if (!code) return;

    this.isLoadingMerePrefectures = true;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => {
        this.merePrefectures = data;
        this.isLoadingMerePrefectures = false;
        this.mereForm.get('prefecture')!.enable();
      },
      error: () => this.isLoadingMerePrefectures = false,
    });
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
    if (this.isRepris) return true;
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
    if (this.isSaving) return;

    const enfant  = this.enfantForm.getRawValue();
    const naiss   = this.naissanceForm.value;
    const pere    = this.pereForm.getRawValue();
    const mere    = this.mereForm.getRawValue();
    const decl    = this.declarationForm.value;
    const acte    = this.acteForm.value;

    const payload: ActeNaissanceDTO = {
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
      // Naissance
      naissanceMultiple:     naiss.naissanceMultiple,
      typeNaissanceMultiple: naiss.typeNaissanceMultiple,
      rangEnfant:            naiss.rangEnfant,
      rangNaissanceMere:     naiss.rangNaissanceMere,
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
      // Déclarant
      qualiteDeclarant:    decl.qualite,
      dateDeclaration:     decl.dateDeclaration,
      prenomDeclarant:     decl.prenom,
      nomDeclarant:        decl.nom,
      sexeDeclarant:       decl.sexe,
      telephoneDeclarant:  decl.telephone,
      signatureDeclarant:  decl.signatureDeclarant,
      raisonNonSignature:  decl.raisonNonSignature,
      // Acte
      dateDressage:  acte.dateDressage,
      heureDressage: acte.heureDressage,
      pointCollecte: acte.pointCollecte,
      actionsFaire:  acte.actionsFaire,
    };

    this.isSaving = true;

    const save$ = this.isEditMode
      ? this.acteService.updateNaissance(this.editId, payload)
      : this.acteService.createDeclaration(payload);

    save$.subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success(this.isEditMode
          ? 'Acte de naissance modifié avec succès.'
          : 'Acte de naissance enregistré avec succès.');
        this.router.navigate(['/admin/actes']);
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Erreur enregistrement', err);
        this.toast.error('Une erreur est survenue lors de l\'enregistrement.');
      },
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

  _filterProfessions(value: string, sexe: 'M' | 'F'): Profession[] {
    const q = value.toLowerCase();
    return this.professions.filter(p =>
      (sexe === 'F' ? p.feminin : p.masculin).toLowerCase().includes(q)
    );
  }
}
