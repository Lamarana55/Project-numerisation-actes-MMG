import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { startWith } from 'rxjs';

import { GeodataService } from '../services/geodata.service';

import {
  PaysDTO,
  PrefectureDTO,
  CommuneDTO,
  QuartierDTO,
  VilleDTO,
  RegionDTO,
} from '../models/geodata';
import { ToastComponent } from '../shared/toast/toast.component';

@Component({
  selector: 'app-simulation',
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
})
export class SimulationComponent implements OnInit {
  // FormGroups pour chaque étape
  enfantFormGroup!: FormGroup;
  pereFormGroup!: FormGroup;
  mereFormGroup!: FormGroup;

  // Variables pour le NPI
  npiGenere: string = '';
  npiDetails: any = null;
  isLinear = true;

  PAYS_LIST: PaysDTO[] = [];
  villes: VilleDTO[] = [];
  prefectures: PrefectureDTO[] = [];
  communes: CommuneDTO[] = [];
  quartiers: QuartierDTO[] = [];

  communesFiltrees: CommuneDTO[] = [];
  quartiersFiltres: QuartierDTO[] = [];
  villesFiltres: VilleDTO[] = [];

  regions: RegionDTO[] = [];
  prefecturesGroupees: Map<string, PrefectureDTO[]> = new Map();

  paysFiltres: PaysDTO[] = [];

  // État de chargement
  isLoading = false;
  loadingError: string | null = null;

  maxDate = new Date();
  numeroAleatoire: string = '';
  cleControle: string = '';
  showNPIConstruction = false;

  npiParts = {
    sexe: '',
    annee: '',
    mois: '',
    region: '',
    pays: '',
    prefecture: '',
    commune: '',
    quartier: '',
  };

  constructionProgress = 0;

