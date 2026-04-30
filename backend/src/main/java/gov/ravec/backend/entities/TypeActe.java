package gov.ravec.backend.entities;

import gov.ravec.backend.utils.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Type d'acte d'état civil (NAISSANCE, DECES, MARIAGE, DIVORCE, RECONNAISSANCE…).
 */
@Entity
@Table(name = "type_acte")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypeActe extends BaseEntity {

    @Id
    private String id;

    /** Code unique du type (ex. NAISSANCE, DECES, MARIAGE). */
    @Column(unique = true, nullable = false)
    private String code;

    /** Libellé affiché (ex. "Acte de naissance", "Acte de décès"). */
    @Column(nullable = false)
    private String libelle;

    private String description;

    /** Indique si ce type est toujours utilisé. */
    @Column(nullable = false)
    private boolean actif = true;
}
