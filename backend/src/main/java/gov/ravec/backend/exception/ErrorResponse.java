package gov.ravec.backend.exception;

import lombok.*;

@Setter
@Getter
@Builder
@AllArgsConstructor
@ToString
public class ErrorResponse {
    private int statusCode;
    private String message;

}