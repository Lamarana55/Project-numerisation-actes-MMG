package gov.ravec.backend.dto;

import lombok.*;

/**
 * Payload envoyé par le frontend lors de la sauvegarde d'un acte indexé.
 * Correspond aux champs de l'interface ActeData du composant NumerisationIndexation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IndexationRequest {

    // ── Identification de l'acte ──────────────────────────────────────────────
    private String numero_acte;
    private String numero_registre;
    private String annee_registre;
    private String feuillet;
    private String date_etablissement_acte;
    private String numero_volet;

    // ── Zone de collecte ─────────────────────────────────────────────────────
    private String region_collecte;
    private String prefecture_collecte;
    private String commune;
    private String district;
    private String secteur;

    // ── Dates du fait ────────────────────────────────────────────────────────
    private String jours_des_faits;
    private String mois_des_faits;
    private String annee_des_faits;
    private String heure_naissance;
    private String minute_naissance;
    private String rang_de_naissance;

    // ── Enfant ───────────────────────────────────────────────────────────────
    private String prenoms;
    private String nom_membre;
    private String date_de_nais_membre;
    private String genre_membre;
    private String code_profession;
    private String nationalite_du_membre;

    // ── Lieu de naissance ────────────────────────────────────────────────────
    private String pays_de_naissance;
    private String region_naissance;
    private String prefecture_naissance;
    private String commune_de_nais;
    private String district_de_nais;
    private String place_de_naissance;

    // ── Père ─────────────────────────────────────────────────────────────────
    private String prenoms_pere;
    private String nom_pere;
    private String date_de_nais_pere;
    private String nationalite_pere;
    private String code_profession_pere;

    // ── Mère ─────────────────────────────────────────────────────────────────
    private String prenoms_mere;
    private String nom_mere;
    private String date_de_nais_mere;
    private String nationalite_mere;
    private String code_profession_mere;
    private String domicileParent;

    // ── Déclarant ────────────────────────────────────────────────────────────
    private String prenom_1_declarant;
    private String nom_declarant;
    private String lien_de_prarente_avec_le_declarant;

    // ── Officier ─────────────────────────────────────────────────────────────
    private String prenom_1_officier;
    private String nom_officier;
    private String profession_officier;

    // ── Image ────────────────────────────────────────────────────────────────
    private String image_base64;
    private String media_type;
}
