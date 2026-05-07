package gov.ravec.backend.dto;

import lombok.*;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StatistiquesDTO {
    private long totalActes;
    private long totalNaissance;
    private long totalDeces;
    private long totalHommes;
    private long totalFemmes;
    private long totalValides;
    private long totalEnAttente;
    private long totalRejetes;
    private long naissanceHommes;
    private long naissanceFemmes;
    private long decesHommes;
    private long decesFemmes;
    private List<CommuneStatDTO> parCommune;
    private List<MoisStatDTO>    parMois;
}
