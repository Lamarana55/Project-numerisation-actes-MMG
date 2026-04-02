package gov.ravec.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO pour la mise à jour des informations personnelles
 * de l'utilisateur connecté (auto-modification).
 * Le rôle, le statut et le territoire ne sont pas modifiables ici.
 */
@Getter
@Setter
public class ProfileUpdateRequest {
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private String fonction;
}
