package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.ActeDeces;
import gov.ravec.backend.utils.Delete;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;

@Repository
public interface ActeDecesRepository extends JpaRepository<ActeDeces, String> {

    @Query("""
        SELECT a FROM ActeDeces a
        LEFT JOIN a.defunt d
        LEFT JOIN a.commune c
        WHERE a.isDeleted = :deleted
          AND (CAST(:nom        AS string) IS NULL OR LOWER(d.nom)    LIKE LOWER(CONCAT('%', CAST(:nom        AS string), '%')))
          AND (CAST(:prenom     AS string) IS NULL OR LOWER(d.prenom) LIKE LOWER(CONCAT('%', CAST(:prenom     AS string), '%')))
          AND (CAST(:numeroActe AS string) IS NULL OR a.numeroActe    = CAST(:numeroActe AS string))
          AND (CAST(:commune    AS string) IS NULL OR LOWER(c.nom)    LIKE LOWER(CONCAT('%', CAST(:commune    AS string), '%')))
          AND (:dateDebut IS NULL OR a.dateDeces >= :dateDebut)
          AND (:dateFin   IS NULL OR a.dateDeces <= :dateFin)
        ORDER BY a.createdAt DESC
        """)
    Page<ActeDeces> search(
            @Param("nom")        String nom,
            @Param("prenom")     String prenom,
            @Param("numeroActe") String numeroActe,
            @Param("commune")    String commune,
            @Param("dateDebut")  LocalDate dateDebut,
            @Param("dateFin")    LocalDate dateFin,
            @Param("deleted")    Delete deleted,
            Pageable pageable
    );
}
