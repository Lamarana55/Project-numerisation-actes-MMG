package gov.ravec.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateQuartierRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String nom;
    @NotBlank
    private String communeCode;
}
