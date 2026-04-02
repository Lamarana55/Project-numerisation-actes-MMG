package gov.ravec.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * DTO reçu lors de la création d'un utilisateur.
 * Les champs territoriaux sont optionnels et conditionnels au niveau
 * administratif du profil (roleId) :
 *   CENTRAL      → aucun champ territorial requis
 *   REGIONAL     → regionId requis
 *   PREFECTORAL  → regionId + prefectureId requis
 *   COMMUNAL     → regionId + prefectureId + communeId requis
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

    /** ID du profil (role) — le service résoudra l'entité Role depuis la BDD */
    private String roleId;

    // ── Affectation territoriale ─────────────────────────────────────────────
    private String regionId;
    private String prefectureId;
    private String communeId;

    // ── Sécurité ─────────────────────────────────────────────────────────────
    /**
     * Si {@code true}, l'utilisateur devra changer son mot de passe lors de
     * sa première connexion. Activé par défaut : bonne pratique de sécurité.
     */
    private boolean mustChangePassword = true;
}
