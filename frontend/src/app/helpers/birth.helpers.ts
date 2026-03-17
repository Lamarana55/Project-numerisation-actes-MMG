
import { RejectedBirth } from '../models/rejected-birth';
import { ValidBirth } from '../models/valid-birth';

export function mapDataToValidBirth(data: any): ValidBirth {
  return {
    ravecId: data.ravecid,
    commune: data.commune,
    district: data.district,
    secteur: data.secteur,
    anneeRegistre: data.annee_registre,
    numeroRegistre: data.numero_registre,
    feuillet: data.feuillet,
    numeroActe: data.numero_acte,
    numeroVolet: data.numero_de_volet,
    jours_des_faits: data.jours_des_faits,
    mois_des_faits: data.mois_des_faits,
    annee_des_faits: data.annee_des_faits,
    heureNaissance: data.heure_de_naissance,
    minuteNaissance: data.minute_de_naissance,
    rangNaissance: data.rang_de_naissance,
    date_etablissement_acte: data.date_etablissement_acte,
    code_place_de_redaction: data.code_place_de_redaction,
    prenoms: getFormattedNames(data.prenom_1_membre, data.prenom_2_membre, data.prenom_3_membre),
    nom: data.nom_membre,
    jourNaissance: data.jour_de_nais_membre,
    moisNaissance: data.mois_de_nais_membre,
    anneeNaissance: data.annees_de_nais_membre,
    genre: data.genre_membre,
    dateNaissance: data.date_de_nais_membre,
    code_pays_nais_membre: data.code_pays_nais_membre,
    code_place_de_nais_membre: data.code_place_de_nais_membre,
    autre_pays_de_nais: data.autre_pays_de_nais,
    nationalite_du_membre: data.nationalite_du_membre,
    pays_de_naissance: data.pays_de_naissance,
    prefecture_de_nais: data.prefecture_de_nais,
    commune_de_nais: data.commune_de_nais,
    district_de_nais: data.district_de_nais,
    autre_nationalite_du_membre: data.autre_nationalite_du_membre,
    code_profession: data.code_profession,
    autre_profession: data.autre_profession,
    prenomOffichier: getFormattedNames(data.prenom_1_officier, data.prenom_2_officier, data.prenom_3_officier),
    nomOfficier: data.nom_officier,
    professionOfficier: data.profession_officier,
    prenomMere: getFormattedNames(data.prenom_1_mere, data.prenom_2_mere, data.prenom_3_mere),
    nomMere: data.nom_mere,
    dateNaissanceMere: data.date_de_nais_mere,
    nationaliteMere: data.nationalite_mere,
    professionMere: data.code_profession_mere,
    prenomPere: getFormattedNames(data.prenom_1_pere, data.prenom_2_pere, data.prenom_3_pere),
    nomPere: data.nom_pere,
    dateNaissancePere: data.date_de_nais_pere,
    nationalitePere: data.nationalite_pere,
    professionPere: data.code_profession_pere,
    prenomDeclarant: getFormattedNames(data.prenom_1_declarant, data.prenom_2_declarant, data.prenom_3_declarant),
    nomDeclarant: data.nom_declarant,
    dateDeclarant: data.date_de_nais_declarant,
    nationaliteDeclarant: data.nationalite_declarant,
    professionDeclarant: data.code_profession_declarant,
    lien_de_prarente_avec_le_declarant: data.lien_de_prarente_avec_le_declarant,
    place_de_naissance: data.place_de_naissance,
    extension: data.extension,
    images: data.images,
    user: data.user
  };
}

