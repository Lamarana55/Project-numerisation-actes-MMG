package gov.ravec.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO reçu par le contrôleur lors de la création d'un utilisateur.
 */
@Getter
@Setter
public class UserCreateRequest {
    private String nom;
    private String prenom;
    private String email;
    private String username;
    private String telephone;
    private String fonction;
    /** ID du rôle — le service résoudra l'entité Role depuis la BDD */
    private String roleId;
}
