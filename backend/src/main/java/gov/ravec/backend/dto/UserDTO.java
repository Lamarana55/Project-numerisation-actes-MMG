package gov.ravec.backend.dto;

import gov.ravec.backend.utils.NiveauAdministratif;
import gov.ravec.backend.utils.Statut;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserDTO {
    private String id;
    private String nom;
    private String prenom;
    private String username;
    private String email;
    private String telephone;
    private String fonction;
    private Statut statut;

    // ── Profil métier ────────────────────────────────────────────────────────
    /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR) */
    private String roleName;
    /** Libellé affiché dans l'interface (ex: Super-Administrateur) */
    private String roleLibelle;
    /** Niveau administratif du profil */
    private NiveauAdministratif niveauAdministratif;

    // ── Affectation territoriale ─────────────────────────────────────────────
    private String regionId;
    private String regionNom;
    private String prefectureId;
    private String prefectureNom;
    private String communeId;
    private String communeNom;

    // ── Sécurité ─────────────────────────────────────────────────────────────
    /** Indique si l'utilisateur doit changer son mot de passe à la prochaine connexion. */
    private boolean mustChangePassword;
}
