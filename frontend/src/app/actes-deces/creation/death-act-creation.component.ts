import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, startWith, map } from 'rxjs';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, RegionDTO, PrefectureDTO, QuartierDTO } from '../../models/geodata';
import { ActeNaissanceService, ActeDecesDTO, ActeDecesDetail } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { ProfessionService, Profession } from '../../services/profession.service';
import { NationaliteService, Nationalite } from '../../services/nationalite.service';
import { CauseDecesService, CauseDeces } from '../../services/cause-deces.service';

export interface StepDeces { number: number; label: string; }

@Component({
  selector: 'app-death-act-creation',
  templateUrl: './death-act-creation.component.html',
  styleUrls: [
    '../../actes-naissance/creation/birth-act-creation.component.css',
    './death-act-creation.component.css',
  ],
})
export class DeathActCreationComponent implements OnInit {

  currentStep = 1;
  readonly today = new Date();
  isSaving   = false;
  isEditMode = false;
  editId     = '';

  readonly steps: StepDeces[] = [
    { number: 1, label: 'Défunt' },
    { number: 2, label: 'Parents du défunt' },
    { number: 3, label: 'Décès' },
    { number: 4, label: 'Conjoints' },
    { number: 5, label: 'Déclaration du décès' },
    { number: 6, label: 'Acte' },
  ];

  defuntForm!:      FormGroup;
  parentsForm!:     FormGroup;
  decesForm!:       FormGroup;
  conjointForm!:    FormGroup;
  declarationForm!: FormGroup;
  acteForm!:        FormGroup;

  communes: CommuneDTO[] = [];
  isLoadingCommunes = false;

  // ── Cascades domicile ─────────────────────────────────────────────
  defRegions:     RegionDTO[]     = [];
  defPrefectures: PrefectureDTO[] = [];
  defCommunes:    CommuneDTO[]    = [];
  defQuartiers:   QuartierDTO[]   = [];

  pereRegions:     RegionDTO[]     = [];
  perePrefectures: PrefectureDTO[] = [];
  pereCommunes:    CommuneDTO[]    = [];
  pereQuartiers:   QuartierDTO[]   = [];

  mereRegions:     RegionDTO[]     = [];
  merePrefectures: PrefectureDTO[] = [];
  mereCommunes:    CommuneDTO[]    = [];
  mereQuartiers:   QuartierDTO[]   = [];

  declRegions:     RegionDTO[]     = [];
  declPrefectures: PrefectureDTO[] = [];
  declCommunes:    CommuneDTO[]    = [];
  declQuartiers:   QuartierDTO[]   = [];

  professions:  Profession[]  = [];
  nationalites: Nationalite[] = [];

  filteredProfessionsDefunt$: Observable<Profession[]> | null = null;
  filteredProfessionsPere$:   Observable<Profession[]> | null = null;
  filteredProfessionsMere$:   Observable<Profession[]> | null = null;
  filteredProfessionsDecl$:   Observable<Profession[]> | null = null;

  causesDeces: CauseDeces[] = [];

  // ── Getters défunt ────────────────────────────────────────────────
  get defuntHasNpi():      boolean { return this.defuntForm?.get('hasNpi')?.value === 'oui'; }
  get nationaliteConnue(): boolean { return this.defuntForm?.get('nationaliteConnue')?.value === 'oui'; }
  get defuntSexe():        string  { return this.defuntForm?.get('sexe')?.value ?? 'M'; }
  get conjointSexe():      string  { return this.defuntSexe === 'M' ? 'F' : 'M'; }
  get sexeDeclarantVal():  string  { return this.declarationForm?.get('sexeDeclarant')?.value ?? 'M'; }

  // ── Getters parents ───────────────────────────────────────────────
  get pereHasNpi():           boolean { return this.parentsForm?.get('pereHasNpi')?.value === 'oui'; }
  get pereNatConnue():        boolean { return this.parentsForm?.get('pereNationaliteConnue')?.value === 'oui'; }
  get mereHasNpi():           boolean { return this.parentsForm?.get('mereHasNpi')?.value === 'oui'; }
  get mereNatConnue():        boolean { return this.parentsForm?.get('mereNationaliteConnue')?.value === 'oui'; }
  get mereSameAddress():      boolean { return this.parentsForm?.get('memeDomicilePere')?.value === 'oui'; }

