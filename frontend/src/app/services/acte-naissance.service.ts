import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type TypeCreation = 'DECLARATION' | 'TRANSCRIPTION';
export type ActionFaire  = 'en_cours_saisie' | 'a_corriger' | 'a_valider';

export interface ActeNaissanceDTO {
  // ── Type ──────────────────────────────────────────────
  typeCreation?: TypeCreation;

  // ── Jugement (transcription) ───────────────────────────
  dateJugement?:   string | null;
  numeroJugement?: string;
  tribunal?:       string;

  // ── Enfant ────────────────────────────────────────────
  prenom?:              string;
  nom?:                 string;
  sexe?:                string;
  dateNaissance?:       string | null;
  heureNaissance?:      string;
  paysNaissance?:       string;
  regionNaissance?:     string;
  prefectureNaissance?: string;
  communeNaissance?:    string;
  quartier?:            string;
  villeNaissance?:      string;
  lieuAccouchement?:    string;
  formationSanitaire?:  string;
  adresseLieu?:         string;

  // ── Naissance (déclaration) ────────────────────────────
  naissanceMultiple?:     string;
  typeNaissanceMultiple?: string;
  rangEnfant?:            number | null;
  rangNaissanceMere?:     number | null;

  // ── Père ──────────────────────────────────────────────
  pereConnu?:               string;
  pereDecede?:              string;
  prenomPere?:              string;
  nomPere?:                 string;
  dateNaissancePere?:       string | null;
  paysNaissancePere?:       string;
  regionNaissancePere?:     string;
  prefectureNaissancePere?: string;
  communeNaissancePere?:    string;
  quartierNaissancePere?:   string;
  villeNaissancePere?:      string;
  nationalitePere?:         string;
  professionPere?:          string;
  telephonePere?:           string;
  situationMatrimPere?:     string;
  adressePere?:             string;
  paysResidencePere?:       string;
  regionDomicilePere?:      string;
  prefectureDomicilePere?:  string;
  communeDomicilePere?:     string;
  quartierDomicilePere?:    string;

  // ── Mère ──────────────────────────────────────────────
  mereConnue?:               string;
  mereDecedee?:              string;
  prenomMere?:               string;
  nomMere?:                  string;
  dateNaissanceMere?:        string | null;
  paysNaissanceMere?:        string;
  regionNaissanceMere?:      string;
  prefectureNaissanceMere?:  string;
  communeNaissanceMere?:     string;
  quartierNaissanceMere?:    string;
  villeNaissanceMere?:       string;
  nationaliteMere?:          string;
  professionMere?:           string;
  telephoneMere?:            string;
  situationMatrimMere?:      string;
  memeDomicileQuePere?:      string;
  adresseMere?:              string;
  paysResidenceMere?:        string;
  regionDomicileMere?:       string;
  prefectureDomicileMere?:   string;
  communeDomicileMere?:      string;
  quartierDomicileMere?:     string;
  parentsMaries?:            string;
  documentMariage?:          string;
  numeroActeMariage?:        string;
  dateMariage?:              string | null;
  communeMariage?:           string;

  // ── Déclarant (déclaration) ────────────────────────────
  qualiteDeclarant?:      string;
  dateDeclaration?:       string | null;
  prenomDeclarant?:       string;
  nomDeclarant?:          string;
  sexeDeclarant?:         string;
  telephoneDeclarant?:    string;
  signatureDeclarant?:    string;
  raisonNonSignature?:    string;

  // ── Acte / Inscription ────────────────────────────────
  dateInscription?:  string | null;
  heureInscription?: string;
  dateDressage?:     string | null;
  heureDressage?:    string;
  pointCollecte?:    string;
  actionsFaire?:     ActionFaire;
}

export interface ActeNaissanceSearchParams {
  nom?:        string;
  prenom?:     string;
  npi?:        string;
  numero?:     string;
  typeActe?:   string;
  typeCreation?: string;
  dateDebut?:  string;
  dateFin?:    string;
  page?:       number;
  size?:       number;
}

