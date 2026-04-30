package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.DocumentActe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentActeRepository extends JpaRepository<DocumentActe, String> {
    List<DocumentActe> findByActeNaissanceId(String acteNaissanceId);
    List<DocumentActe> findByActeDecesId(String acteDecesId);
}