  // ── Getters décès ─────────────────────────────────────────────────
  get dateDecesConnue():  boolean { return this.decesForm?.get('dateDecesConnue')?.value === 'oui'; }
  get decesAuDomicile():  boolean { return this.decesForm?.get('decesAuDomicile')?.value === 'oui'; }

  // ── Getters conjoint ─────────────────────────────────────────────
  get situationMatrim(): string  { return this.conjointForm?.get('situationMatrimoniale')?.value ?? ''; }
  get estMarie():        boolean { return this.situationMatrim === 'marie'; }

  // ── Getters déclarant ─────────────────────────────────────────────
  get hasNpiDeclarant(): boolean { return this.declarationForm?.get('hasNpiDeclarant')?.value === 'oui'; }
  get isNonSignature():  boolean {
    const v = this.declarationForm?.get('signatureDeclarant')?.value;
    return v === 'neSachant' || v === 'nePouvant';
  }

  constructor(
    private fb:             FormBuilder,
    private router:         Router,
    private activatedRoute: ActivatedRoute,
    private geodata:        GeodataService,
    private dialog:         MatDialog,
    private acteService:    ActeNaissanceService,
    private toast:          ToastService,
    private professionSvc:  ProfessionService,
    private nationaliteSvc:  NationaliteService,
    private causeDecesSvc:   CauseDecesService,
  ) {}

