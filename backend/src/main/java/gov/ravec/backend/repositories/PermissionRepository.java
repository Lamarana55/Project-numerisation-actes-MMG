package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, String > {
    Optional<Permission> findByNom(String nom);
    @Query("SELECT p.id FROM Permission p WHERE p.id LIKE 'PERM_%' ORDER BY p.id DESC LIMIT 1")
    Optional<String> findLastPermissionId();

}
