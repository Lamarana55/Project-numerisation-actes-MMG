package gov.ravec.backend.entities;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.BaseEntity;
import gov.ravec.backend.utils.ValidationStatut;

import java.time.LocalDateTime;


/**
 * Représente un acte de naissance indexé avec son cycle de validation.
 *
 * Cycle de vie :
 *   AGENT saisit l'acte  →  statut = EN_ATTENTE
 *   Superviseur / ODEC / Coordinateur valide  →  statut = VALIDE
 *   Superviseur / ODEC / Coordinateur rejette  →  statut = REJETE  (motifRejet obligatoire)
 *   AGENT corrige et ressaisit  →  statut revient à EN_ATTENTE
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"user", "validateur"})
@Builder
public class ValidBirth extends BaseEntity {

    @Id
    private String id;

    // ── Référence RAVEC ─────────────────────────────────────────
    private String ravecId;

    // ── Localisation administrative de l'acte ───────────────────
    /** Région où l'acte a été enregistré (nom de la région) */
    private String region;
    /** Préfecture où l'acte a été enregistré (nom de la préfecture) */
    private String prefecture;
    /** Commune où l'acte a été enregistré */
    private String commune;
    private String district;
    private String secteur;

    // ── Registre ────────────────────────────────────────────────
    private String anneeRegistre;
    private String numeroRegistre;
    private String feuillet;
    private String numeroActe;
    private String numeroVolet;

    // ── Fait ────────────────────────────────────────────────────
    private String jours_des_faits;
    private String mois_des_faits;
    private String annee_des_faits;
    private String heureNaissance;
    private String minuteNaissance;
    private String rangNaissance;
    private String date_etablissement_acte;
    private String code_place_de_redaction;

    // ── Enfant ──────────────────────────────────────────────────
    private String prenoms;
    private String nom;
    private String jourNaissance;
    private String moisNaissance;
    private String anneeNaissance;
    private String genre;
    private String dateNaissance;
    private String code_pays_nais_membre;
    private String code_place_de_nais_membre;
    private String autre_pays_de_nais;
    private String nationalite_du_membre;
    private String pays_de_naissance;
    private String prefecture_de_nais;
    private String commune_de_nais;
    private String district_de_nais;
    private String autre_nationalite_du_membre;
    private String code_profession;
    private String autre_profession;

    // ── Officier ────────────────────────────────────────────────
    private String prenomOffichier;
    private String nomOfficier;
    private String professionOfficier;

    // ── Mère ────────────────────────────────────────────────────
    private String prenomMere;
    private String nomMere;
    private String dateNaissanceMere;
    private String nationaliteMere;
    private String professionMere;

    // ── Père ────────────────────────────────────────────────────
    private String prenomPere;
    private String nomPere;
    private String dateNaissancePere;
    private String nationalitePere;
    private String professionPere;

    // ── Déclarant ───────────────────────────────────────────────
    private String prenomDeclarant;
    private String nomDeclarant;
    private String dateDeclarant;
    private String nationaliteDeclarant;
    private String professionDeclarant;
    private String lien_de_prarente_avec_le_declarant;

    // ── Autres ──────────────────────────────────────────────────
    private String place_de_naissance;
    private String domicileParent;

    @Column(columnDefinition = "TEXT")
    private String images;
    private String extension;

    // ── Relations utilisateurs ──────────────────────────────────

    /** Agent ayant effectué la saisie de l'acte (traçabilité obligatoire). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id", nullable = true)
    @JsonIgnore
    private User user;

    /** Utilisateur ayant validé ou rejeté l'acte (null si encore EN_ATTENTE). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id", nullable = true)
    @JsonIgnore
    private User validateur;

    // ── Workflow de validation ───────────────────────────────────

    /** Statut courant de l'acte dans le cycle de validation. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ValidationStatut statut = ValidationStatut.EN_ATTENTE;

    /** Date et heure de la dernière action de validation ou de rejet. */
    private LocalDateTime dateAction;

    /** Motif de rejet — obligatoire si statut = REJETE. */
    @Column(columnDefinition = "TEXT")
    private String motifRejet;

    // ── Soft delete ─────────────────────────────────────────────
    @JsonIgnore
    private Delete isDeleted = Delete.No;
}
