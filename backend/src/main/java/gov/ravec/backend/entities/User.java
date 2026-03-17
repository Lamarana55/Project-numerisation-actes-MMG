package gov.ravec.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import gov.ravec.backend.dto.UserDTO;
import gov.ravec.backend.utils.BaseEntity;
import gov.ravec.backend.utils.Statut;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString(exclude = { "password", "resetPasswordToken" })
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class User extends BaseEntity {
    @Id
    private String id;

    @Column(unique = true, nullable = false)
    private String code = null;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    private String telephone;

    @Column(unique = true, nullable = false)
    @Email
    private String email;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    @JsonIgnore
    private String password = null;

    @JsonIgnore
    private String resetPasswordToken = null;

    @Enumerated(EnumType.STRING)
    private Statut statut = Statut.Activated;

    private String fonction = null;

    // Relation avec Role (un utilisateur a un rôle principal)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    // Méthodes utilitaires
    public String getNomComplet() {
        return this.prenom + " " + this.nom;
    }

    public boolean isActif() {
        return this.statut == Statut.Activated;
    }

    public boolean hasRole(String roleName) {
        return this.role != null && this.role.getNom().equals(roleName);
    }

    public boolean hasPermission(String permissionName) {
        return this.role != null &&
                this.role.getPermissions().stream()
                        .anyMatch(permission -> permission.getNom().equals(permissionName));
    }

    // Entity -> DTO
    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        return UserDTO.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .username(user.getUsername())
                .email(user.getEmail())
                .telephone(user.getTelephone())
                .fonction(user.getFonction())
                .roleName(user.getRole() != null ? user.getRole().getNom() : null)
                .statut(user.getStatut())
                .build();
    }

    // DTO -> Entity
    public static User toEntity(UserDTO dto, Role role) {
        if (dto == null) {
            return null;
        }

        return User.builder()
                .id(dto.getId())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .telephone(dto.getTelephone())
                .fonction(dto.getFonction())
                .statut(dto.getStatut())
                .role(role)
                .build();
    }

    public static List<UserDTO> toDTOList(List<User> users) {
        if (users == null) {
            return List.of();
        }
        return users.stream()
                .map(User::toDTO)
                .toList();
    }

}