  private getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  ngOnInit(): void {
    this.defuntForm = this.fb.group({
      numeroNotification: [''],
      hasNpi:             ['non'],
      npiDefunt:          [''],
      prenom:             ['', Validators.required],
      nom:                ['', Validators.required],
      sexe:               ['', Validators.required],
      dateNaissance:      [null],
      communeNaissance:   [''],
      nationaliteConnue:  ['oui'],
      nationalite:        [''],
      profession:         [''],
      adresseDomicile:       [''],
      regionDomicile:        [''],
      prefectureDomicile:    [{ value: '', disabled: true }],
      communeDomicile:       [{ value: '', disabled: true }],
      quartierDomicile:      [{ value: '', disabled: true }],
      secteurDomicile:       [''],
    });

    this.parentsForm = this.fb.group({
      // Père — identité
      pereDecede:           ['non'],
      pereHasNpi:           ['non'],
      npiPere:              [''],
      prenomPere:           [''],
      nomPere:              [''],
      dateNaissancePere:    [null],
      communeNaissancePere: [''],
      pereNationaliteConnue: ['oui'],
      nationalitePere:      [''],
      professionPere:       [''],
      telephonePere:        [''],
      etatCivilPere:        ['celibataire'],
      // Père — domicile
      adresseDomicilePere:     [''],
      regionDomicilePere:      [''],
      prefectureDomicilePere:  [{ value: '', disabled: true }],
      communeDomicilePere:     [{ value: '', disabled: true }],
      quartierDomicilePere:    [{ value: '', disabled: true }],
      secteurDomicilePere:     [''],
      // Mère — identité
      mereDecedee:           ['non'],
      mereHasNpi:            ['non'],
      npiMere:               [''],
      prenomMere:            [''],
      nomMere:               [''],
      dateNaissanceMere:     [null],
      communeNaissanceMere:  [''],
      mereNationaliteConnue: ['oui'],
      nationaliteMere:       [''],
      professionMere:        [''],
      telephoneMere:         [''],
      etatCivilMere:         ['celibataire'],
      // Mère — domicile
      memeDomicilePere:        ['non'],
      adresseDomicileMere:     [''],
      regionDomicileMere:      [''],
      prefectureDomicileMere:  [{ value: '', disabled: true }],
      communeDomicileMere:     [{ value: '', disabled: true }],
      quartierDomicileMere:    [{ value: '', disabled: true }],
      secteurDomicileMere:     [''],
    });

    this.decesForm = this.fb.group({
      dateDecesConnue: ['oui'],
      dateDeces:       [null, Validators.required],
      heureDeces:      [''],
      decesAuDomicile: ['non'],
      endroitDeces:    [''],
      communeDeces:    ['', Validators.required],
      lieuDeces:       [''],
      causeDeces:      [''],
    });

    this.conjointForm = this.fb.group({
      situationMatrimoniale: ['celibataire'],
      prenomConjoint:        [''],
      nomConjoint:           [''],
      nationaliteConjoint:   [''],
      professionConjoint:    [''],
    });

    this.declarationForm = this.fb.group({
      hasNpiDeclarant:          ['non'],
      npiDeclarant:             [''],
      prenomDeclarant:          [''],
      nomDeclarant:             [''],
      sexeDeclarant:            ['M'],
      dateNaissanceDeclarant:   [null],
      communeNaissanceDeclarant: [''],
      nationaliteDeclarant:     [''],
      professionDeclarant:      [''],
      adresseDeclarant:            [''],
      regionDomicileDeclarant:     [''],
      prefectureDomicileDeclarant: [{ value: '', disabled: true }],
      communeDomicileDeclarant:    [{ value: '', disabled: true }],
      quartierDeclarant:           [{ value: '', disabled: true }],
      secteurDeclarant:            [''],
      lienParente:              [''],
      telephoneDeclarant:       [''],
      situationMatrimDeclarant: ['celibataire'],
      dateDeclaration:          [new Date(), Validators.required],
      signatureDeclarant:       ['oui'],
      raisonNonSignature:       [''],
    });

    this.acteForm = this.fb.group({
      pointCollecte: [''],
      dateDressage:  [new Date(), Validators.required],
      heureDressage: [this.getCurrentTime()],
      actionsFaire:  ['en_cours_saisie', Validators.required],
    });

    this.isLoadingCommunes = true;
    this.geodata.getAllCommunes().subscribe({
      next:  d => { this.communes = d; this.isLoadingCommunes = false; },
      error: () => this.isLoadingCommunes = false,
    });

    this.geodata.getAllRegions().subscribe(data => {
      this.defRegions  = data;
      this.pereRegions = data;
      this.mereRegions = data;
      this.declRegions = data;
    });

    this.professionSvc.getProfessions().subscribe(data => {
      this.professions = data;
      this.filteredProfessionsDefunt$ = this.defuntForm.get('profession')!.valueChanges.pipe(
        startWith(''), map(v => this._filterProf(v || ''))
      );
      this.filteredProfessionsPere$ = this.parentsForm.get('professionPere')!.valueChanges.pipe(
        startWith(''), map(v => this._filterProf(v || ''))
      );
      this.filteredProfessionsMere$ = this.parentsForm.get('professionMere')!.valueChanges.pipe(
        startWith(''), map(v => this._filterProf(v || ''))
      );
      this.filteredProfessionsDecl$ = this.declarationForm.get('professionDeclarant')!.valueChanges.pipe(
        startWith(''), map(v => this._filterProf(v || ''))
      );
    });

    this.nationaliteSvc.getNationalites().subscribe(d => this.nationalites = d);
    this.causeDecesSvc.getCausesDeces().subscribe(d => this.causesDeces = d);

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['mode'] === 'edit' && params['id']) {
        this.isEditMode = true;
        this.editId     = params['id'];
        this.removeRequiredValidators();
        this.acteService.getByIdDeces(this.editId).subscribe({
          next:  d => this.patchForms(d),
          error: () => this.toast.error('Impossible de charger les données de l\'acte.'),
        });
      }
    });
  }

  private patchForms(d: ActeDecesDetail): void {
    this.defuntForm.patchValue({
      numeroNotification: d.numeroNotification, hasNpi: d.hasNpi, npiDefunt: d.npiDefunt,
      prenom: d.prenom, nom: d.nom, sexe: d.sexe,
      dateNaissance:  d.dateNaissance  ? new Date(d.dateNaissance)  : null,
      communeNaissance: d.communeNaissance, nationaliteConnue: d.nationaliteConnue,
      nationalite: d.nationalite, profession: d.profession,
      adresseDomicile: d.adresseDomicile, communeDomicile: d.communeDomicile,
      quartierDomicile: d.quartierDomicile, secteurDomicile: d.secteurDomicile,
    });
    ['prefectureDomicile','communeDomicile','quartierDomicile']
      .forEach(f => this.defuntForm.get(f)?.enable());
    this.parentsForm.patchValue({
      pereDecede: d.pereDecede, pereHasNpi: d.pereHasNpi, npiPere: d.npiPere,
      prenomPere: d.prenomPere, nomPere: d.nomPere,
      dateNaissancePere: d.dateNaissancePere ? new Date(d.dateNaissancePere) : null,
      communeNaissancePere: d.communeNaissancePere, pereNationaliteConnue: d.pereNationaliteConnue,
      nationalitePere: d.nationalitePere, professionPere: d.professionPere,
      telephonePere: d.telephonePere, etatCivilPere: d.etatCivilPere,
      adresseDomicilePere: d.adresseDomicilePere, communeDomicilePere: d.communeDomicilePere,
      quartierDomicilePere: d.quartierDomicilePere, secteurDomicilePere: d.secteurDomicilePere,
      mereDecedee: d.mereDecedee, mereHasNpi: d.mereHasNpi, npiMere: d.npiMere,
      prenomMere: d.prenomMere, nomMere: d.nomMere,
      dateNaissanceMere: d.dateNaissanceMere ? new Date(d.dateNaissanceMere) : null,
      communeNaissanceMere: d.communeNaissanceMere, mereNationaliteConnue: d.mereNationaliteConnue,
      nationaliteMere: d.nationaliteMere, professionMere: d.professionMere,
      telephoneMere: d.telephoneMere, etatCivilMere: d.etatCivilMere,
      memeDomicilePere: d.memeDomicilePere,
      adresseDomicileMere: d.adresseDomicileMere, communeDomicileMere: d.communeDomicileMere,
      quartierDomicileMere: d.quartierDomicileMere, secteurDomicileMere: d.secteurDomicileMere,
    });
    ['prefectureDomicilePere','communeDomicilePere','quartierDomicilePere',
     'prefectureDomicileMere','communeDomicileMere','quartierDomicileMere']
      .forEach(f => this.parentsForm.get(f)?.enable());
    this.decesForm.patchValue({
      dateDecesConnue: d.dateDecesConnue,
      dateDeces:  d.dateDeces  ? new Date(d.dateDeces)  : null,
      heureDeces: d.heureDeces, decesAuDomicile: d.decesAuDomicile,
      endroitDeces: d.endroitDeces, communeDeces: d.communeDeces,
      lieuDeces: d.lieuDeces, causeDeces: d.causeDeces,
    });
    this.conjointForm.patchValue({
      situationMatrimoniale: d.situationMatrimoniale,
      prenomConjoint: d.prenomConjoint, nomConjoint: d.nomConjoint,
      nationaliteConjoint: d.nationaliteConjoint, professionConjoint: d.professionConjoint,
    });
    this.declarationForm.patchValue({
      hasNpiDeclarant: d.hasNpiDeclarant, npiDeclarant: d.npiDeclarant,
      prenomDeclarant: d.prenomDeclarant, nomDeclarant: d.nomDeclarant,
      sexeDeclarant: d.sexeDeclarant,
      dateNaissanceDeclarant: d.dateNaissanceDeclarant ? new Date(d.dateNaissanceDeclarant) : null,
      communeNaissanceDeclarant: d.communeNaissanceDeclarant,
      nationaliteDeclarant: d.nationaliteDeclarant, professionDeclarant: d.professionDeclarant,
      adresseDeclarant: d.adresseDeclarant, communeDomicileDeclarant: d.communeDomicileDeclarant,
      quartierDeclarant: d.quartierDeclarant, secteurDeclarant: d.secteurDeclarant,
      lienParente: d.lienParente, telephoneDeclarant: d.telephoneDeclarant,
      situationMatrimDeclarant: d.situationMatrimDeclarant,
      dateDeclaration: d.dateDeclaration ? new Date(d.dateDeclaration) : null,
      signatureDeclarant: d.signatureDeclarant, raisonNonSignature: d.raisonNonSignature,
    });
    ['prefectureDomicileDeclarant','communeDomicileDeclarant','quartierDeclarant']
      .forEach(f => this.declarationForm.get(f)?.enable());
    this.acteForm.patchValue({
      pointCollecte: d.pointCollecte,
      dateDressage:  d.dateDressage ? new Date(d.dateDressage) : null,
      heureDressage: d.heureDressage, actionsFaire: d.actionsFaire?.toLowerCase(),
    });
  }

  private removeRequiredValidators(): void {
    [
      { form: this.defuntForm,      fields: ['prenom', 'nom', 'sexe'] },
      { form: this.decesForm,       fields: ['dateDeces', 'communeDeces'] },
      { form: this.declarationForm, fields: ['dateDeclaration'] },
      { form: this.acteForm,        fields: ['dateDressage', 'actionsFaire'] },
    ].forEach(({ form, fields }) => {
      fields.forEach(f => { form.get(f)?.clearValidators(); form.get(f)?.updateValueAndValidity({ emitEvent: false }); });
    });
  }

  get currentForm(): FormGroup {
    const map: Record<number, FormGroup> = {
      1: this.defuntForm, 2: this.parentsForm, 3: this.decesForm,
      4: this.conjointForm, 5: this.declarationForm, 6: this.acteForm,
    };
    return map[this.currentStep] ?? this.defuntForm;
  }

  isStepCompleted(n: number): boolean {
    if (n >= this.currentStep) return false;
    const forms: Record<number, FormGroup> = {
      1: this.defuntForm, 2: this.parentsForm, 3: this.decesForm,
      4: this.conjointForm, 5: this.declarationForm,
    };
    return forms[n]?.valid ?? false;
  }

  goTo(step: number): void {
    if (step < this.currentStep || this.isStepCompleted(step - 1) || step === 1) this.currentStep = step;
  }
  goNext(): void { this.currentStep < 6 ? this.currentStep++ : this.enregistrer(); }
  goPrev(): void { if (this.currentStep > 1) this.currentStep--; }

  cancel(): void {
    const dirty = [this.defuntForm, this.parentsForm, this.decesForm,
                   this.conjointForm, this.declarationForm, this.acteForm].some(f => f?.dirty);
    if (dirty) {
      this.dialog.open(ConfirmLeaveDialogComponent, {
        width: '460px', maxWidth: '96vw', disableClose: true,
        panelClass: 'confirm-leave-panel',
      }).afterClosed().subscribe((ok: boolean) => { if (ok) this.router.navigate(['/admin/actes']); });
    } else {
      this.router.navigate(['/admin/actes']);
    }
  }

  enregistrer(): void {
    if (this.isSaving) return;
    const def  = this.defuntForm.getRawValue();
    const par  = this.parentsForm.value;
    const dec  = this.decesForm.value;
    const conj = this.conjointForm.value;
    const decl = this.declarationForm.value;
    const acte = this.acteForm.value;

    const payload: ActeDecesDTO = {
      ...def, ...conj,
      // Parents
      pereDecede: par.pereDecede, pereHasNpi: par.pereHasNpi, npiPere: par.npiPere,
      prenomPere: par.prenomPere, nomPere: par.nomPere, dateNaissancePere: par.dateNaissancePere,
      communeNaissancePere: par.communeNaissancePere, pereNationaliteConnue: par.pereNationaliteConnue,
      nationalitePere: par.nationalitePere, professionPere: par.professionPere,
      telephonePere: par.telephonePere, etatCivilPere: par.etatCivilPere,
      adresseDomicilePere: par.adresseDomicilePere, communeDomicilePere: par.communeDomicilePere,
      quartierDomicilePere: par.quartierDomicilePere, secteurDomicilePere: par.secteurDomicilePere,
      mereDecedee: par.mereDecedee, mereHasNpi: par.mereHasNpi, npiMere: par.npiMere,
      prenomMere: par.prenomMere, nomMere: par.nomMere, dateNaissanceMere: par.dateNaissanceMere,
      communeNaissanceMere: par.communeNaissanceMere, mereNationaliteConnue: par.mereNationaliteConnue,
      nationaliteMere: par.nationaliteMere, professionMere: par.professionMere,
      telephoneMere: par.telephoneMere, etatCivilMere: par.etatCivilMere,
      memeDomicilePere: par.memeDomicilePere, adresseDomicileMere: par.adresseDomicileMere,
      communeDomicileMere: par.communeDomicileMere, quartierDomicileMere: par.quartierDomicileMere,
      secteurDomicileMere: par.secteurDomicileMere,
      // Décès
      dateDecesConnue: dec.dateDecesConnue, dateDeces: dec.dateDeces, heureDeces: dec.heureDeces,
      decesAuDomicile: dec.decesAuDomicile, endroitDeces: dec.endroitDeces,
      communeDeces: dec.communeDeces, lieuDeces: dec.lieuDeces, causeDeces: dec.causeDeces,
      // Déclarant
      hasNpiDeclarant: decl.hasNpiDeclarant, npiDeclarant: decl.npiDeclarant,
      prenomDeclarant: decl.prenomDeclarant, nomDeclarant: decl.nomDeclarant,
      sexeDeclarant: decl.sexeDeclarant, dateNaissanceDeclarant: decl.dateNaissanceDeclarant,
      communeNaissanceDeclarant: decl.communeNaissanceDeclarant,
      nationaliteDeclarant: decl.nationaliteDeclarant, professionDeclarant: decl.professionDeclarant,
      adresseDeclarant: decl.adresseDeclarant, communeDomicileDeclarant: decl.communeDomicileDeclarant,
      quartierDeclarant: decl.quartierDeclarant, secteurDeclarant: decl.secteurDeclarant,
      lienParente: decl.lienParente, telephoneDeclarant: decl.telephoneDeclarant,
      situationMatrimDeclarant: decl.situationMatrimDeclarant,
      dateDeclaration: decl.dateDeclaration,
      signatureDeclarant: decl.signatureDeclarant, raisonNonSignature: decl.raisonNonSignature,
      // Acte
      pointCollecte: acte.pointCollecte, dateDressage: acte.dateDressage,
      heureDressage: acte.heureDressage, actionsFaire: acte.actionsFaire,
    };

    this.isSaving = true;
    const save$ = this.isEditMode
      ? this.acteService.updateDeces(this.editId, payload)
      : this.acteService.createDeclarationDeces(payload);

    save$.subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success(this.isEditMode ? 'Acte de décès modifié.' : 'Acte de décès enregistré.');
        this.router.navigate(['/admin/actes']);
      },
      error: err => {
        this.isSaving = false;
        console.error('Erreur enregistrement décès', err);
        this.toast.error('Une erreur est survenue lors de l\'enregistrement.');
      },
    });
  }

  onDateDecesConnueChange(value: string): void {
    const ctrl = this.decesForm.get('dateDeces')!;
    if (value === 'non') { ctrl.clearValidators(); ctrl.setValue(null); }
    else { ctrl.setValidators(Validators.required); }
    ctrl.updateValueAndValidity();
  }

  _filterProf(value: string): Profession[] {
    const q = value.toLowerCase();
    return this.professions.filter(p =>
      p.masculin.toLowerCase().includes(q) || p.feminin.toLowerCase().includes(q)
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE DÉFUNT
  // ══════════════════════════════════════════════════════════════════
  onDefRegionChange(code: string): void {
    this.defPrefectures = []; this.defCommunes = []; this.defQuartiers = [];
    this.defuntForm.patchValue({ prefectureDomicile: '', communeDomicile: '', quartierDomicile: '' });
    this.defuntForm.get('prefectureDomicile')!.disable();
    this.defuntForm.get('communeDomicile')!.disable();
    this.defuntForm.get('quartierDomicile')!.disable();
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.defPrefectures = data; this.defuntForm.get('prefectureDomicile')!.enable(); },
    });
  }
  onDefPrefectureChange(code: string): void {
    this.defCommunes = []; this.defQuartiers = [];
    this.defuntForm.patchValue({ communeDomicile: '', quartierDomicile: '' });
    this.defuntForm.get('communeDomicile')!.disable();
    this.defuntForm.get('quartierDomicile')!.disable();
    if (!code) return;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => { this.defCommunes = data; this.defuntForm.get('communeDomicile')!.enable(); },
    });
  }
  onDefCommuneChange(code: string): void {
    this.defQuartiers = [];
    this.defuntForm.patchValue({ quartierDomicile: '' });
    this.defuntForm.get('quartierDomicile')!.disable();
    if (!code) return;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => { this.defQuartiers = data; this.defuntForm.get('quartierDomicile')!.enable(); },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE PÈRE
  // ══════════════════════════════════════════════════════════════════
  onPereRegionChange(code: string): void {
    this.perePrefectures = []; this.pereCommunes = []; this.pereQuartiers = [];
    this.parentsForm.patchValue({ prefectureDomicilePere: '', communeDomicilePere: '', quartierDomicilePere: '' });
    this.parentsForm.get('prefectureDomicilePere')!.disable();
    this.parentsForm.get('communeDomicilePere')!.disable();
    this.parentsForm.get('quartierDomicilePere')!.disable();
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.perePrefectures = data; this.parentsForm.get('prefectureDomicilePere')!.enable(); },
    });
  }
  onPerePrefectureChange(code: string): void {
    this.pereCommunes = []; this.pereQuartiers = [];
    this.parentsForm.patchValue({ communeDomicilePere: '', quartierDomicilePere: '' });
    this.parentsForm.get('communeDomicilePere')!.disable();
    this.parentsForm.get('quartierDomicilePere')!.disable();
    if (!code) return;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => { this.pereCommunes = data; this.parentsForm.get('communeDomicilePere')!.enable(); },
    });
  }
  onPereCommuneChange(code: string): void {
    this.pereQuartiers = [];
    this.parentsForm.patchValue({ quartierDomicilePere: '' });
    this.parentsForm.get('quartierDomicilePere')!.disable();
    if (!code) return;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => { this.pereQuartiers = data; this.parentsForm.get('quartierDomicilePere')!.enable(); },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE MÈRE
  // ══════════════════════════════════════════════════════════════════
  onMereRegionChange(code: string): void {
    this.merePrefectures = []; this.mereCommunes = []; this.mereQuartiers = [];
    this.parentsForm.patchValue({ prefectureDomicileMere: '', communeDomicileMere: '', quartierDomicileMere: '' });
    this.parentsForm.get('prefectureDomicileMere')!.disable();
    this.parentsForm.get('communeDomicileMere')!.disable();
    this.parentsForm.get('quartierDomicileMere')!.disable();
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.merePrefectures = data; this.parentsForm.get('prefectureDomicileMere')!.enable(); },
    });
  }
  onMerePrefectureChange(code: string): void {
    this.mereCommunes = []; this.mereQuartiers = [];
    this.parentsForm.patchValue({ communeDomicileMere: '', quartierDomicileMere: '' });
    this.parentsForm.get('communeDomicileMere')!.disable();
    this.parentsForm.get('quartierDomicileMere')!.disable();
    if (!code) return;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => { this.mereCommunes = data; this.parentsForm.get('communeDomicileMere')!.enable(); },
    });
  }
  onMereCommuneChange(code: string): void {
    this.mereQuartiers = [];
    this.parentsForm.patchValue({ quartierDomicileMere: '' });
    this.parentsForm.get('quartierDomicileMere')!.disable();
    if (!code) return;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => { this.mereQuartiers = data; this.parentsForm.get('quartierDomicileMere')!.enable(); },
    });
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE DÉCLARANT
  // ══════════════════════════════════════════════════════════════════
  onDeclRegionChange(code: string): void {
    this.declPrefectures = []; this.declCommunes = []; this.declQuartiers = [];
    this.declarationForm.patchValue({ prefectureDomicileDeclarant: '', communeDomicileDeclarant: '', quartierDeclarant: '' });
    this.declarationForm.get('prefectureDomicileDeclarant')!.disable();
    this.declarationForm.get('communeDomicileDeclarant')!.disable();
    this.declarationForm.get('quartierDeclarant')!.disable();
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.declPrefectures = data; this.declarationForm.get('prefectureDomicileDeclarant')!.enable(); },
    });
  }
  onDeclPrefectureChange(code: string): void {
    this.declCommunes = []; this.declQuartiers = [];
    this.declarationForm.patchValue({ communeDomicileDeclarant: '', quartierDeclarant: '' });
    this.declarationForm.get('communeDomicileDeclarant')!.disable();
    this.declarationForm.get('quartierDeclarant')!.disable();
    if (!code) return;
    this.geodata.getCommunesByPrefecture(code).subscribe({
      next: data => { this.declCommunes = data; this.declarationForm.get('communeDomicileDeclarant')!.enable(); },
    });
  }
  onDeclCommuneChange(code: string): void {
    this.declQuartiers = [];
    this.declarationForm.patchValue({ quartierDeclarant: '' });
    this.declarationForm.get('quartierDeclarant')!.disable();
    if (!code) return;
    this.geodata.getQuartiersByCommune(code).subscribe({
      next: data => { this.declQuartiers = data; this.declarationForm.get('quartierDeclarant')!.enable(); },
    });
  }
}
