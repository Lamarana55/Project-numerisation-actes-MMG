package gov.ravec.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateVilleRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String nom;
    @NotBlank
    private String paysCode;
}
