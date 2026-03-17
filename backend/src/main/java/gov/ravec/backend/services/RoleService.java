package gov.ravec.backend.services;

import gov.ravec.backend.entities.Role;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.utils.Delete;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> index() {
        return roleRepository.findByIsDeleteOrderByCreatedAtDesc(Delete.No);
    }

    public Role show(String id) {
        return roleRepository.findByIdAndIsDelete(id, Delete.No).orElse(null);
    }


    public Role save(Role role) {
        return roleRepository.save(role);
    }

    public Role update(String id, Role role) {
        return roleRepository.findById(id).map(exist -> {
            exist.setNom(role.getNom());
            exist.setDescription(role.getDescription());
            exist.setPermissions(role.getPermissions());
            exist.setUpdatedAt(Instant.now());
            return roleRepository.save(exist);
        }).orElse(null);
    }

    public String delete(String id) {
        return roleRepository.findById(id).filter(role -> role.getIsDelete() == Delete.No).map(exist -> {
            exist.setIsDelete(Delete.Yes);
            roleRepository.save(exist);
            return "Role deleted !";
        }).orElse(null);
    }

    public Role findByNom(String nom) {
        return roleRepository.findByNom(nom).filter(role -> role.getIsDelete() == Delete.No).orElse(null);
    }

    public boolean saveAll(List<Role> roles) {
        List<Role> roleList = roles.stream()
                .filter(role -> !roleRepository.existsById(role.getId()))
                .toList();
        if (!roleList.isEmpty()) {
            roleRepository.saveAll(roleList);
            return true;
        }
        return false;
    }
}
