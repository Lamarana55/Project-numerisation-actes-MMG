package gov.ravec.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
public class RoleRequestDTO {
    private String nom;
    private String description;
    private Set<String> permissionIds = new HashSet<>();
}
