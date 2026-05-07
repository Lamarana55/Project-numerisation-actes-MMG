import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Observable, startWith, map } from 'rxjs';
import { ConfirmLeaveDialogComponent } from '../../shared/confirm-leave-dialog/confirm-leave-dialog.component';
import { GeodataService } from '../../services/geodata.service';
import { CommuneDTO, RegionDTO, PrefectureDTO, QuartierDTO } from '../../models/geodata';
import { ActeNaissanceService, ActeDecesDTO } from '../../services/acte-naissance.service';
import { ToastService } from '../../services/toast.service';
import { ProfessionService, Profession } from '../../services/profession.service';
import { NationaliteService, Nationalite } from '../../services/nationalite.service';
import { CauseDecesService, CauseDeces } from '../../services/cause-deces.service';

export interface StepDecesTranscription { number: number; label: string; }

@Component({
  selector: 'app-death-act-transcription',
  templateUrl: './death-act-transcription.component.html',
  styleUrls: [
    '../../actes-naissance/creation/birth-act-creation.component.css',
    '../creation/death-act-creation.component.css',
  ],
})
export class DeathActTranscriptionComponent implements OnInit {

  currentStep = 1;
  readonly today = new Date();
  isSaving = false;

  readonly steps: StepDecesTranscription[] = [
    { number: 1, label: 'Jugement' },
    { number: 2, label: 'Défunt' },
    { number: 3, label: 'Parents du défunt' },
    { number: 4, label: 'Décès' },
    { number: 5, label: 'Conjoints' },
    { number: 6, label: 'Transcription' },
  ];

  jugementForm!:      FormGroup;
  defuntForm!:        FormGroup;
  parentsForm!:       FormGroup;
  decesForm!:         FormGroup;
  conjointForm!:      FormGroup;
  transcriptionForm!: FormGroup;

  communes: CommuneDTO[] = [];

  // ── Cascades domicile défunt ──────────────────────────────────────
  defRegions:     RegionDTO[]     = [];
  defPrefectures: PrefectureDTO[] = [];
  defCommunes:    CommuneDTO[]    = [];
  defQuartiers:   QuartierDTO[]   = [];

  // ── Cascades domicile père ────────────────────────────────────────
  pereRegions:     RegionDTO[]     = [];
  perePrefectures: PrefectureDTO[] = [];
  pereCommunes:    CommuneDTO[]    = [];
  pereQuartiers:   QuartierDTO[]   = [];

  // ── Cascades domicile mère ────────────────────────────────────────
  mereRegions:     RegionDTO[]     = [];
  merePrefectures: PrefectureDTO[] = [];
  mereCommunes:    CommuneDTO[]    = [];
  mereQuartiers:   QuartierDTO[]   = [];

  // ── Cascades domicile déclarant ───────────────────────────────────
  declRegions:     RegionDTO[]     = [];
  declPrefectures: PrefectureDTO[] = [];
  declCommunes:    CommuneDTO[]    = [];
  declQuartiers:   QuartierDTO[]   = [];

  professions:  Profession[]  = [];
  nationalites: Nationalite[] = [];

  filteredProfessionsDefunt$: Observable<Profession[]> | null = null;
  filteredProfessionsPere$:   Observable<Profession[]> | null = null;
  filteredProfessionsMere$:   Observable<Profession[]> | null = null;

  causesDeces: CauseDeces[] = [];

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

  // ── Getters défunt ────────────────────────────────────────────────
  get defuntHasNpi():      boolean { return this.defuntForm?.get('hasNpi')?.value === 'oui'; }
  get nationaliteConnue(): boolean { return this.defuntForm?.get('nationaliteConnue')?.value === 'oui'; }
  get defuntSexe():        string  { return this.defuntForm?.get('sexe')?.value ?? 'M'; }
  get conjointSexe():      string  { return this.defuntSexe === 'M' ? 'F' : 'M'; }

  // ── Getters parents ───────────────────────────────────────────────
  get pereHasNpi():      boolean { return this.parentsForm?.get('pereHasNpi')?.value === 'oui'; }
  get pereNatConnue():   boolean { return this.parentsForm?.get('pereNationaliteConnue')?.value === 'oui'; }
  get mereHasNpi():      boolean { return this.parentsForm?.get('mereHasNpi')?.value === 'oui'; }
  get mereNatConnue():   boolean { return this.parentsForm?.get('mereNationaliteConnue')?.value === 'oui'; }
  get mereSameAddress(): boolean { return this.parentsForm?.get('memeDomicilePere')?.value === 'oui'; }

