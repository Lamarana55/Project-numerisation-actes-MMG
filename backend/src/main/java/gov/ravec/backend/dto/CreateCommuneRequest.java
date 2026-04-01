package gov.ravec.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommuneRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String nom;
    @NotBlank
    private String prefectureCode;
}
