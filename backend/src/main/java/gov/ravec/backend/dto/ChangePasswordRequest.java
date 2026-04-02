package gov.ravec.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO reçu lors du changement de mot de passe obligatoire (première connexion
 * ou après réinitialisation par un administrateur).
 */
@Getter
@Setter
public class ChangePasswordRequest {
    /** Mot de passe actuel (servant de vérification d'identité). */
    private String currentPassword;
    /** Nouveau mot de passe choisi par l'utilisateur. */
    private String newPassword;
}
