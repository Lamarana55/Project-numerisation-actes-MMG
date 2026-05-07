package gov.ravec.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MoisStatDTO {
    private int    annee;
    private int    mois;
    private String label;
    private long   actes;
    private long   naissances;
    private long   deces;
}
