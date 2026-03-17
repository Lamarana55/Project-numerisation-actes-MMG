package gov.ravec.backend.entities;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.ravec.backend.utils.BaseEntity;
import gov.ravec.backend.utils.Delete;
import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Prefecture extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    private String code;
    private String nom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id")
    Region region;

    
}
