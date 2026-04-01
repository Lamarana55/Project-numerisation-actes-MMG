package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.Prefecture;
import gov.ravec.backend.entities.Region;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.NiveauAdministratif;
import gov.ravec.backend.utils.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    // ── Recherches de base ───────────────────────────────────────────────────
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByCode(String code);
    Optional<User> findByTelephone(String telephone);
    Optional<User> findByResetPasswordToken(String resetPasswordToken);

    // ── Recherches avec vérification de suppression ──────────────────────────
    Optional<User> findByUsernameAndIsDelete(String username, Delete isDelete);
    Optional<User> findByEmailAndIsDelete(String email, Delete isDelete);
    Optional<User> findByCodeAndIsDelete(String code, Delete isDelete);

    // ── Recherches combinées ─────────────────────────────────────────────────
    Optional<User> findByUsernameOrEmail(String username, String email);
    Optional<User> findByUsernameOrEmailAndIsDelete(String username, String email, Delete isDelete);

    List<User> findByIsDeleteOrderByCreatedAtDesc(Delete isDelete);

    // ── Pagination de base ───────────────────────────────────────────────────
    Page<User> findByIsDeleteOrderByCreatedAtDesc(Delete isDelete, Pageable pageable);
    Page<User> findByStatutAndIsDeleteOrderByCreatedAtDesc(Statut statut, Delete isDelete, Pageable pageable);
    Page<User> findByRoleNomAndIsDeleteOrderByCreatedAtDesc(String roleNom, Delete isDelete, Pageable pageable);

    // ── Filtres par profil (niveau administratif) ────────────────────────────
    List<User> findByRoleNiveauAdministratifAndIsDeleteOrderByCreatedAtDesc(
            NiveauAdministratif niveauAdministratif, Delete isDelete);

    // ── Filtres territoriaux ─────────────────────────────────────────────────
    List<User> findByRegionAndIsDeleteOrderByCreatedAtDesc(Region region, Delete isDelete);
    List<User> findByPrefectureAndIsDeleteOrderByCreatedAtDesc(Prefecture prefecture, Delete isDelete);
    List<User> findByCommuneAndIsDeleteOrderByCreatedAtDesc(Commune commune, Delete isDelete);

    // ── Comptage pour les statistiques ───────────────────────────────────────
    long countByIsDelete(Delete isDelete);
    long countByStatutAndIsDelete(Statut statut, Delete isDelete);
    long countByRoleNomAndIsDelete(String roleNom, Delete isDelete);
    long countByRoleNiveauAdministratifAndIsDelete(NiveauAdministratif niveauAdministratif, Delete isDelete);
}
