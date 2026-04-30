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
 * Acte de décès — couvre les sources DECLARATION et TRANSCRIPTION.
 */
@Entity
@Table(name = "acte_deces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActeDeces extends BaseEntity {

    @Id
    private String id;

    // ── Source ────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SourceActe source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_acte_id")
    private TypeActe typeActe;

    @Column(name = "numero_acte")
    private String numeroActe;

    @Column(name = "annee_registre")
    private String anneeRegistre;

    private String feuillet;

    // ── Personnes ─────────────────────────────────────────────────

    /** Le défunt */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "defunt_id")
    private Personne defunt;

    /** Conjoint(e) survivant(e) */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "conjoint_id")
    private Personne conjoint;

    /** Père du défunt */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "pere_id")
    private Personne pere;

    /** Mère du défunt */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "mere_id")
    private Personne mere;

    /** Déclarant du décès */
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "declarant_id")
    private Personne declarant;

    // ── Décès ─────────────────────────────────────────────────────
    @Column(name = "date_deces")
    private LocalDate dateDeces;

    @Column(name = "heure_deces")
    private String heureDeces;

    @Column(name = "lieu_deces")
    private String lieuDeces;

    @Column(name = "cause_deces")
    private String causeDeces;

    @Column(name = "type_deces")
    private String typeDeces;

    // ── Situation matrimoniale du défunt ──────────────────────────
    @Column(name = "situation_matrimoniale")
    private String situationMatrimoniale;

    // ── Conjoint ──────────────────────────────────────────────────
    @Column(name = "conjoint_connu")
    private String conjointConnu;

    // ── Déclarant (champs acte-spécifiques) ──────────────────────
    @Column(name = "qualite_declarant")
    private String qualiteDeclarant;

    @Column(name = "date_declaration")
    private LocalDate dateDeclaration;

    @Column(name = "lien_declarant_defunt")
    private String lienDeclarantDefunt;

    @Column(name = "signature_declarant")
    private String signatureDeclarant;

    // ── Transcription jugement ────────────────────────────────────
    @Column(name = "date_jugement")
    private LocalDate dateJugement;

    @Column(name = "numero_jugement")
    private String numeroJugement;

    private String tribunal;

    // ── Inscription ───────────────────────────────────────────────
    @Column(name = "date_inscription")
    private LocalDate dateInscription;

    @Column(name = "heure_inscription")
    private String heureInscription;

    @Column(name = "date_dressage")
    private LocalDate dateDressage;

    @Column(name = "heure_dressage")
    private String heureDressage;

    // ── Localisation ──────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commune_id")
    private Commune commune;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agent_id")
    private User agent;

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

    @OneToMany(mappedBy = "acteDeces", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<DocumentActe> documents = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Delete isDeleted = Delete.No;
}
