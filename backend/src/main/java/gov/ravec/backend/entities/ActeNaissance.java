package gov.ravec.backend.entities;

import gov.ravec.backend.utils.ActionsFaire;
import gov.ravec.backend.utils.BaseEntity;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.SourceActe;
import gov.ravec.backend.utils.ValidationStatut;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Acte de naissance — couvre toutes les sources d'entrée :
 *   DECLARATION (formulaire en ligne),
 *   TRANSCRIPTION (jugement supplétif),
 *   NUMERISATION (registre papier numérisé),
 *   INDEXATION (OCR).
 */
@Entity
@Table(name = "acte_naissance")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActeNaissance extends BaseEntity {

    @Id
    private String id;

    // ── Source de l'acte ──────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceActe source;

    // ── Type d'acte ───────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_acte_id")
    private TypeActe typeActe;

    // ── Numérotation registre ─────────────────────────────────────
    @Column(name = "numero_acte")
    private String numeroActe;

    @Column(name = "annee_registre")
    private String anneeRegistre;

    private String feuillet;

    @Column(name = "numero_volume")
    private String numeroVolume;

    // ── Personnes liées ───────────────────────────────────────────

    /** L'enfant (intéressé) */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "enfant_id")
    private Personne enfant;

    /** Le père */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "pere_id")
    private Personne pere;

    /** La mère */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "mere_id")
    private Personne mere;

    /** Le déclarant */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "declarant_id")
    private Personne declarant;

    // ── Détails naissance (non stockés dans Personne) ─────────────
    @Column(name = "heure_naissance")
    private String heureNaissance;

    @Column(name = "lieu_accouchement")
    private String lieuAccouchement;

    @Column(name = "formation_sanitaire")
    private String formationSanitaire;

    @Column(name = "adresse_lieu")
    private String adresseLieu;

    @Column(name = "naissance_multiple")
    private String naissanceMultiple;

    @Column(name = "type_naissance_multiple")
    private String typeNaissanceMultiple;

    @Column(name = "rang_enfant")
    private Integer rangEnfant;

    @Column(name = "rang_naissance_mere")
    private Integer rangNaissanceMere;

    // ── Statut père / mère (spécifique à cet acte) ────────────────
    @Column(name = "pere_connu")
    private String pereConnu;

    @Column(name = "pere_decede")
    private String pereDecede;

    @Column(name = "mere_connue")
    private String mereConnue;

    @Column(name = "mere_decedee")
    private String mereDecedee;

    @Column(name = "meme_domicile_que_pere")
    private String memeDomicileQuePere;

    // ── Mariage des parents ───────────────────────────────────────
    @Column(name = "parents_maries")
    private String parentsMaries;

    @Column(name = "document_mariage")
    private String documentMariage;

    @Column(name = "numero_acte_mariage")
    private String numeroActeMariage;

    @Column(name = "date_mariage")
    private LocalDate dateMariage;

    @Column(name = "commune_mariage")
    private String communeMariage;

    // ── Déclarant (champs acte-spécifiques) ───────────────────────
    @Column(name = "qualite_declarant")
    private String qualiteDeclarant;

    @Column(name = "date_declaration")
    private LocalDate dateDeclaration;

    @Column(name = "sexe_declarant")
    private String sexeDeclarant;

    @Column(name = "signature_declarant")
    private String signatureDeclarant;

    @Column(name = "raison_non_signature")
    private String raisonNonSignature;

    // ── Transcription jugement supplétif ─────────────────────────
    @Column(name = "date_jugement")
    private LocalDate dateJugement;

    @Column(name = "numero_jugement")
    private String numeroJugement;

    private String tribunal;

    // ── Inscription / Dressage ────────────────────────────────────
    @Column(name = "date_inscription")
    private LocalDate dateInscription;

    @Column(name = "heure_inscription")
    private String heureInscription;

    @Column(name = "date_dressage")
    private LocalDate dateDressage;

    @Column(name = "heure_dressage")
    private String heureDressage;

    @Column(name = "point_collecte")
    private String pointCollecte;

    // ── Localisation administrative de l'acte ─────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commune_id")
    private Commune commune;

    // ── Agent saisisseur ──────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

    /** Utilisateur ayant validé ou rejeté l'acte. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validateur_id")
    private User validateur;

    // ── Workflow ──────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "actions_faire", nullable = false)
    @Builder.Default
    private ActionsFaire actionsFaire = ActionsFaire.EN_COURS_SAISIE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ValidationStatut statut = ValidationStatut.EN_ATTENTE;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @Column(name = "date_action")
    private LocalDateTime dateAction;

    // ── Documents (images scannées) ───────────────────────────────
    @OneToMany(mappedBy = "acteNaissance", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<DocumentActe> documents = new ArrayList<>();

    // ── Soft delete ───────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Delete isDeleted = Delete.No;
}
