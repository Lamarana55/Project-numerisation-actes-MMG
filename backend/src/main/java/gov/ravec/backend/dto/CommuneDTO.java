package gov.ravec.backend.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommuneDTO {
    private UUID id;
    private String code;
    private String nom;
    private String codePrefecture;
}