export interface ActeNaissancePage {
  content:          ActeNaissanceSummary[];
  totalElements:    number;
  totalPages:       number;
  size:             number;
  number:           number;
  numberOfElements: number;
  first:            boolean;
  last:             boolean;
  empty:            boolean;
}

export interface ActeNaissanceSummary {
  id:               string;
  typeCreation?:    TypeCreation | string;
  source?:          string;   // 'FORMULAIRE' | 'NUMERISATION' | 'INDEXATION'
  typeActe?:        string;   // 'naissance' | 'deces'
  prenom?:          string;
  nom?:             string;
  sexe?:            string;
  dateNaissance?:   string;
  prenomPere?:      string;
  nomPere?:         string;
  prenomMere?:      string;
  nomMere?:         string;
  dateInscription?: string;
  dateDressage?:    string;
  actionsFaire?:    ActionFaire;
  statut?:          string;
  numeroActe?:      string;
  commune?:         string;
  agentNomComplet?: string;
  createdAt?:       string;
  npi?:             string;
}

/** DTO complet pour la consultation / modification d'un acte de naissance */
export interface ActeNaissanceDetail {
  id:                       string;
  source?:                  string;
  typeActe?:                string;
  statut?:                  string;
  actionsFaire?:            string;
  numeroActe?:              string;
  anneeRegistre?:           string;
  feuillet?:                string;
  numeroVolume?:            string;
  // Enfant
  prenom?:                  string;
  nom?:                     string;
  sexe?:                    string;
  dateNaissance?:           string;
  heureNaissance?:          string;
  npiEnfant?:               string;
  paysNaissance?:           string;
  regionNaissance?:         string;
  prefectureNaissance?:     string;
  communeNaissance?:        string;
  quartierNaissance?:       string;
  villeNaissance?:          string;
  lieuAccouchement?:        string;
  formationSanitaire?:      string;
  adresseLieu?:             string;
  naissanceMultiple?:       string;
  typeNaissanceMultiple?:   string;
  rangEnfant?:              number;
  rangNaissanceMere?:       number;
  // Père
  pereConnu?:               string;
  pereDecede?:              string;
  prenomPere?:              string;
  nomPere?:                 string;
  dateNaissancePere?:       string;
  npiPere?:                 string;
  paysNaissancePere?:       string;
  regionNaissancePere?:     string;
  prefectureNaissancePere?: string;
  communeNaissancePere?:    string;
  quartierNaissancePere?:   string;
  villeNaissancePere?:      string;
  nationalitePere?:         string;
  professionPere?:          string;
  telephonePere?:           string;
  situationMatrimPere?:     string;
  adressePere?:             string;
  paysResidencePere?:       string;
  regionDomicilePere?:      string;
  prefectureDomicilePere?:  string;
  communeDomicilePere?:     string;
  quartierDomicilePere?:    string;
  // Mère
  mereConnue?:              string;
  mereDecedee?:             string;
  prenomMere?:              string;
  nomMere?:                 string;
  dateNaissanceMere?:       string;
  npiMere?:                 string;
  paysNaissanceMere?:       string;
  regionNaissanceMere?:     string;
  prefectureNaissanceMere?: string;
  communeNaissanceMere?:    string;
  quartierNaissanceMere?:   string;
  villeNaissanceMere?:      string;
  nationaliteMere?:         string;
  professionMere?:          string;
  telephoneMere?:           string;
  situationMatrimMere?:     string;
  memeDomicileQuePere?:     string;
  adresseMere?:             string;
  paysResidenceMere?:       string;
  regionDomicileMere?:      string;
  prefectureDomicileMere?:  string;
  communeDomicileMere?:     string;
  quartierDomicileMere?:    string;
  parentsMaries?:           string;
  documentMariage?:         string;
  numeroActeMariage?:       string;
  dateMariage?:             string;
  communeMariage?:          string;
  // Déclarant
  qualiteDeclarant?:        string;
  dateDeclaration?:         string;
  prenomDeclarant?:         string;
  nomDeclarant?:            string;
  sexeDeclarant?:           string;
  telephoneDeclarant?:      string;
  signatureDeclarant?:      string;
  raisonNonSignature?:      string;
  // Transcription
  dateJugement?:            string;
  numeroJugement?:          string;
  tribunal?:                string;
  // Inscription
  dateInscription?:         string;
  heureInscription?:        string;
  dateDressage?:            string;
  heureDressage?:           string;
  pointCollecte?:           string;
  // Méta
  commune?:                 string;
  agentNomComplet?:         string;
  validateurNomComplet?:    string;
  createdAt?:               string;
}

