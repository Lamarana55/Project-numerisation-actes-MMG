package gov.ravec.backend.services;

import gov.ravec.backend.dto.UserDTO;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.Statut;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;

    private final PasswordEncoder encoder;

    @Value("${ravec.app.default-password}")
    private String defaultPassword;

    public UserService(UserRepository userRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    private static boolean isDelete(User user) {
        return user.getIsDelete() == Delete.No;
    }

    public List<UserDTO> index() {
        List<User> users = userRepository.findByIsDeleteOrderByCreatedAtDesc(Delete.No);
        return User.toDTOList(users);
    }

    public ResponseEntity<UserDTO> show(String id) {
        Optional<User> user = userRepository.findById(id)
                .filter(UserService::isDelete);

        return user
                .map(value -> ResponseEntity.ok(User.toDTO(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public User save(User user) {
        user.setId(UUID.randomUUID().toString());
        user.setCode(UUID.randomUUID().toString());
        user.setStatut(Statut.Activated);
        user.setPassword(encoder.encode(defaultPassword));
        return userRepository.save(user);
    }

    public User update(String id, User user) {
        return userRepository.findById(id).map(exist -> {
            exist.setCode(user.getCode());
            exist.setNom(user.getNom());
            exist.setPrenom(user.getPrenom());
            exist.setEmail(user.getEmail());
            exist.setTelephone(user.getTelephone());
            exist.setFonction(user.getFonction());
            exist.setRole(user.getRole());
            exist.setUsername(user.getUsername());

            exist.setUpdatedAt(Instant.now());
            return userRepository.save(exist);
        }).orElse(null);
    }

    public String delete(String id) {
        return userRepository.findById(id).filter(UserService::isDelete).map(exist -> {
            exist.setIsDelete(Delete.Yes);
            userRepository.save(exist);
            return "User deleted !";
        }).orElse(null);
    }

    public boolean saveAll(List<User> users) {
        List<User> userList = users.stream()
                .filter(user -> !userRepository.existsById(user.getId()))
                .toList();
        if (!userList.isEmpty()) {
            userRepository.saveAll(userList);
            return true;
        }
        return false;
    }
}
