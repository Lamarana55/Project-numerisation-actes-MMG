package gov.ravec.backend.entities;

import gov.ravec.backend.utils.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Document (image scannée, jugement PDF…) associé à un acte d'état civil.
 */
@Entity
@Table(name = "document_acte")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentActe extends BaseEntity {

    @Id
    private String id;

    /** Nom original du fichier. */
    @Column(name = "nom_fichier")
    private String nomFichier;

    /** Extension / MIME type (ex. image/jpeg, application/pdf). */
    private String extension;

    /** Contenu encodé en base64. */
    @Column(columnDefinition = "TEXT")
    private String contenu;

    /**
     * Catégorie du document :
     *   SCAN_REGISTRE, PHOTO_ACTE, JUGEMENT, AUTRES.
     */
    @Column(name = "type_document")
    private String typeDocument;

    // ── Liens vers les actes (un seul sera non-null) ──────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acte_naissance_id")
    private ActeNaissance acteNaissance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acte_deces_id")
    private ActeDeces acteDeces;
}
