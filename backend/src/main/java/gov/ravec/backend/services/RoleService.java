package gov.ravec.backend.services;

import gov.ravec.backend.dto.RoleRequestDTO;
import gov.ravec.backend.entities.Permission;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.repositories.PermissionRepository;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.utils.Delete;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public RoleService(RoleRepository roleRepository, PermissionRepository permissionRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
    }

    public List<Role> index() {
        return roleRepository.findByIsDeleteOrderByCreatedAtDesc(Delete.No);
    }

    public ResponseEntity<Role> show(String id) {
        return roleRepository.findByIdAndIsDelete(id, Delete.No)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public Role save(RoleRequestDTO req) {
        Role role = new Role();
        role.setId(UUID.randomUUID().toString());
        role.setNom(req.getNom());
        role.setDescription(req.getDescription());
        role.setPermissions(resolvePermissions(req.getPermissionIds()));
        return roleRepository.save(role);
    }

    public Role update(String id, RoleRequestDTO req) {
        return roleRepository.findByIdAndIsDelete(id, Delete.No).map(exist -> {
            exist.setNom(req.getNom());
            exist.setDescription(req.getDescription());
            exist.setPermissions(resolvePermissions(req.getPermissionIds()));
            exist.setUpdatedAt(Instant.now());
            return roleRepository.save(exist);
        }).orElse(null);
    }

    public ResponseEntity<String> delete(String id) {
        return roleRepository.findByIdAndIsDelete(id, Delete.No).map(exist -> {
            exist.setIsDelete(Delete.Yes);
            roleRepository.save(exist);
            return ResponseEntity.ok("Rôle supprimé avec succès");
        }).orElse(ResponseEntity.notFound().build());
    }

    public Role findByNom(String nom) {
        return roleRepository.findByNom(nom)
                .filter(r -> r.getIsDelete() == Delete.No)
                .orElse(null);
    }

    public boolean saveAll(List<Role> roles) {
        List<Role> toSave = roles.stream()
                .filter(role -> !roleRepository.existsById(role.getId()))
                .toList();
        if (!toSave.isEmpty()) {
            roleRepository.saveAll(toSave);
            return true;
        }
        return false;
    }

    private Set<Permission> resolvePermissions(Set<String> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(permissionRepository.findAllById(ids));
    }
}