  // ── Getters décès ─────────────────────────────────────────────────
  get dateDecesConnue(): boolean { return this.decesForm?.get('dateDecesConnue')?.value === 'oui'; }
  get decesAuDomicile(): boolean { return this.decesForm?.get('decesAuDomicile')?.value === 'oui'; }

  // ── Getters conjoint ──────────────────────────────────────────────
  get situationMatrim(): string  { return this.conjointForm?.get('situationMatrimoniale')?.value ?? ''; }
  get estMarie():        boolean { return this.situationMatrim === 'marie'; }

  // ── Délai jugement → transcription ───────────────────────────────
  get delaiMois(): number {
    const dj = this.jugementForm?.get('dateJugement')?.value;
    const dt = this.transcriptionForm?.get('dateInscription')?.value;
    if (!dj || !dt) return 0;
    const debut = new Date(dj);
    const fin   = new Date(dt);
    return (fin.getFullYear() - debut.getFullYear()) * 12 + (fin.getMonth() - debut.getMonth());
  }
  get retardTranscription(): boolean { return this.delaiMois > 6; }

  constructor(
    private fb:            FormBuilder,
    private router:        Router,
    private geodata:       GeodataService,
    private dialog:        MatDialog,
    private acteService:   ActeNaissanceService,
    private toast:         ToastService,
    private professionSvc: ProfessionService,
    private nationaliteSvc:  NationaliteService,
    private causeDecesSvc:   CauseDecesService,
  ) {}

  private getCurrentTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  ngOnInit(): void {
    this.jugementForm = this.fb.group({
      dateJugement:   [null, Validators.required],
      tribunal:       ['', Validators.required],
      numeroJugement: ['', Validators.required],
    });

    this.defuntForm = this.fb.group({
      hasNpi:            ['non'],
      npiDefunt:         [''],
      prenom:            ['', Validators.required],
      nom:               ['', Validators.required],
      sexe:              ['', Validators.required],
      dateNaissance:     [null],
      communeNaissance:  [''],
      nationaliteConnue: ['oui'],
      nationalite:       [''],
      profession:        [''],
      adresseDomicile:      [''],
      regionDomicile:       [''],
      prefectureDomicile:   [{ value: '', disabled: true }],
      communeDomicile:      [{ value: '', disabled: true }],
      quartierDomicile:     [{ value: '', disabled: true }],
      secteurDomicile:      [''],
    });

    this.parentsForm = this.fb.group({
      // Père
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
      adresseDomicilePere:     [''],
      regionDomicilePere:      [''],
      prefectureDomicilePere:  [{ value: '', disabled: true }],
      communeDomicilePere:     [{ value: '', disabled: true }],
      quartierDomicilePere:    [{ value: '', disabled: true }],
      secteurDomicilePere:     [''],
      // Mère
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

    this.transcriptionForm = this.fb.group({
      dateInscription:  [new Date(), Validators.required],
      heureInscription: [this.getCurrentTime()],
      actionsFaire:     ['en_cours_saisie', Validators.required],
    });

    this.geodata.getAllCommunes().subscribe(d => this.communes = d);

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
    });

    this.nationaliteSvc.getNationalites().subscribe(d => this.nationalites = d);
    this.causeDecesSvc.getCausesDeces().subscribe(d => this.causesDeces = d);
  }

