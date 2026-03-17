package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.User;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // Recherches de base
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByCode(String code);
    Optional<User> findByTelephone(String telephone);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    // Recherches avec vérification de suppression
    Optional<User> findByUsernameAndIsDelete(String username, Delete isDelete);
    Optional<User> findByEmailAndIsDelete(String email, Delete isDelete);
    Optional<User> findByCodeAndIsDelete(String code, Delete isDelete);

    // Recherches combinées
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsernameOrEmailAndIsDelete(String username, String email, Delete isDelete);

    List<User> findByIsDeleteOrderByCreatedAtDesc(Delete isDelete);

    // Recherches avec pagination
    Page<User> findByIsDeleteOrderByCreatedAtDesc(Delete isDelete, Pageable pageable);
    Page<User> findByStatutAndIsDeleteOrderByCreatedAtDesc(Statut statut, Delete isDelete, Pageable pageable);
    Page<User> findByRoleNomAndIsDeleteOrderByCreatedAtDesc(String roleNom, Delete isDelete, Pageable pageable);
}