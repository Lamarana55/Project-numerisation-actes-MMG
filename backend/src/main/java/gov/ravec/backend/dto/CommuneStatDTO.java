package gov.ravec.backend.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommuneStatDTO {
    private String codeCommune;
    private String nomCommune;
    private String codePrefecture;
    private long   actes;
    private long   naissance;
    private long   deces;
    private long   hommes;
    private long   femmes;
}
