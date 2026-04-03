package gov.ravec.backend.dto;

import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.utils.ValidationStatut;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour un acte de naissance validé.
 * Expose les données métier + les infos du cycle de validation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidBirthDTO {

    // ── Identité ────────────────────────────────────────────────
    private String id;
    private String ravecId;

    // ── Localisation administrative ──────────────────────────────
    private String region;
    private String prefecture;
    private String commune;
    private String district;
    private String secteur;

    // ── Registre ────────────────────────────────────────────────
    private String anneeRegistre;
    private String numeroRegistre;
    private String feuillet;
    private String numeroActe;
    private String numeroVolet;

    // ── Enfant ──────────────────────────────────────────────────
    private String prenoms;
    private String nom;
    private String genre;
    private String dateNaissance;
    private String jourNaissance;
    private String moisNaissance;
    private String anneeNaissance;
    private String jours_des_faits;
    private String mois_des_faits;
    private String annee_des_faits;
    private String heureNaissance;
    private String minuteNaissance;
    private String rangNaissance;
    private String date_etablissement_acte;
    private String code_place_de_redaction;
    private String nationalite_du_membre;
    private String pays_de_naissance;
    private String prefecture_de_nais;
    private String commune_de_nais;
    private String place_de_naissance;
    private String domicileParent;

    // ── Père ────────────────────────────────────────────────────
    private String prenomPere;
    private String nomPere;
    private String nationalitePere;
    private String professionPere;

    // ── Mère ────────────────────────────────────────────────────
    private String prenomMere;
    private String nomMere;
    private String nationaliteMere;
    private String professionMere;

    // ── Officier ────────────────────────────────────────────────
    private String prenomOffichier;
    private String nomOfficier;

    // ── Déclarant ───────────────────────────────────────────────
    private String prenomDeclarant;
    private String nomDeclarant;
    private String lien_de_prarente_avec_le_declarant;

    // ── Agent saisisseur ─────────────────────────────────────────
    private String agentId;
    private String agentNomComplet;
    private String agentUsername;

    // ── Validation ───────────────────────────────────────────────
    private ValidationStatut statut;
    private LocalDateTime dateAction;
    private String validateurId;
    private String validateurNomComplet;
    private String motifRejet;

    // ── Dates d'audit ────────────────────────────────────────────
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── Conversion Entity → DTO ───────────────────────────────────

    public static ValidBirthDTO fromEntity(ValidBirth v) {
        if (v == null) return null;

        return ValidBirthDTO.builder()
                .id(v.getId())
                .ravecId(v.getRavecId())
                .region(v.getRegion())
                .prefecture(v.getPrefecture())
                .commune(v.getCommune())
                .district(v.getDistrict())
                .secteur(v.getSecteur())
                .anneeRegistre(v.getAnneeRegistre())
                .numeroRegistre(v.getNumeroRegistre())
                .feuillet(v.getFeuillet())
                .numeroActe(v.getNumeroActe())
                .numeroVolet(v.getNumeroVolet())
                .prenoms(v.getPrenoms())
                .nom(v.getNom())
                .genre(v.getGenre())
                .dateNaissance(v.getDateNaissance())
                .jourNaissance(v.getJourNaissance())
                .moisNaissance(v.getMoisNaissance())
                .anneeNaissance(v.getAnneeNaissance())
                .jours_des_faits(v.getJours_des_faits())
                .mois_des_faits(v.getMois_des_faits())
                .annee_des_faits(v.getAnnee_des_faits())
                .heureNaissance(v.getHeureNaissance())
                .minuteNaissance(v.getMinuteNaissance())
                .rangNaissance(v.getRangNaissance())
                .date_etablissement_acte(v.getDate_etablissement_acte())
                .code_place_de_redaction(v.getCode_place_de_redaction())
                .nationalite_du_membre(v.getNationalite_du_membre())
                .pays_de_naissance(v.getPays_de_naissance())
                .prefecture_de_nais(v.getPrefecture_de_nais())
                .commune_de_nais(v.getCommune_de_nais())
                .place_de_naissance(v.getPlace_de_naissance())
                .domicileParent(v.getDomicileParent())
                .prenomPere(v.getPrenomPere())
                .nomPere(v.getNomPere())
                .nationalitePere(v.getNationalitePere())
                .professionPere(v.getProfessionPere())
                .prenomMere(v.getPrenomMere())
                .nomMere(v.getNomMere())
                .nationaliteMere(v.getNationaliteMere())
                .professionMere(v.getProfessionMere())
                .prenomOffichier(v.getPrenomOffichier())
                .nomOfficier(v.getNomOfficier())
                .prenomDeclarant(v.getPrenomDeclarant())
                .nomDeclarant(v.getNomDeclarant())
                .lien_de_prarente_avec_le_declarant(v.getLien_de_prarente_avec_le_declarant())
                // Agent saisisseur
                .agentId(v.getUser() != null ? v.getUser().getId() : null)
                .agentNomComplet(v.getUser() != null ? v.getUser().getNomComplet() : null)
                .agentUsername(v.getUser() != null ? v.getUser().getUsername() : null)
                // Validation
                .statut(v.getStatut())
                .dateAction(v.getDateAction())
                .validateurId(v.getValidateur() != null ? v.getValidateur().getId() : null)
                .validateurNomComplet(v.getValidateur() != null ? v.getValidateur().getNomComplet() : null)
                .motifRejet(v.getMotifRejet())
                // Audit
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
