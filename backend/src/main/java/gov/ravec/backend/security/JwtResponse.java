package gov.ravec.backend.security;

import gov.ravec.backend.utils.NiveauAdministratif;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class JwtResponse {
    private String accessToken;
    private String name;
    private String username;
    private String tokenType = "Bearer";
    private Collection<? extends GrantedAuthority> authorities;

    // ── Informations du profil métier ────────────────────────────────────────
    /** Nom technique du profil (ex: SUPER_ADMINISTRATEUR) */
    private String profil;
    /** Libellé affiché (ex: Super-Administrateur) */
    private String profilLibelle;
    /** Niveau administratif du profil */
    private NiveauAdministratif niveauAdministratif;

    // ── Affectation territoriale ─────────────────────────────────────────────
    private String regionId;
    private String regionNom;
    private String prefectureId;
    private String prefectureNom;
    private String communeId;
    private String communeNom;
}