  // ✅ INJECTION DU SERVICE
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private geodataService: GeodataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData(); // 👈 Charger les données au démarrage
  }

  // ✅ NOUVELLE MÉTHODE: Charger les données initiales
  loadInitialData(): void {
    this.isLoading = true;
    this.loadingError = null;

    // Charger tous les pays (données utilisées pour tous les types de NPI)
    this.geodataService.getAllPays().subscribe({
      next: (pays) => {
        this.PAYS_LIST = pays;
        this.paysFiltres = pays;
        console.log('✅ Pays chargés:', pays.length);
      },
      error: (error) => {
        this.loadingError = 'Erreur de chargement des pays';
        this.showError('Impossible de charger les pays');
        console.error('❌ Erreur:', error);
      },
    });

    // Charger toutes les préfectures (pour le type 1)
    this.geodataService.getAllRegions().subscribe({
      next: (regions) => {
        this.regions = regions;
        // Charger les préfectures pour chaque région
        regions.forEach((region) => {
          this.geodataService.getPrefecturesByRegion(region.code).subscribe({
            next: (prefs) => {
              this.prefectures = [...this.prefectures, ...prefs];
              this.prefecturesGroupees.set(region.nom, prefs); // ✅ NOUVELLE LIGNE
            },
          });
        });
        console.log('✅ Préfectures chargées');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  initializeForms(): void {
    // Formulaire de l'enfant
    this.enfantFormGroup = this.fb.group({
      typeNPI: ['', Validators.required],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      sexe: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      pays: [''],
      ville: [''],
      prefecture: [''],
      commune: [{ value: '', disabled: true }],
      quartier: [{ value: '', disabled: true }],
    });

    // Validation conditionnelle selon le type de NPI
    const controls = {
      pays: this.enfantFormGroup.get('pays'),
      prefecture: this.enfantFormGroup.get('prefecture'),
      commune: this.enfantFormGroup.get('commune'),
      quartier: this.enfantFormGroup.get('quartier'),
    };

    const rules: Record<string, (keyof typeof controls)[]> = {
      '1': ['prefecture', 'commune', 'quartier'],
      '2': ['pays'],
      '3': ['pays'],
      '4': ['pays'],
    };

    this.enfantFormGroup
      .get('typeNPI')
      ?.valueChanges.subscribe((type: string) => {
        Object.values(controls).forEach((ctrl) =>
          this.setRequired(ctrl, false),
        );
        (rules[type] ?? []).forEach((field) => {
          this.setRequired(controls[field], true);
        });
      });

    // Formulaire du père
    this.pereFormGroup = this.fb.group({
      prenomPere: ['', [Validators.required, Validators.minLength(2)]],
      nomPere: ['', [Validators.required, Validators.minLength(2)]],
      dateNaissancePere: [''],
      professionPere: [''],
      nationalitePere: ['Guinéenne', Validators.required],
      adressePere: [''],
      telephonePere: ['', [Validators.pattern('^[0-9]{8,12}$')]],
    });

    // Formulaire de la mère
    this.mereFormGroup = this.fb.group({
      prenomMere: ['', [Validators.required, Validators.minLength(2)]],
      nomMere: ['', [Validators.required, Validators.minLength(2)]],
      dateNaissanceMere: [''],
      professionMere: [''],
      nationaliteMere: ['Guinéenne', Validators.required],
      adresseMere: [''],
      telephoneMere: ['', [Validators.pattern('^[0-9]{8,12}$')]],
    });

    // ✅ ÉCOUTER LES CHANGEMENTS ET CHARGER LES DONNÉES
    this.setupFormListeners();
  }

  // ✅ NOUVELLE MÉTHODE: Configuration des écouteurs
  setupFormListeners(): void {
    // Écouter les changements de préfecture
    this.enfantFormGroup
      .get('prefecture')
      ?.valueChanges.subscribe((prefectureCode) => {
        if (prefectureCode) {
          this.onPrefectureChange(prefectureCode);
        }
      });

    // Écouter les changements de commune
    this.enfantFormGroup
      .get('commune')
      ?.valueChanges.subscribe((communeCode) => {
        if (communeCode) {
          this.onCommuneChange(communeCode);
        }
      });

    // Écouter les changements de pays
    this.enfantFormGroup.get('pays')?.valueChanges.subscribe((pays) => {
      if (pays && pays.code) {
        this.onPaysChange(pays.code);
      }
    });

    // Écouter tous les changements pour la construction du NPI
    this.enfantFormGroup.valueChanges.subscribe(() => {
      this.updateNPIConstruction();
    });

    // Générer le numéro aléatoire à la sélection du type
    this.enfantFormGroup.get('typeNPI')?.valueChanges.subscribe((typeNPI) => {
      if (typeNPI) {
        this.showNPIConstruction = true;
        // this.genererNumeroAleatoire(typeNPI);
        // Précharger les formulaires selon le type
        this.prechargerFormulaires(typeNPI);
      }
    });

    // Générer la clé de contrôle après validation du formulaire mère
    this.mereFormGroup.statusChanges
      .pipe(startWith(this.mereFormGroup.status))
      .subscribe((status) => {
        if (status === 'VALID' && !this.cleControle) {
          // this.genererCleControle();
        }
      });
  }

  // ✅ MÉTHODE MODIFIÉE: Changement de préfecture avec appel API
  onPrefectureChange(prefectureCode: string): void {
    const communeControl = this.enfantFormGroup.get('commune');

    if (prefectureCode) {
      communeControl?.enable();

      // 👉 APPEL API pour charger les communes
      this.geodataService.getCommunesByPrefecture(prefectureCode).subscribe({
        next: (communes) => {
          this.communesFiltrees = communes;
          console.log(
            `✅ ${communes.length} communes chargées pour ${prefectureCode}`,
          );
        },
        error: (error) => {
          this.showError('Erreur de chargement des communes');
          console.error('❌ Erreur:', error);
        },
      });
    } else {
      communeControl?.disable();
      communeControl?.reset();
    }

    this.enfantFormGroup.get('commune')?.setValue('');
    this.enfantFormGroup.get('quartier')?.setValue('');
    this.quartiersFiltres = [];
  }

  // ✅ MÉTHODE MODIFIÉE: Changement de commune avec appel API
  onCommuneChange(communeCode: string): void {
    const quartierControl = this.enfantFormGroup.get('quartier');

    if (communeCode) {
      quartierControl?.enable();

      // 👉 APPEL API pour charger les quartiers
      this.geodataService.getQuartiersByCommune(communeCode).subscribe({
        next: (quartiers) => {
          this.quartiersFiltres = quartiers;
          console.log(
            `✅ ${quartiers.length} quartiers chargés pour ${communeCode}`,
          );
        },
        error: (error) => {
          this.showError('Erreur de chargement des quartiers');
          console.error('❌ Erreur:', error);
        },
      });
    } else {
      quartierControl?.disable();
      quartierControl?.reset();
    }

    this.enfantFormGroup.get('quartier')?.setValue('');
  }

  // ✅ MÉTHODE MODIFIÉE: Changement de pays avec appel API
  onPaysChange(paysCode: string): void {
    if (!paysCode) return;

    // 👉 APPEL API pour charger les villes
    this.geodataService.getVillesByPays(paysCode).subscribe({
      next: (villes) => {
        this.villesFiltres = villes;
        console.log(`✅ ${villes.length} villes chargées pour ${paysCode}`);
      },
      error: (error) => {
        this.showError('Erreur de chargement des villes');
        console.error('❌ Erreur:', error);
      },
    });

    this.enfantFormGroup.get('ville')?.setValue('');
  }

  effacerPays(): void {
    this.enfantFormGroup.get('pays')?.setValue(null);
    this.paysFiltres = [...this.PAYS_LIST];
  }

  // ... [Le reste des méthodes reste identique]

  genererNPI(): void {
    if (
      !this.enfantFormGroup.valid ||
      !this.pereFormGroup.valid ||
      !this.mereFormGroup.valid
    ) {
      this.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const enfantData = this.enfantFormGroup.value;
    const typeNPI = enfantData.typeNPI;
    const sexe = this.npiParts.sexe;
    const annee = this.npiParts.annee;
    const mois = this.npiParts.mois;

    let npiSansCle = '';

    switch (typeNPI) {
      case '1':
        const prefecture = enfantData.prefecture;
        let commune = '';
        let quartier = '';

        if (enfantData.quartier && enfantData.quartier.length === 4) {
          commune = enfantData.quartier.substring(0, 2);
          quartier = enfantData.quartier.substring(2, 4);
        }

        npiSansCle = `${sexe}${annee}${mois}${prefecture}${commune}${quartier}${this.numeroAleatoire}`;
        break;

      case '2':
        const pays2 = this.getPaysInfo(enfantData.pays);
        const codeRegion2 = pays2?.codeRegion || '000';
        const codePays2 = enfantData.pays.code || 'XXX';

        npiSansCle = `${sexe}${annee}${mois}${codeRegion2}${codePays2}${this.numeroAleatoire}`;
        break;

      case '3':
        const pays3 = this.getPaysInfo(enfantData.pays);
        const codePays3 = enfantData.pays.code || 'XXX';
        const codeRegion3 = pays3?.codeRegion || '000';

        npiSansCle = `${sexe}${annee}${mois}${codePays3}${codeRegion3}${this.numeroAleatoire}`;
        break;

      case '4':
        const pays4 = this.getPaysInfo(enfantData.pays);
        const codeNumerique4 = pays4?.codeNumerique || '000';
        const codeRegion4 = pays4?.codeRegion || '000';

        npiSansCle = `${sexe}${annee}${mois}${codeNumerique4}${codeRegion4}${this.numeroAleatoire}`;
        break;
    }

    this.cleControle = this.calculerCleControles(npiSansCle);
    this.npiGenere = `${npiSansCle}${this.cleControle}`;

    this.npiDetails = {
      type: this.getTypeNPILabel(typeNPI),
      sexe: sexe === '1' ? 'Masculin' : 'Féminin',
      anneeNaissance: `20${annee}`,
      moisNaissance: this.getNomMois(parseInt(mois)),
      numeroAleatoire: this.numeroAleatoire,
      cleControle: this.cleControle,
    };

    this.showSuccess('NPI généré avec succès !');
  }

  genererCleControle(): void {
    const enfantData = this.enfantFormGroup.value;
    const typeNPI = enfantData.typeNPI;

    if (
      !enfantData.dateNaissance ||
      !enfantData.sexe ||
      !this.numeroAleatoire
    ) {
      return;
    }

    const dateNaissance = new Date(enfantData.dateNaissance);
    const sexe = enfantData.sexe;
    const annee = dateNaissance.getFullYear().toString().slice(-2);
    const mois = ('0' + (dateNaissance.getMonth() + 1)).slice(-2);
    let npiSansCle = '';

    switch (typeNPI) {
      case '1':
        if (
          enfantData.prefecture &&
          enfantData.quartier &&
          enfantData.quartier.length === 4
        ) {
          const prefecture = enfantData.prefecture;
          const commune = enfantData.quartier.substring(0, 2);
          const quartier = enfantData.quartier.substring(2, 4);
          npiSansCle = `${sexe}${annee}${mois}${prefecture}${commune}${quartier}${this.numeroAleatoire}`;
        }
        break;

      case '2':
        if (enfantData.pays) {
          const pays = this.getPaysInfo(enfantData.pays);
          const codeRegion = pays?.codeRegion || '000';
          const codePays = enfantData.pays.code;
          npiSansCle = `${sexe}${annee}${mois}${codeRegion}${codePays}${this.numeroAleatoire}`;
        }
        break;

      case '3':
        if (enfantData.pays) {
          const pays = this.getPaysInfo(enfantData.pays);
          const codePays = enfantData.pays.code;
          const codeRegion = pays?.codeRegion || '000';
          npiSansCle = `${sexe}${annee}${mois}${codePays}${codeRegion}${this.numeroAleatoire}`;
        }
        break;

      case '4':
        if (enfantData.pays) {
          const pays = this.getPaysInfo(enfantData.pays);
          const codeNumerique = pays?.codeNumerique || '000';
          const codeRegion = pays?.codeRegion || '000';
          npiSansCle = `${sexe}${annee}${mois}${codeNumerique}${codeRegion}${this.numeroAleatoire}`;
        }
        break;
    }

    if (npiSansCle) {
      this.cleControle = this.calculerCleControles(npiSansCle);
      this.updateNPIConstruction();
    }
  }

  getPaysInfo(pays: PaysDTO): PaysDTO | undefined {
    if (!pays || !pays.code) return undefined;
    return this.PAYS_LIST.find((p) => p.code === pays.code);
  }

  getPaysRegion(): string {
    const pays = this.enfantFormGroup.get('pays')?.value;
    if (!pays) return '';
    const paysInfo = this.getPaysInfo(pays);
    return paysInfo?.codeRegion || '';
  }

  getPaysCodeNumerique(): string {
    const pays = this.enfantFormGroup.get('pays')?.value;
    if (!pays) return '';
    const paysInfo = this.getPaysInfo(pays);
    return paysInfo?.codeNumerique || '';
  }

  // ✅ AJOUTER ces deux méthodes pour le filtrage des pays
  filtrerPays(event: Event): void {
    const valeur =
      (event.target as HTMLInputElement).value?.toLowerCase() || '';
    this.paysFiltres = this.PAYS_LIST.filter((p) =>
      p.nom.toLowerCase().includes(valeur),
    );
  }

  afficherPays(pays: PaysDTO | string): string {
    if (!pays) return '';
    return typeof pays === 'string' ? pays : pays.nom;
  }

  updateNPIConstruction(): void {
    const formValue = this.enfantFormGroup.value;

    this.npiParts.sexe = formValue.sexe || '';

    if (formValue.dateNaissance) {
      const date = new Date(formValue.dateNaissance);
      this.npiParts.annee = date.getFullYear().toString().slice(-2);
      this.npiParts.mois = ('0' + (date.getMonth() + 1)).slice(-2);
    } else {
      this.npiParts.annee = '';
      this.npiParts.mois = '';
    }

    if (formValue.pays) {
      this.npiParts.region = formValue.pays.codeRegion || '';

      if (formValue.typeNPI === '4') {
        this.npiParts.pays = formValue.pays.codeNumerique || '';
      } else {
        this.npiParts.pays = formValue.pays.code || '';
      }
    }

    this.npiParts.prefecture = formValue.prefecture || '';

    if (formValue.commune && formValue.commune.length >= 5) {
      this.npiParts.commune = formValue.commune.substring(3, 5);
    } else {
      this.npiParts.commune = '';
    }

    if (formValue.quartier && formValue.quartier.length >= 7) {
      this.npiParts.quartier = formValue.quartier.substring(5, 7);
    } else {
      this.npiParts.quartier = '';
    }

    // Calculer le progrès selon le type de NPI
    let filledParts = 0;
    let totalParts = 0;

    const typeNPI = formValue.typeNPI;

    // Parties communes à tous les types
    if (this.npiParts.sexe) filledParts++;
    if (this.npiParts.annee) filledParts++;
    if (this.npiParts.mois) filledParts++;

    if (typeNPI === '1') {
      // Type 1: Sexe + Année + Mois + Préfecture + Commune + Quartier + N°Aléatoire + Clé = 8 parties
      totalParts = 8;
      if (this.npiParts.prefecture) filledParts++;
      if (this.npiParts.commune) filledParts++;
      if (this.npiParts.quartier) filledParts++;
    } else if (typeNPI === '2' || typeNPI === '3' || typeNPI === '4') {
      // Types 2,3,4: Sexe + Année + Mois + Région + Pays + N°Aléatoire + Clé = 7 parties
      totalParts = 7;
      if (this.npiParts.region) filledParts++;
      if (this.npiParts.pays) filledParts++;
    } else {
      // Type non sélectionné, utiliser 8 par défaut
      totalParts = 8;
    }

    // N° Aléatoire et Clé (communs à tous)
    if (this.numeroAleatoire) filledParts++;
    if (this.cleControle) filledParts++;
    this.constructionProgress =
      totalParts > 0 ? Math.round((filledParts / totalParts) * 100) : 0;
  }

  genererNumeroAleatoire(typeNPI: string): void {
    if (typeNPI === '1') {
      this.numeroAleatoire = (
        Math.floor(Math.random() * 9000) + 1000
      ).toString();
    } else {
      this.numeroAleatoire = (
        Math.floor(Math.random() * 90000) + 10000
      ).toString();
    }
    this.updateNPIConstruction();
  }

  calculerCleControle(): string {
    const cleAleatoire = Math.floor(Math.random() * 90 + 10);
    return cleAleatoire.toString();
  }

  calculerCleControles(npiSansCle: string): string {
    let somme = 0;
    for (let i = 0; i < npiSansCle.length; i++) {
      somme += parseInt(npiSansCle[i]) * (i % 2 === 0 ? 2 : 1);
    }
    const cle = (97 - (somme % 97)).toString();
    return ('0' + cle).slice(-2);
  }

  getNomMois(mois: number): string {
    const moisNoms = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return moisNoms[mois - 1] || '';
  }

  copyNPI(): void {
    const npiText = this.npiGenere
      ? this.npiGenere
      : [
          this.npiParts.sexe,
          this.npiParts.annee,
          this.npiParts.mois,
          this.npiParts.region,
          this.npiParts.pays,
          this.npiParts.prefecture,
          this.npiParts.commune,
          this.npiParts.quartier,
          this.numeroAleatoire,
          this.cleControle,
        ]
          .filter(Boolean)
          .join('');

    if (!npiText) {
      this.showError('Aucun NPI à copier');
      return;
    }

    navigator.clipboard.writeText(npiText).then(() => {
      this.showSuccess('NPI copié dans le presse-papier !');
    });
  }

  // ✅ NOUVELLE MÉTHODE: Précharger les formulaires selon le type de NPI
  prechargerFormulaires(typeNPI: string): void {
    // const isGuineen = typeNPI === '1';
    const isGuineen = ['1', '2'].includes(typeNPI);

    // Données selon le type
    const donnees = isGuineen
      ? {
          // 🇬🇳 Données guinéennes
          enfant: {
            prenom: 'Yaya',
            nom: 'CAMARA',
            sexe: '1',
            dateNaissance: new Date(2020, 4, 15), // 15 mai 2020
          },
          pere: {
            prenomPere: 'Moussa',
            nomPere: 'CAMARA',
            dateNaissancePere: new Date(1990, 2, 10),
            professionPere: 'Commerçant',
            nationalitePere: 'Guinéenne',
            adressePere: 'Quartier Hamdallaye, Conakry',
            telephonePere: '622123456',
          },
          mere: {
            prenomMere: 'Adama',
            nomMere: 'CONDÉ',
            dateNaissanceMere: new Date(1995, 6, 20),
            professionMere: 'Enseignante',
            nationaliteMere: 'Guinéenne',
            adresseMere: 'Quartier Hamdallaye, Conakry',
            telephoneMere: '625987654',
          },
        }
      : {
          // 🇪🇺 Données européennes
          enfant: {
            prenom: 'Emma',
            nom: 'MARTIN',
            sexe: '2',
            dateNaissance: new Date(2025, 4, 15),
          },
          pere: {
            prenomPere: 'Jean',
            nomPere: 'MARTIN',
            dateNaissancePere: new Date(1988, 3, 25),
            professionPere: 'Ingénieur',
            nationalitePere: 'Française',
            adressePere: '12 Rue de la Paix, Paris',
            telephonePere: '0601234567',
          },
          mere: {
            prenomMere: 'Sophie',
            nomMere: 'DUBOIS',
            dateNaissanceMere: new Date(1992, 8, 12),
            professionMere: 'Médecin',
            nationaliteMere: 'Française',
            adresseMere: '12 Rue de la Paix, Paris',
            telephoneMere: '0607654321',
          },
        };

    // Appliquer les données aux formulaires
    this.enfantFormGroup.patchValue(donnees.enfant);
    this.pereFormGroup.patchValue(donnees.pere);
    this.mereFormGroup.patchValue(donnees.mere);

    console.log(
      `✅ Formulaires préchargés avec données ${isGuineen ? 'guinéennes' : 'européennes'}`,
    );
  }

  resetAll(stepper: MatStepper): void {
    // 1. Reset les valeurs
    this.enfantFormGroup.reset();
    this.pereFormGroup.reset();
    this.mereFormGroup.reset();

    // 2. Supprimer TOUT état de validation (touched, dirty, submitted)
    [this.enfantFormGroup, this.pereFormGroup, this.mereFormGroup].forEach(
      (fg) => {
        fg.markAsUntouched();
        fg.markAsPristine();
        Object.keys(fg.controls).forEach((key) => {
          fg.get(key)?.markAsUntouched();
          fg.get(key)?.markAsPristine();
          fg.get(key)?.setErrors(null);
        });
      },
    );

    // 3. Reset valeurs par défaut
    this.pereFormGroup.get('nationalitePere')?.setValue('Guinéenne');
    this.mereFormGroup.get('nationaliteMere')?.setValue('Guinéenne');

    // 4. Reset variables
    this.npiGenere = '';
    this.npiDetails = null;
    this.npiParts = {
      sexe: '',
      annee: '',
      mois: '',
      region: '',
      pays: '',
      prefecture: '',
      commune: '',
      quartier: '',
    };
    this.numeroAleatoire = '';
    this.cleControle = '';
    this.showNPIConstruction = false;

    // 5. Reset le stepper proprement SANS déclencher la validation
    stepper._stateChanged();
    stepper.selectedIndex = 0;
    this.cdr.detectChanges();

    this.showInfo('Formulaire réinitialisé');
  }

  onStepChange(event: any): void {
    if (
      event.selectedIndex === 3 &&
      this.enfantFormGroup.valid &&
      this.pereFormGroup.valid &&
      this.mereFormGroup.valid &&
      !this.npiGenere
    ) {
      setTimeout(() => {
        this.genererNPI();
      }, 500);
    }
  }

  // ✅ APRÈS
  showSuccess(message: string): void {
    this.snackBar.openFromComponent(ToastComponent, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
      data: { message, icon: 'task_alt', type: 'success' },
    });
  }

  showError(message: string): void {
    this.snackBar.openFromComponent(ToastComponent, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
      data: { message, icon: 'error', type: 'error' },
    });
  }

  showInfo(message: string): void {
    this.snackBar.openFromComponent(ToastComponent, {
      duration: 4000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['info-snackbar'],
      data: { message, icon: 'info', type: 'info' },
    });
  }

  getColor(index: number): string {
    if (index === 0) return 'blue';
    if (index === 1 || index === 2) return 'black';
    if (index == 3 || index == 4) return 'gray';
    if (index >= 5 && index <= 7) return 'red';
    if (index == 8 || index == 9) return 'purple';
    if (index == 10 || index == 11) return 'green';
    if (index >= 12 && index <= 15) return 'black';
    return 'maroon';
  }

  getTypeNPIIcon(value: string): string {
    const icons: { [key: string]: string } = {
      '1': 'home',
      '2': 'flight',
      '3': 'account_balance',
      '4': 'schedule',
    };
    return icons[value] || 'category';
  }

  getTypeNPILabel(value: string): string {
    const labels: { [key: string]: string } = {
      '1': 'Guinéenne né en Guinée',
      '2': "Guinéenne né à l'étranger",
      '3': 'Étranger résident permanent en Guinée',
      '4': 'Étranger résident temporaire en Guinée',
    };
    return labels[value] || 'Sélectionnez un type';
  }

  setRequired(control: AbstractControl | null, required: boolean) {
    if (!control) return;
    if (required) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setValue('');
    }
    control.updateValueAndValidity();
  }

  onValidMere() {
    console.log(
      `Sexe=${this.npiParts.sexe} | Année=${this.npiParts.annee} | Mois=${this.npiParts.mois} | Région=${this.npiParts.region} | Pays=${this.npiParts.pays} | Préfecture=${this.npiParts.prefecture} | Commune=${this.npiParts.commune} | Quartier=${this.npiParts.quartier}`,
    );
    if (this.cleControle.length === 0) {
      this.genererNumeroAleatoire(this.enfantFormGroup.value);
      this.cleControle = this.calculerCleControle();
      this.constructionProgress = 100;
    }
  }

  // ✅ NOUVELLE MÉTHODE 1
  getRegionsTriees(): string[] {
    return Array.from(this.prefecturesGroupees.keys()).sort();
  }

  // ✅ NOUVELLE MÉTHODE 2
  getPrefecturesPourRegion(regionNom: string): PrefectureDTO[] {
    return this.prefecturesGroupees.get(regionNom) || [];
  }
}
