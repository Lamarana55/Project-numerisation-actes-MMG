package gov.ravec.backend.entities;

import gov.ravec.backend.utils.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entité représentant une personne physique dans le système d'état civil.
 * Une même personne peut apparaître dans plusieurs actes (enfant, père, mère,
 * déclarant, défunt, conjoint…).
 */
@Entity
@Table(name = "personne")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Personne extends BaseEntity {

    @Id
    private String id;

    // ── Identité ──────────────────────────────────────────────────
    private String prenom;
    private String nom;

    /** M = Masculin, F = Féminin */
    private String sexe;

    @Column(name = "date_naissance")
    private LocalDate dateNaissance;

    /** Numéro Personnel d'Identification (NPI) */
    private String npi;

    // ── Lieu de naissance ─────────────────────────────────────────
    @Column(name = "pays_naissance")
    private String paysNaissance;

    @Column(name = "region_naissance")
    private String regionNaissance;

    @Column(name = "prefecture_naissance")
    private String prefectureNaissance;

    @Column(name = "commune_naissance")
    private String communeNaissance;

    @Column(name = "quartier_naissance")
    private String quartierNaissance;

    @Column(name = "ville_naissance")
    private String villeNaissance;

    // ── Informations civiles ──────────────────────────────────────
    private String nationalite;
    private String profession;
    private String telephone;

    @Column(name = "situation_matrimoniale")
    private String situationMatrimoniale;

    // ── Domicile / Résidence ──────────────────────────────────────
    private String adresse;

    @Column(name = "pays_residence")
    private String paysResidence;

    @Column(name = "region_domicile")
    private String regionDomicile;

    @Column(name = "prefecture_domicile")
    private String prefectureDomicile;

    @Column(name = "commune_domicile")
    private String communeDomicile;

    @Column(name = "quartier_domicile")
    private String quartierDomicile;
}
