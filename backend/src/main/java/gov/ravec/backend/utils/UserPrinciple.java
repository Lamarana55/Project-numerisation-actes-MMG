package gov.ravec.backend.utils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.ravec.backend.entities.User;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserPrinciple implements UserDetails {

    private final String id;
    private final String nom;
    private final String prenom;
    private final String telephone;
    private final String username;
    private final String email;

    @JsonIgnore
    private final String password;

    private final Collection<GrantedAuthority> authorities;

    // ── Profil métier ────────────────────────────────────────────────────────
    private final String profil;
    private final String profilLibelle;
    private final NiveauAdministratif niveauAdministratif;

    // ── Territoire d'affectation ─────────────────────────────────────────────
    private final String regionId;
    private final String regionNom;
    private final String prefectureId;
    private final String prefectureNom;
    private final String communeId;
    private final String communeNom;

    public UserPrinciple(String id, String nom, String prenom, String telephone,
                          String username, String email, String password,
                          Collection<GrantedAuthority> authorities,
                          String profil, String profilLibelle, NiveauAdministratif niveauAdministratif,
                          String regionId, String regionNom,
                          String prefectureId, String prefectureNom,
                          String communeId, String communeNom) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.telephone = telephone;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
        this.profil = profil;
        this.profilLibelle = profilLibelle;
        this.niveauAdministratif = niveauAdministratif;
        this.regionId = regionId;
        this.regionNom = regionNom;
        this.prefectureId = prefectureId;
        this.prefectureNom = prefectureNom;
        this.communeId = communeId;
        this.communeNom = communeNom;
    }

    public static UserPrinciple build(User user) {
        // Permissions du profil
        List<GrantedAuthority> authorities = new ArrayList<>(
                user.getRole().getPermissions().stream()
                        .map(permission -> new SimpleGrantedAuthority(permission.getNom()))
                        .collect(Collectors.toList())
        );
        // Ajouter le nom du profil comme authority ROLE_ pour les guards Spring Security
        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getNom()));
        }

        String regionId = user.getRegion() != null ? user.getRegion().getId().toString() : null;
        String regionNom = user.getRegion() != null ? user.getRegion().getNom() : null;
        String prefectureId = user.getPrefecture() != null ? user.getPrefecture().getId().toString() : null;
        String prefectureNom = user.getPrefecture() != null ? user.getPrefecture().getNom() : null;
        String communeId = user.getCommune() != null ? user.getCommune().getId().toString() : null;
        String communeNom = user.getCommune() != null ? user.getCommune().getNom() : null;

        return new UserPrinciple(
                user.getId(),
                user.getNom(),
                user.getPrenom(),
                user.getTelephone(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities,
                user.getRole() != null ? user.getRole().getNom() : null,
                user.getRole() != null ? user.getRole().getLibelle() : null,
                user.getNiveauAdministratif(),
                regionId, regionNom,
                prefectureId, prefectureNom,
                communeId, communeNom
        );
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public String getId()                                    { return id; }
    public String getNom()                                   { return nom; }
    public String getPrenom()                                { return prenom; }
    public String getTelephone()                             { return telephone; }
    public String getEmail()                                 { return email; }
    public String getProfil()                                { return profil; }
    public String getProfilLibelle()                         { return profilLibelle; }
    public NiveauAdministratif getNiveauAdministratif()      { return niveauAdministratif; }
    public String getRegionId()                              { return regionId; }
    public String getRegionNom()                             { return regionNom; }
    public String getPrefectureId()                          { return prefectureId; }
    public String getPrefectureNom()                         { return prefectureNom; }
    public String getCommuneId()                             { return communeId; }
    public String getCommuneNom()                            { return communeNom; }

    // ── UserDetails ──────────────────────────────────────────────────────────

    @Override public String getUsername()  { return username; }
    @Override public String getPassword()  { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPrinciple user = (UserPrinciple) o;
        return id != null && id.equals(user.id);
    }
}
