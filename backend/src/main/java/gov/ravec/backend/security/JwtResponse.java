package gov.ravec.backend.security;


import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import java.util.Collection;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter @ToString
@Builder
public class JwtResponse {
    private String accessToken;
    private String name;
    private String username;
    private String tokenType = "Bearer";
    private Collection<? extends GrantedAuthority> authorities;
}
