package gov.ravec.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.BaseEntity;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Permission extends BaseEntity {
    @Id
    private String id;
    @Column(unique = true, nullable = false)
    private String nom;
    private String description = null;
}
