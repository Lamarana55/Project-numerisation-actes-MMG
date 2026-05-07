package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ActeNaissanceRepository extends JpaRepository<ActeNaissance, String> {

    @Query("""
        SELECT a FROM ActeNaissance a
        LEFT JOIN a.enfant e
        LEFT JOIN a.commune c
        WHERE a.isDeleted = :deleted
          AND (CAST(:nom       AS string) IS NULL OR LOWER(e.nom)    LIKE LOWER(CONCAT('%', CAST(:nom       AS string), '%')))
          AND (CAST(:prenom    AS string) IS NULL OR LOWER(e.prenom) LIKE LOWER(CONCAT('%', CAST(:prenom    AS string), '%')))
          AND (CAST(:npi       AS string) IS NULL OR e.npi            = CAST(:npi       AS string))
          AND (CAST(:numeroActe AS string) IS NULL OR a.numeroActe   = CAST(:numeroActe AS string))
          AND (CAST(:source    AS string) IS NULL OR CAST(a.source AS string) = CAST(:source AS string))
          AND (CAST(:commune   AS string) IS NULL OR LOWER(c.nom)   LIKE LOWER(CONCAT('%', CAST(:commune   AS string), '%')))
          AND (:dateDebut IS NULL OR e.dateNaissance >= :dateDebut)
          AND (:dateFin   IS NULL OR e.dateNaissance <= :dateFin)
        ORDER BY a.createdAt DESC
        """)
    Page<ActeNaissance> search(
            @Param("nom")        String nom,
            @Param("prenom")     String prenom,
            @Param("npi")        String npi,
            @Param("numeroActe") String numeroActe,
            @Param("source")     String source,
            @Param("commune")    String commune,
            @Param("dateDebut")  LocalDate dateDebut,
            @Param("dateFin")    LocalDate dateFin,
            @Param("deleted")    Delete deleted,
            Pageable pageable
    );

    // ── Statistiques dashboard ────────────────────────────────────────────────

    @Query(value = """
        SELECT c.code, c.nom, p.code,
               COUNT(a.id),
               SUM(CASE WHEN pe.sexe = 'M' THEN 1 ELSE 0 END),
               SUM(CASE WHEN pe.sexe = 'F' THEN 1 ELSE 0 END)
        FROM acte_naissance a
        INNER JOIN commune c ON a.commune_id = c.id
        INNER JOIN prefecture p ON c.prefecture_id = p.id
        INNER JOIN region r ON p.region_id = r.id
        LEFT JOIN personne pe ON a.enfant_id = pe.id
        WHERE a.is_deleted = 'No'
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        GROUP BY c.code, c.nom, p.code
        """, nativeQuery = true)
    List<Object[]> statsByCommune(
            @Param("regionCode") String regionCode,
            @Param("prefCode")   String prefCode,
            @Param("comCode")    String comCode
    );

    @Query(value = """
        SELECT EXTRACT(YEAR  FROM a.created_at)::INT,
               EXTRACT(MONTH FROM a.created_at)::INT,
               COUNT(a.id)
        FROM acte_naissance a
        INNER JOIN commune c ON a.commune_id = c.id
        INNER JOIN prefecture p ON c.prefecture_id = p.id
        INNER JOIN region r ON p.region_id = r.id
        WHERE a.is_deleted = 'No'
          AND a.created_at >= :dateDebut
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        GROUP BY 1, 2
        ORDER BY 1, 2
        """, nativeQuery = true)
    List<Object[]> monthlyStats(
            @Param("dateDebut")  Instant dateDebut,
            @Param("regionCode") String  regionCode,
            @Param("prefCode")   String  prefCode,
            @Param("comCode")    String  comCode
    );

    @Query("""
        SELECT COUNT(a) FROM ActeNaissance a
        JOIN a.commune c JOIN c.prefecture p JOIN p.region r
        WHERE a.isDeleted = gov.ravec.backend.utils.Delete.No
          AND a.statut = :statut
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        """)
    long countByStatut(
            @Param("statut")     ValidationStatut statut,
            @Param("regionCode") String regionCode,
            @Param("prefCode")   String prefCode,
            @Param("comCode")    String comCode
    );

    // ── Statistiques rapport (avec plage de dates) ────────────────────────────

    @Query(value = """
        SELECT c.code, c.nom, p.code,
               COUNT(a.id),
               SUM(CASE WHEN pe.sexe = 'M' THEN 1 ELSE 0 END),
               SUM(CASE WHEN pe.sexe = 'F' THEN 1 ELSE 0 END)
        FROM acte_naissance a
        INNER JOIN commune c ON a.commune_id = c.id
        INNER JOIN prefecture p ON c.prefecture_id = p.id
        INNER JOIN region r ON p.region_id = r.id
        LEFT JOIN personne pe ON a.enfant_id = pe.id
        WHERE a.is_deleted = 'No'
          AND a.created_at >= :dateDebut
          AND a.created_at <= :dateFin
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        GROUP BY c.code, c.nom, p.code
        """, nativeQuery = true)
    List<Object[]> statsByCommunePeriode(
            @Param("dateDebut")  Instant dateDebut,
            @Param("dateFin")    Instant dateFin,
            @Param("regionCode") String  regionCode,
            @Param("prefCode")   String  prefCode,
            @Param("comCode")    String  comCode
    );

    @Query(value = """
        SELECT EXTRACT(YEAR  FROM a.created_at)::INT,
               EXTRACT(MONTH FROM a.created_at)::INT,
               COUNT(a.id)
        FROM acte_naissance a
        INNER JOIN commune c ON a.commune_id = c.id
        INNER JOIN prefecture p ON c.prefecture_id = p.id
        INNER JOIN region r ON p.region_id = r.id
        WHERE a.is_deleted = 'No'
          AND a.created_at >= :dateDebut
          AND a.created_at <= :dateFin
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        GROUP BY 1, 2
        ORDER BY 1, 2
        """, nativeQuery = true)
    List<Object[]> monthlyStatsPeriode(
            @Param("dateDebut")  Instant dateDebut,
            @Param("dateFin")    Instant dateFin,
            @Param("regionCode") String  regionCode,
            @Param("prefCode")   String  prefCode,
            @Param("comCode")    String  comCode
    );

    @Query("""
        SELECT COUNT(a) FROM ActeNaissance a
        JOIN a.commune c JOIN c.prefecture p JOIN p.region r
        WHERE a.isDeleted = gov.ravec.backend.utils.Delete.No
          AND a.statut = :statut
          AND a.createdAt >= :dateDebut
          AND a.createdAt <= :dateFin
          AND (:regionCode IS NULL OR r.code = :regionCode)
          AND (:prefCode   IS NULL OR p.code = :prefCode)
          AND (:comCode    IS NULL OR c.code = :comCode)
        """)
    long countByStatutPeriode(
            @Param("statut")     ValidationStatut statut,
            @Param("dateDebut")  Instant dateDebut,
            @Param("dateFin")    Instant dateFin,
            @Param("regionCode") String  regionCode,
            @Param("prefCode")   String  prefCode,
            @Param("comCode")    String  comCode
    );
}
