package gov.ravec.backend.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profession")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profession {

    @Id
    private Integer code;

    @Column(nullable = false)
    private String masculin;

    @Column(nullable = false)
    private String feminin;
}
