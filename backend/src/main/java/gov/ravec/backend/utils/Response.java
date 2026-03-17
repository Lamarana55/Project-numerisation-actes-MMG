package gov.ravec.backend.utils;

import lombok.*;


@NoArgsConstructor
@Getter @Setter @Builder
public class Response<T> {
    private T body = null;
    private String status;
    private String message = null;

    public Response(T body, String status, String message) {
        this.body = body;
        this.status = status;
        this.message = message;
    }

    public Response(T body, String status) {
        this.body = body;
        this.status = status;
    }
}
