package gov.ravec.backend.services;

import gov.ravec.backend.dto.ResetPasswordResponse;
import gov.ravec.backend.dto.UserCreateRequest;
import gov.ravec.backend.dto.UserDTO;
import gov.ravec.backend.dto.UserUpdateRequest;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.utils.Delete;
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
    private final PasswordEncoder encoder;

    @Value("${ravec.app.default-password}")
    private String defaultPassword;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
    }

    private static boolean isNotDeleted(User user) {
        return user.getIsDelete() == Delete.No;
    }

    public List<UserDTO> index() {
        return User.toDTOList(userRepository.findByIsDeleteOrderByCreatedAtDesc(Delete.No));
    }

    public ResponseEntity<UserDTO> show(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(u -> ResponseEntity.ok(User.toDTO(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public UserDTO save(UserCreateRequest req) {
        Role role = req.getRoleId() != null
                ? roleRepository.findById(req.getRoleId()).orElse(null)
                : null;

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
        return User.toDTO(userRepository.save(user));
    }

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
                    // Résoudre le Role depuis la BDD pour éviter l'entité détachée
                    if (req.getRoleId() != null) {
                        roleRepository.findById(req.getRoleId()).ifPresent(exist::setRole);
                    }
                    if (req.getStatut() != null) {
                        exist.setStatut(req.getStatut());
                    }
                    exist.setUpdatedAt(Instant.now());
                    return User.toDTO(userRepository.save(exist));
                }).orElse(null);
    }

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
                    user.setUpdatedAt(Instant.now());
                    userRepository.save(user);
                    return new ResetPasswordResponse("Mot de passe réinitialisé avec succès", defaultPassword);
                }).orElse(null);
    }

    public String delete(String id) {
        return userRepository.findById(id)
                .filter(UserService::isNotDeleted)
                .map(exist -> {
                    exist.setIsDelete(Delete.Yes);
                    userRepository.save(exist);
                    return "Utilisateur supprimé avec succès";
                }).orElse(null);
    }

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
}
