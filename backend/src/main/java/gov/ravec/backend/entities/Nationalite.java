package gov.ravec.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "nationalite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nationalite {

    @Id
    @Column(length = 3)
    private String code;

    @Column(name = "libelle_feminin", nullable = false)
    private String libelleFeminin;

    @Column(name = "libelle_masculin", nullable = false)
    private String libelleMasculin;
}
