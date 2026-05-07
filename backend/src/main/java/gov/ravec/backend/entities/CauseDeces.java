package gov.ravec.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cause_deces")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CauseDeces {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String libelle;
}
