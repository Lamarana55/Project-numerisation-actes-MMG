package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.User;
import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ValidBirthRepository extends JpaRepository<ValidBirth, String> {

    // ── Recherche par ID (soft-delete aware) ─────────────────────────────────

    Optional<ValidBirth> findByIdAndIsDeleted(String id, Delete isDeleted);

    // ── Accès CENTRAL : tous les actes ───────────────────────────────────────

    Page<ValidBirth> findByIsDeletedOrderByCreatedAtDesc(Delete isDeleted, Pageable pageable);

    @Query("""
        SELECT v FROM ValidBirth v
        WHERE v.isDeleted = :isDeleted
          AND (:statut IS NULL OR v.statut = :statut)
          AND (:region IS NULL OR v.region = :region)
          AND (:prefecture IS NULL OR v.prefecture = :prefecture)
          AND (:commune IS NULL OR v.commune = :commune)
        ORDER BY v.createdAt DESC
    """)
    Page<ValidBirth> findAllWithFilters(
            @Param("isDeleted") Delete isDeleted,
            @Param("statut") ValidationStatut statut,
            @Param("region") String region,
            @Param("prefecture") String prefecture,
            @Param("commune") String commune,
            Pageable pageable
    );

    // ── Accès REGIONAL : actes de la région de l'utilisateur ─────────────────

    @Query("""
        SELECT v FROM ValidBirth v
        WHERE v.isDeleted = :isDeleted
          AND v.region = :region
          AND (:statut IS NULL OR v.statut = :statut)
          AND (:prefecture IS NULL OR v.prefecture = :prefecture)
          AND (:commune IS NULL OR v.commune = :commune)
        ORDER BY v.createdAt DESC
    """)
    Page<ValidBirth> findByRegionWithFilters(
            @Param("isDeleted") Delete isDeleted,
            @Param("region") String region,
            @Param("statut") ValidationStatut statut,
            @Param("prefecture") String prefecture,
            @Param("commune") String commune,
            Pageable pageable
    );

    // ── Accès PREFECTORAL : actes de la préfecture de l'utilisateur ──────────

    @Query("""
        SELECT v FROM ValidBirth v
        WHERE v.isDeleted = :isDeleted
          AND v.prefecture = :prefecture
          AND (:statut IS NULL OR v.statut = :statut)
          AND (:commune IS NULL OR v.commune = :commune)
        ORDER BY v.createdAt DESC
    """)
    Page<ValidBirth> findByPrefectureWithFilters(
            @Param("isDeleted") Delete isDeleted,
            @Param("prefecture") String prefecture,
            @Param("statut") ValidationStatut statut,
            @Param("commune") String commune,
            Pageable pageable
    );

    // ── Accès COMMUNAL (ODEC, SUPERVISEUR) : actes de la commune ─────────────

    @Query("""
        SELECT v FROM ValidBirth v
        WHERE v.isDeleted = :isDeleted
          AND v.commune = :commune
          AND (:statut IS NULL OR v.statut = :statut)
        ORDER BY v.createdAt DESC
    """)
    Page<ValidBirth> findByCommuneWithFilters(
            @Param("isDeleted") Delete isDeleted,
            @Param("commune") String commune,
            @Param("statut") ValidationStatut statut,
            Pageable pageable
    );

    // ── Accès AGENT : uniquement ses propres actes ────────────────────────────

    @Query("""
        SELECT v FROM ValidBirth v
        WHERE v.isDeleted = :isDeleted
          AND v.user = :agent
          AND (:statut IS NULL OR v.statut = :statut)
        ORDER BY v.createdAt DESC
    """)
    Page<ValidBirth> findByAgentWithFilters(
            @Param("isDeleted") Delete isDeleted,
            @Param("agent") User agent,
            @Param("statut") ValidationStatut statut,
            Pageable pageable
    );
}
