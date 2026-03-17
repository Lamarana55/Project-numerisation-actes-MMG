package gov.ravec.backend.dto;


import gov.ravec.backend.utils.Statut;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter @Builder
public class UserDTO {
    private String id;
    private String nom;
    private String prenom;
    private String username;
    private String email;
    private String telephone;
    private String fonction;
    private String roleName;
    private Statut statut;
}