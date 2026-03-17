package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.Permission;

import org.springframework.data.jpa.repository.JpaRepository;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.utils.Delete;

import java.util.List;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, String> {
    List<Role> findByIsDeleteOrderByCreatedAtDesc(Delete isDelete);

    Optional<Role> findByNomAndIsDelete(String nom, Delete isDelete);
    Optional<Role> findByIdAndIsDelete(String id, Delete isDelete);

    Optional<Role> findByNom(String nom);

    Optional<Role> findByNomAndPermissions(String nom, Permission permission);
}
