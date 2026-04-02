package gov.ravec.backend.dto;

import gov.ravec.backend.utils.Statut;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO reçu lors de la mise à jour d'un utilisateur.
 * Les champs territoriaux suivent les mêmes règles que UserCreateRequest.
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

    /** ID du profil (role) */
    private String roleId;
    private Statut statut;

    // ── Affectation territoriale ─────────────────────────────────────────────
    private String regionId;
    private String prefectureId;
    private String communeId;

    // ── Sécurité ─────────────────────────────────────────────────────────────
    /** Nullable : si null, la valeur existante n'est pas modifiée. */
    private Boolean mustChangePassword;
}
