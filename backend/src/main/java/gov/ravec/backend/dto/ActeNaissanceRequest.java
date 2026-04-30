package gov.ravec.backend.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * Payload de création d'un acte de naissance (déclaration ou transcription).
 * Correspond à l'interface ActeNaissanceDTO du frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActeNaissanceRequest {

    // ── Type ───────────────────────────────────────────────────────
    /** DECLARATION | TRANSCRIPTION */
    private String typeCreation;

    // ── Jugement (transcription uniquement) ───────────────────────
    private LocalDate dateJugement;
    private String numeroJugement;
    private String tribunal;

    // ── Enfant ────────────────────────────────────────────────────
    private String prenom;
    private String nom;
    private String sexe;
    private LocalDate dateNaissance;
    private String heureNaissance;
    private String paysNaissance;
    private String regionNaissance;
    private String prefectureNaissance;
    private String communeNaissance;
    private String quartierNaissance;
    private String villeNaissance;
    private String lieuAccouchement;
    private String formationSanitaire;
    private String adresseLieu;
    private String naissanceMultiple;
    private String typeNaissanceMultiple;
    private Integer rangEnfant;
    private Integer rangNaissanceMere;

    // ── Père ──────────────────────────────────────────────────────
    private String pereConnu;
    private String pereDecede;
    private String prenomPere;
    private String nomPere;
    private LocalDate dateNaissancePere;
    private String paysNaissancePere;
    private String regionNaissancePere;
    private String prefectureNaissancePere;
    private String communeNaissancePere;
    private String quartierNaissancePere;
    private String villeNaissancePere;
    private String nationalitePere;
    private String professionPere;
    private String telephonePere;
    private String situationMatrimPere;
    private String adressePere;
    private String paysResidencePere;
    private String regionDomicilePere;
    private String prefectureDomicilePere;
    private String communeDomicilePere;
    private String quartierDomicilePere;

    // ── Mère ──────────────────────────────────────────────────────
    private String mereConnue;
    private String mereDecedee;
    private String prenomMere;
    private String nomMere;
    private LocalDate dateNaissanceMere;
    private String paysNaissanceMere;
    private String regionNaissanceMere;
    private String prefectureNaissanceMere;
    private String communeNaissanceMere;
    private String quartierNaissanceMere;
    private String villeNaissanceMere;
    private String nationaliteMere;
    private String professionMere;
    private String telephoneMere;
    private String situationMatrimMere;
    private String memeDomicileQuePere;
    private String adresseMere;
    private String paysResidenceMere;
    private String regionDomicileMere;
    private String prefectureDomicileMere;
    private String communeDomicileMere;
    private String quartierDomicileMere;
    private String parentsMaries;
    private String documentMariage;
    private String numeroActeMariage;
    private LocalDate dateMariage;
    private String communeMariage;

    // ── Déclarant ─────────────────────────────────────────────────
    private String qualiteDeclarant;
    private LocalDate dateDeclaration;
    private String prenomDeclarant;
    private String nomDeclarant;
    private String sexeDeclarant;
    private String telephoneDeclarant;
    private String signatureDeclarant;
    private String raisonNonSignature;

    // ── Acte / Inscription ────────────────────────────────────────
    private LocalDate dateInscription;
    private String heureInscription;
    private LocalDate dateDressage;
    private String heureDressage;
    private String pointCollecte;
    private String actionsFaire;
    private String numeroActe;
}
