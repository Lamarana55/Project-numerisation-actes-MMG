package gov.ravec.backend.dto;

import lombok.*;

import java.time.LocalDate;

/**
 * Payload de création d'un acte de décès (déclaration ou transcription).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActeDecesRequest {

    private String typeCreation; // DECLARATION | TRANSCRIPTION

    // ── Jugement (transcription) ──────────────────────────────────
    private LocalDate dateJugement;
    private String numeroJugement;
    private String tribunal;

    // ── Défunt ────────────────────────────────────────────────────
    private String prenomDefunt;
    private String nomDefunt;
    private String sexeDefunt;
    private LocalDate dateNaissanceDefunt;
    private String nationaliteDefunt;
    private String professionDefunt;
    private String paysNaissanceDefunt;
    private String regionNaissanceDefunt;
    private String prefectureNaissanceDefunt;
    private String communeNaissanceDefunt;
    private String situationMatrimoniale;

    // ── Décès ─────────────────────────────────────────────────────
    private LocalDate dateDeces;
    private String heureDeces;
    private String lieuDeces;
    private String causeDeces;
    private String typeDeces;

    // ── Conjoint(e) ───────────────────────────────────────────────
    private String conjointConnu;
    private String prenomConjoint;
    private String nomConjoint;
    private String sexeConjoint;
    private String nationaliteConjoint;
    private String professionConjoint;

    // ── Père du défunt ────────────────────────────────────────────
    private String prenomPere;
    private String nomPere;
    private LocalDate dateNaissancePere;
    private String nationalitePere;
    private String professionPere;

    // ── Mère du défunt ────────────────────────────────────────────
    private String prenomMere;
    private String nomMere;
    private LocalDate dateNaissanceMere;
    private String nationaliteMere;
    private String professionMere;

    // ── Déclarant ─────────────────────────────────────────────────
    private String qualiteDeclarant;
    private LocalDate dateDeclaration;
    private String prenomDeclarant;
    private String nomDeclarant;
    private String sexeDeclarant;
    private String telephoneDeclarant;
    private String lienDeclarantDefunt;
    private String signatureDeclarant;

    // ── Inscription ───────────────────────────────────────────────
    private LocalDate dateInscription;
    private String heureInscription;
    private LocalDate dateDressage;
    private String heureDressage;
    private String actionsFaire;
    private String numeroActe;
}
