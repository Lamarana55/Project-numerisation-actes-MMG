package gov.ravec.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResetPasswordResponse {
    private String message;
    private String defaultPassword;
}
