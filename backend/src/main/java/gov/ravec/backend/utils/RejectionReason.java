package gov.ravec.backend.utils;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class RejectionReason {
    String errorCode;
    String errorLabel;
    List<String> parameters = new ArrayList();
}
