package gov.ravec.backend.services;

import gov.ravec.backend.entities.Permission;
import gov.ravec.backend.repositories.PermissionRepository;
import gov.ravec.backend.utils.Delete;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PermissionService {
    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    private static boolean isDelete(Permission permission){
        return permission.getIsDelete() == Delete.No;
    }

    public List<Permission> index(){
        return permissionRepository.findAll()
                .stream()
                .filter(PermissionService::isDelete)
                .collect(Collectors.toList());
    }

    public Permission show(String id){
        return permissionRepository.findById(id).filter(PermissionService::isDelete).orElse(null);
    }

    /*public Permission save(Permission permission){
        return permissionRepository.save(permission);
    }*/

    public Permission save(Permission permission) {
        if (permission.getId() == null || permission.getId().isBlank()) {
            // Récupère le dernier code existant
            Optional<String> lastCode = permissionRepository.findLastPermissionId();
            int nextIndex = 1;
            if (lastCode.isPresent()) {
                // Extrait le numéro du code existant (ex : PERM_031 => 31)
                String codeStr = lastCode.get().replace("PERM_", "");
                try {
                    nextIndex = Integer.parseInt(codeStr) + 1;
                } catch (NumberFormatException e) {
                    nextIndex = 1; // fallback
                }
            }

            // Formate le nouveau code avec 3 chiffres
            String newCode = String.format("PERM_%03d", nextIndex);
            permission.setId(newCode);
        }

        return permissionRepository.save(permission);
    }
    public Permission update(String id, Permission permission){
        return permissionRepository.findById(id).map(exist -> {
            exist.setNom(permission.getNom());
            exist.setDescription(permission.getDescription());
            exist.setUpdatedAt(Instant.now());
            return permissionRepository.save(exist);
        }).orElse(null);
    }

    public String delete(String id){
        return permissionRepository.findById(id).filter(PermissionService::isDelete).map(exist -> {
            exist.setIsDelete(Delete.Yes);
            permissionRepository.save(exist);
            return "Permission deleted !";
        }).orElse(null);
    }
    public Permission findByNom(String nom){
        return permissionRepository.findByNom(nom).filter(PermissionService::isDelete).orElse(null);
    }

    public boolean saveAll(List<Permission> permissions) {
        List<Permission> permissionList = permissions.stream()
                .filter(permission ->  !permissionRepository.existsById(permission.getId()))
                .toList();
        if(!permissionList.isEmpty()){
            permissionRepository.saveAll(permissionList);
            return true;
        }
        return false;
    }
}
