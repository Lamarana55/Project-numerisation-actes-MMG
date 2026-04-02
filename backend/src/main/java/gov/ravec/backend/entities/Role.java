package gov.ravec.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.BaseEntity;
import gov.ravec.backend.utils.NiveauAdministratif;

import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role extends BaseEntity {
    @Id
    private String id;

    /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR, COORDINATEUR_REGIONAL) */
    @Column(unique = true, nullable = false)
    private String nom;

    /** Libellé lisible affiché dans l'interface */
    private String libelle = null;

    private String description = null;

    /** Niveau administratif déterminant la portée territoriale du profil */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'COMMUNAL' check (niveau_administratif in ('CENTRAL','REGIONAL','PREFECTORAL','COMMUNAL'))")
    private NiveauAdministratif niveauAdministratif = NiveauAdministratif.COMMUNAL;

    @ManyToMany(fetch = FetchType.EAGER, cascade = CascadeType.MERGE)
    @JoinTable(name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id"))
    private Set<Permission> permissions = new HashSet<>();
}