@Injectable({ providedIn: 'root' })
export class ActeNaissanceService {
  private readonly base   = `${environment.apiURL}/actes/naissance`;
  private readonly global = `${environment.apiURL}/actes`;

  constructor(private http: HttpClient) {}

  /** Enregistrer une déclaration dans les délais */
  createDeclaration(payload: ActeNaissanceDTO): Observable<ActeNaissanceSummary> {
    return this.http.post<ActeNaissanceSummary>(`${this.base}`, {
      ...payload,
      typeCreation: 'DECLARATION',
    });
  }

  /** Enregistrer une transcription de jugement supplétif */
  createTranscription(payload: ActeNaissanceDTO): Observable<ActeNaissanceSummary> {
    return this.http.post<ActeNaissanceSummary>(`${this.base}/transcription`, {
      ...payload,
      typeCreation: 'TRANSCRIPTION',
    });
  }

  /** Rechercher/lister les actes de naissance (formulaire) */
  search(params: ActeNaissanceSearchParams = {}): Observable<ActeNaissancePage> {
    return this.http.get<ActeNaissancePage>(this.base, { params: this.buildParams(params) });
  }

  /**
   * Lister TOUS les actes (numérisés + indexés + formulaire).
   * Endpoint global : GET /actes
   */
  searchAll(params: ActeNaissanceSearchParams = {}): Observable<ActeNaissancePage> {
    return this.http.get<ActeNaissancePage>(this.global, { params: this.buildParams(params) });
  }

  /** Consulter le détail complet d'un acte de naissance */
  getByIdNaissance(id: string): Observable<ActeNaissanceDetail> {
    return this.http.get<ActeNaissanceDetail>(`${this.base}/${id}`);
  }

  /** Mettre à jour un acte de naissance */
  updateNaissance(id: string, payload: ActeNaissanceDTO): Observable<ActeNaissanceSummary> {
    return this.http.put<ActeNaissanceSummary>(`${this.base}/${id}`, payload);
  }

  /** Valider un acte de naissance */
  validerNaissance(id: string): Observable<ActeNaissanceSummary> {
    return this.http.put<ActeNaissanceSummary>(`${this.base}/${id}/valider`, {});
  }

  /** Télécharger le PDF copie intégrale d'un acte de naissance */
  downloadPdfNaissance(id: string): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/pdf`, { responseType: 'blob' });
  }

  /** Supprimer logiquement un acte de naissance */
  deleteNaissance(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Supprimer logiquement un acte de décès */
  deleteDeces(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiURL}/actes/deces/${id}`);
  }

  private buildParams(params: ActeNaissanceSearchParams): HttpParams {
    let hp = new HttpParams();
    if (params.nom)          hp = hp.set('nom',          params.nom);
    if (params.prenom)       hp = hp.set('prenom',        params.prenom);
    if (params.npi)          hp = hp.set('npi',           params.npi);
    if (params.numero)       hp = hp.set('numero',        params.numero);
    if (params.typeActe)     hp = hp.set('typeActe',      params.typeActe);
    if (params.typeCreation) hp = hp.set('typeCreation',  params.typeCreation);
    if (params.dateDebut)    hp = hp.set('dateDebut',     params.dateDebut);
    if (params.dateFin)      hp = hp.set('dateFin',       params.dateFin);
    hp = hp.set('page', String(params.page ?? 0));
    hp = hp.set('size', String(params.size ?? 25));
    return hp;
  }
}
