package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.utils.Delete;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ActeNaissanceRepository extends JpaRepository<ActeNaissance, String> {

    /**
     * Recherche paginée tous critères optionnels.
     * Les paramètres null sont ignorés (pas de filtre sur ce champ).
     */
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
}
