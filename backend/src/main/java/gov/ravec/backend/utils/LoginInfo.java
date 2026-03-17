package gov.ravec.backend.utils;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class LoginInfo {
    String username;
    String password;
}
