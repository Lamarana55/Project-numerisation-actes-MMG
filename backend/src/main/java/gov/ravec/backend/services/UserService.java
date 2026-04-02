package gov.ravec.backend.services;

import gov.ravec.backend.dto.ChangePasswordRequest;
import gov.ravec.backend.dto.ResetPasswordResponse;
import gov.ravec.backend.dto.UserCreateRequest;
import gov.ravec.backend.dto.UserDTO;
import gov.ravec.backend.dto.UserUpdateRequest;
import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.Prefecture;
import gov.ravec.backend.entities.Region;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.CommuneRepository;
import gov.ravec.backend.repositories.PrefectureRepository;
import gov.ravec.backend.repositories.RegionRepository;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.NiveauAdministratif;
import gov.ravec.backend.utils.Statut;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RegionRepository regionRepository;
    private final PrefectureRepository prefectureRepository;
    private final CommuneRepository communeRepository;
    private final PasswordEncoder encoder;

    @Value("${ravec.app.default-password}")
    private String defaultPassword;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RegionRepository regionRepository,
                       PrefectureRepository prefectureRepository,
                       CommuneRepository communeRepository,
                       PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.regionRepository = regionRepository;
        this.prefectureRepository = prefectureRepository;
        this.communeRepository = communeRepository;
        this.encoder = encoder;
    }

    private static boolean isNotDeleted(User user) {
        return user.getIsDelete() == Delete.No;
    }

    // ── Lecture ──────────────────────────────────────────────────────────────

    public List<UserDTO> index() {
        return User.toDTOList(userRepository.findByIsDeleteOrderByCreatedAtDesc(Delete.No));
    }

    public ResponseEntity<UserDTO> show(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(u -> ResponseEntity.ok(User.toDTO(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ── Création ─────────────────────────────────────────────────────────────

    public UserDTO save(UserCreateRequest req) {
        Role role = resolveRole(req.getRoleId());

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setCode(UUID.randomUUID().toString());
        user.setNom(req.getNom());
        user.setPrenom(req.getPrenom());
        user.setEmail(req.getEmail());
        user.setUsername(req.getUsername());
        user.setTelephone(req.getTelephone());
        user.setFonction(req.getFonction());
        user.setRole(role);
        user.setStatut(Statut.Activated);
        user.setPassword(encoder.encode(defaultPassword));
        user.setMustChangePassword(req.isMustChangePassword());

        // Affectation territoriale selon le niveau du profil
        applyTerritorialAssignment(user, role, req.getRegionId(), req.getPrefectureId(), req.getCommuneId());

        return User.toDTO(userRepository.save(user));
    }

    // ── Mise à jour ──────────────────────────────────────────────────────────

    public UserDTO update(String id, UserUpdateRequest req) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(exist -> {
                    exist.setNom(req.getNom());
                    exist.setPrenom(req.getPrenom());
                    exist.setEmail(req.getEmail());
                    exist.setTelephone(req.getTelephone());
                    exist.setFonction(req.getFonction());
                    exist.setUsername(req.getUsername());

                    Role role = exist.getRole();
                    if (req.getRoleId() != null) {
                        role = resolveRole(req.getRoleId());
                        exist.setRole(role);
                    }

                    if (req.getStatut() != null) {
                        exist.setStatut(req.getStatut());
                    }
                    if (req.getMustChangePassword() != null) {
                        exist.setMustChangePassword(req.getMustChangePassword());
                    }

                    // Réinitialise les territoires puis réapplique
                    exist.setRegion(null);
                    exist.setPrefecture(null);
                    exist.setCommune(null);
                    applyTerritorialAssignment(exist, role, req.getRegionId(), req.getPrefectureId(), req.getCommuneId());

                    exist.setUpdatedAt(Instant.now());
                    return User.toDTO(userRepository.save(exist));
                }).orElse(null);
    }

    // ── Statut & mot de passe ────────────────────────────────────────────────

    public UserDTO toggleStatus(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(user -> {
                    user.setStatut(user.getStatut() == Statut.Activated ? Statut.Desactivated : Statut.Activated);
                    user.setUpdatedAt(Instant.now());
                    return User.toDTO(userRepository.save(user));
                }).orElse(null);
    }

    public ResetPasswordResponse resetPassword(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(user -> {
                    user.setPassword(encoder.encode(defaultPassword));
                    // Forcer le changement de mot de passe après réinitialisation par un admin
                    user.setMustChangePassword(true);
                    user.setUpdatedAt(Instant.now());
                    userRepository.save(user);
                    return new ResetPasswordResponse("Mot de passe réinitialisé avec succès", defaultPassword);
                }).orElse(null);
    }

    /**
     * Permet à l'utilisateur de changer son mot de passe lors de la première
     * connexion (ou après une réinitialisation admin). Vérifie le mot de passe
     * actuel avant d'appliquer le nouveau.
     *
     * @param username        identifiant de l'utilisateur connecté
     * @param req             contient {@code currentPassword} et {@code newPassword}
     * @return {@code true} si le changement a réussi, {@code false} si le mot
     *         de passe actuel est incorrect ou l'utilisateur introuvable
     */
    public boolean changeFirstPassword(String username, ChangePasswordRequest req) {
        return userRepository.findByUsername(username)
                .filter(UserService::isNotDeleted)
                .map(user -> {
                    if (!encoder.matches(req.getCurrentPassword(), user.getPassword())) {
                        return false;
                    }
                    user.setPassword(encoder.encode(req.getNewPassword()));
                    user.setMustChangePassword(false);
                    user.setUpdatedAt(Instant.now());
                    userRepository.save(user);
                    return true;
                }).orElse(false);
    }

    // ── Suppression logique ──────────────────────────────────────────────────

    public String delete(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(exist -> {
                    exist.setIsDelete(Delete.Yes);
                    userRepository.save(exist);
                    return "Utilisateur supprimé avec succès";
                }).orElse(null);
    }

    // ── Insertion en lot ─────────────────────────────────────────────────────

    public boolean saveAll(List<User> users) {
        List<User> toSave = users.stream()
                .filter(user -> !userRepository.existsById(user.getId()))
                .toList();
        if (!toSave.isEmpty()) {
            userRepository.saveAll(toSave);
            return true;
        }
        return false;
    }

    // ── Helpers privés ───────────────────────────────────────────────────────

    private Role resolveRole(String roleId) {
        if (roleId == null) return null;
        return roleRepository.findById(roleId).orElse(null);
    }

    /**
     * Affecte les entités territoriales sur l'utilisateur en fonction du niveau
     * administratif du profil. Les niveaux inférieurs reçoivent aussi les entités
     * parentes pour conserver la cohérence de la hiérarchie.
     */
    private void applyTerritorialAssignment(User user, Role role,
                                             String regionId, String prefectureId, String communeId) {
        if (role == null) return;
        NiveauAdministratif niveau = role.getNiveauAdministratif();
        if (niveau == null || niveau == NiveauAdministratif.CENTRAL) return;

        if (regionId != null) {
            Region region = regionRepository.findById(UUID.fromString(regionId)).orElse(null);
            user.setRegion(region);
        }

        if ((niveau == NiveauAdministratif.PREFECTORAL || niveau == NiveauAdministratif.COMMUNAL)
                && prefectureId != null) {
            Prefecture prefecture = prefectureRepository.findById(UUID.fromString(prefectureId)).orElse(null);
            user.setPrefecture(prefecture);
        }

        if (niveau == NiveauAdministratif.COMMUNAL && communeId != null) {
            Commune commune = communeRepository.findById(UUID.fromString(communeId)).orElse(null);
            user.setCommune(commune);
        }
    }
}