export function mapDataToRejectedBirth(data: any, reason: string): RejectedBirth {
  return {
    ravecId: data.ravecid,
    commune: data.commune,
    district: data.district,
    secteur: data.secteur,
    anneeRegistre: data.annee_registre,
    numeroRegistre: data.numero_registre,
    feuillet: data.feuillet,
    numeroActe: data.numero_acte,
    numeroVolet: data.numero_de_volet,
    jours_des_faits: data.jours_des_faits,
    mois_des_faits: data.mois_des_faits,
    annee_des_faits: data.annee_des_faits,
    heureNaissance: data.heure_de_naissance,
    minuteNaissance: data.minute_de_naissance,
    rangNaissance: data.rang_de_naissance,
    date_etablissement_acte: data.date_etablissement_acte,
    code_place_de_redaction: data.code_place_de_redaction,
    prenoms: getFormattedNames(data.prenom_1_membre, data.prenom_2_membre, data.prenom_3_membre),
    nom: data.nom_membre,
    jourNaissance: data.jour_de_nais_membre,
    moisNaissance: data.mois_de_nais_membre,
    anneeNaissance: data.annees_de_nais_membre,
    genre: data.genre_membre,
    dateNaissance: data.date_de_nais_membre,
    code_pays_nais_membre: data.code_pays_nais_membre,
    code_place_de_nais_membre: data.code_place_de_nais_membre,
    autre_pays_de_nais: data.autre_pays_de_nais,
    nationalite_du_membre: data.nationalite_du_membre,
    pays_de_naissance: data.pays_de_naissance,
    prefecture_de_nais: data.prefecture_de_nais,
    commune_de_nais: data.commune_de_nais,
    district_de_nais: data.district_de_nais,
    autre_nationalite_du_membre: data.autre_nationalite_du_membre,
    code_profession: data.code_profession,
    autre_profession: data.autre_profession,
    prenomOffichier: getFormattedNames(data.prenom_1_officier, data.prenom_2_officier, data.prenom_3_officier),
    nomOfficier: data.nom_officier,
    professionOfficier: data.profession_officier,
    prenomMere: getFormattedNames(data.prenom_1_mere, data.prenom_2_mere, data.prenom_3_mere),
    nomMere: data.nom_mere,
    dateNaissanceMere: data.date_de_nais_mere,
    nationaliteMere: data.nationalite_mere,
    professionMere: data.code_profession_mere,
    prenomPere: getFormattedNames(data.prenom_1_pere, data.prenom_2_pere, data.prenom_3_pere),
    nomPere: data.nom_pere,
    dateNaissancePere: data.date_de_nais_pere,
    nationalitePere: data.nationalite_pere,
    professionPere: data.code_profession_pere,
    prenomDeclarant: getFormattedNames(data.prenom_1_declarant, data.prenom_2_declarant, data.prenom_3_declarant),
    nomDeclarant: data.nom_declarant,
    dateDeclarant: data.date_de_nais_declarant,
    nationaliteDeclarant: data.nationalite_declarant,
    professionDeclarant: data.code_profession_declarant,
    lien_de_prarente_avec_le_declarant: data.lien_de_prarente_avec_le_declarant,
    place_de_naissance: data.place_de_naissance,
    extension: data.extension,
    images: data.images,
    motifReject: reason,
    commentaire: data.commentaire,
    user: data.user,

  };
}

export function getFormattedNames(prenom1?: string, prenom2?: string, prenom3?: string): string {
  const parts: string[] = [];
  if (prenom1) parts.push(prenom1.toUpperCase());
  if (prenom2) parts.push(prenom2.toUpperCase());
  if (prenom3) parts.push(prenom3.toUpperCase());
  return parts.join(' ');
}

export function formatDate(rawDate: string): Date | null {
  if (rawDate && rawDate.length === 8) {
    const day = parseInt(rawDate.substring(0, 2), 10);
    const month = parseInt(rawDate.substring(2, 4), 10) - 1;
    const year = parseInt(rawDate.substring(4, 8), 10);
    return new Date(year, month, day);
  }
  return null;
}

export function getFormattedDate(jour?: string, mois?: string, annee?: string): string {
  const parts: string[] = [];
  if (jour) parts.push(jour);
  if (mois) parts.push(mois);
  if (annee) parts.push(annee);
  return parts.join('/');
}

export function getFormattedHour(hour?: string, minute?: string): string {
  const parts: string[] = [];
  if (hour) parts.push(hour);
  if (minute) parts.push(minute);
  return parts.join(':');
}
