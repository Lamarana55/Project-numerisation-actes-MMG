package gov.ravec.backend.dto;

import gov.ravec.backend.entities.ActeDeces;
import gov.ravec.backend.entities.ActeNaissance;
import lombok.*;

/**
 * Résumé d'un acte pour les listes paginées.
 * Compatible avec l'interface ActeNaissanceSummary du frontend Angular.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActeSummaryDTO {

    private String id;

    /** Source de création : DECLARATION, TRANSCRIPTION, NUMERISATION, INDEXATION */
    private String typeCreation;

    /** Alias source (même valeur que typeCreation) */
    private String source;

    /** Type d'acte : naissance, deces */
    private String typeActe;

    // ── Intéressé (enfant ou défunt) ──────────────────────────────
    private String prenom;
    private String nom;
    private String sexe;
    private String dateNaissance;

    // ── Père ──────────────────────────────────────────────────────
    private String prenomPere;
    private String nomPere;

    // ── Mère ──────────────────────────────────────────────────────
    private String prenomMere;
    private String nomMere;

    // ── Acte ──────────────────────────────────────────────────────
    private String dateInscription;
    private String dateDressage;
    private String actionsFaire;
    private String statut;
    private String numeroActe;
    private String commune;
    private String agentNomComplet;
    private String createdAt;

    // ── Factory : depuis ActeNaissance ────────────────────────────
    public static ActeSummaryDTO from(ActeNaissance a) {
        String srcName = a.getSource() != null ? a.getSource().name() : null;
        return ActeSummaryDTO.builder()
                .id(a.getId())
                .typeCreation(srcName)
                .source(srcName)
                .typeActe("naissance")
                .prenom(a.getEnfant() != null ? a.getEnfant().getPrenom() : null)
                .nom(a.getEnfant() != null ? a.getEnfant().getNom() : null)
                .sexe(a.getEnfant() != null ? a.getEnfant().getSexe() : null)
                .dateNaissance(a.getEnfant() != null && a.getEnfant().getDateNaissance() != null
                        ? a.getEnfant().getDateNaissance().toString() : null)
                .prenomPere(a.getPere() != null ? a.getPere().getPrenom() : null)
                .nomPere(a.getPere() != null ? a.getPere().getNom() : null)
                .prenomMere(a.getMere() != null ? a.getMere().getPrenom() : null)
                .nomMere(a.getMere() != null ? a.getMere().getNom() : null)
                .dateInscription(a.getDateInscription() != null ? a.getDateInscription().toString() : null)
                .dateDressage(a.getDateDressage() != null ? a.getDateDressage().toString() : null)
                .actionsFaire(a.getActionsFaire() != null ? a.getActionsFaire().name() : null)
                .statut(a.getStatut() != null ? a.getStatut().name() : null)
                .numeroActe(a.getNumeroActe())
                .commune(a.getCommune() != null ? a.getCommune().getNom() : null)
                .agentNomComplet(a.getAgent() != null ? a.getAgent().getNomComplet() : null)
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build();
    }

    // ── Factory : depuis ActeDeces ────────────────────────────────
    public static ActeSummaryDTO from(ActeDeces a) {
        String srcName = a.getSource() != null ? a.getSource().name() : null;
        return ActeSummaryDTO.builder()
                .id(a.getId())
                .typeCreation(srcName)
                .source(srcName)
                .typeActe("deces")
                .prenom(a.getDefunt() != null ? a.getDefunt().getPrenom() : null)
                .nom(a.getDefunt() != null ? a.getDefunt().getNom() : null)
                .sexe(a.getDefunt() != null ? a.getDefunt().getSexe() : null)
                .dateNaissance(a.getDefunt() != null && a.getDefunt().getDateNaissance() != null
                        ? a.getDefunt().getDateNaissance().toString() : null)
                .prenomPere(a.getPere() != null ? a.getPere().getPrenom() : null)
                .nomPere(a.getPere() != null ? a.getPere().getNom() : null)
                .prenomMere(a.getMere() != null ? a.getMere().getPrenom() : null)
                .nomMere(a.getMere() != null ? a.getMere().getNom() : null)
                .dateInscription(a.getDateInscription() != null ? a.getDateInscription().toString() : null)
                .dateDressage(a.getDateDressage() != null ? a.getDateDressage().toString() : null)
                .actionsFaire(a.getActionsFaire() != null ? a.getActionsFaire().name() : null)
                .statut(a.getStatut() != null ? a.getStatut().name() : null)
                .numeroActe(a.getNumeroActe())
                .commune(a.getCommune() != null ? a.getCommune().getNom() : null)
                .agentNomComplet(a.getAgent() != null ? a.getAgent().getNomComplet() : null)
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build();
    }
}
