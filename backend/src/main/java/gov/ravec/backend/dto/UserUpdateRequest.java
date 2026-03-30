package gov.ravec.backend.dto;

import gov.ravec.backend.utils.Statut;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO reçu par le contrôleur lors de la mise à jour d'un utilisateur.
 * On n'expose jamais l'entité User directement pour éviter les problèmes
 * de cascade JPA avec les entités détachées.
 */
@Getter
@Setter
public class UserUpdateRequest {
    private String nom;
    private String prenom;
    private String email;
    private String username;
    private String telephone;
    private String fonction;
    /** ID du rôle à affecter — le service résoudra l'entité Role depuis la BDD */
    private String roleId;
    private Statut statut;
}
