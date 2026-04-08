package gov.ravec.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRegionRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String nom;
}