  // ══════════════════════════════════════════════════════════════════
  //  CASCADE — DOMICILE DÉFUNT
  // ══════════════════════════════════════════════════════════════════
  onDefRegionChange(code: string): void {
    this.defPrefectures = []; this.defCommunes = []; this.defQuartiers = [];
    this.defuntForm.patchValue({ prefectureDomicile: '', communeDomicile: '', quartierDomicile: '' });
    ['prefectureDomicile','communeDomicile','quartierDomicile'].forEach(f => this.defuntForm.get(f)!.disable());
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.defPrefectures = data; this.defuntForm.get('prefectureDomicile')!.enable(); },
    });
  }
  onDefPrefectureChange(code: string): void {
    this.defCommunes = []; this.defQuartiers = [];
    this.defuntForm.patchValue({ communeDomicile: '', quartierDomicile: '' });
    ['communeDomicile','quartierDomicile'].forEach(f => this.defuntForm.get(f)!.disable());
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
    ['prefectureDomicilePere','communeDomicilePere','quartierDomicilePere'].forEach(f => this.parentsForm.get(f)!.disable());
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.perePrefectures = data; this.parentsForm.get('prefectureDomicilePere')!.enable(); },
    });
  }
  onPerePrefectureChange(code: string): void {
    this.pereCommunes = []; this.pereQuartiers = [];
    this.parentsForm.patchValue({ communeDomicilePere: '', quartierDomicilePere: '' });
    ['communeDomicilePere','quartierDomicilePere'].forEach(f => this.parentsForm.get(f)!.disable());
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
    ['prefectureDomicileMere','communeDomicileMere','quartierDomicileMere'].forEach(f => this.parentsForm.get(f)!.disable());
    if (!code) return;
    this.geodata.getPrefecturesByRegion(code).subscribe({
      next: data => { this.merePrefectures = data; this.parentsForm.get('prefectureDomicileMere')!.enable(); },
    });
  }
  onMerePrefectureChange(code: string): void {
    this.mereCommunes = []; this.mereQuartiers = [];
    this.parentsForm.patchValue({ communeDomicileMere: '', quartierDomicileMere: '' });
    ['communeDomicileMere','quartierDomicileMere'].forEach(f => this.parentsForm.get(f)!.disable());
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
  //  NAVIGATION
  // ══════════════════════════════════════════════════════════════════
  get currentForm(): FormGroup {
    const map: Record<number, FormGroup> = {
      1: this.jugementForm, 2: this.defuntForm, 3: this.parentsForm,
      4: this.decesForm, 5: this.conjointForm, 6: this.transcriptionForm,
    };
    return map[this.currentStep] ?? this.jugementForm;
  }

  isStepCompleted(n: number): boolean {
    if (n >= this.currentStep) return false;
    const forms: Record<number, FormGroup> = {
      1: this.jugementForm, 2: this.defuntForm, 3: this.parentsForm,
      4: this.decesForm, 5: this.conjointForm,
    };
    return forms[n]?.valid ?? false;
  }

  goTo(step: number): void {
    if (step < this.currentStep || this.isStepCompleted(step - 1) || step === 1) this.currentStep = step;
  }
  goNext(): void { this.currentStep < 6 ? this.currentStep++ : this.enregistrer(); }
  goPrev(): void { if (this.currentStep > 1) this.currentStep--; }

  cancel(): void {
    const dirty = [this.jugementForm, this.defuntForm, this.parentsForm,
                   this.decesForm, this.conjointForm, this.transcriptionForm].some(f => f?.dirty);
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
    const jug  = this.jugementForm.value;
    const def  = this.defuntForm.getRawValue();
    const par  = this.parentsForm.value;
    const dec  = this.decesForm.value;
    const conj = this.conjointForm.value;
    const trans = this.transcriptionForm.value;

    const payload: ActeDecesDTO = {
      // Jugement
      dateJugement: jug.dateJugement, tribunal: jug.tribunal, numeroJugement: jug.numeroJugement,
      // Défunt
      hasNpi: def.hasNpi, npiDefunt: def.npiDefunt,
      prenom: def.prenom, nom: def.nom, sexe: def.sexe,
      dateNaissance: def.dateNaissance, communeNaissance: def.communeNaissance,
      nationaliteConnue: def.nationaliteConnue, nationalite: def.nationalite, profession: def.profession,
      adresseDomicile: def.adresseDomicile, communeDomicile: def.communeDomicile,
      quartierDomicile: def.quartierDomicile, secteurDomicile: def.secteurDomicile,
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
      // Conjoints
      situationMatrimoniale: conj.situationMatrimoniale,
      prenomConjoint: conj.prenomConjoint, nomConjoint: conj.nomConjoint,
      nationaliteConjoint: conj.nationaliteConjoint, professionConjoint: conj.professionConjoint,
      // Transcription
      dateDeclaration: trans.dateInscription,
      heureDressage:   trans.heureInscription,
      actionsFaire:    trans.actionsFaire,
    };

    this.isSaving = true;
    this.acteService.createTranscriptionDeces(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Transcription de décès enregistrée avec succès.');
        this.router.navigate(['/admin/actes']);
      },
      error: err => {
        this.isSaving = false;
        console.error('Erreur transcription décès', err);
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
}
