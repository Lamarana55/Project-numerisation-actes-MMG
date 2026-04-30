package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.TypeActe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TypeActeRepository extends JpaRepository<TypeActe, String> {
    Optional<TypeActe> findByCode(String code);
    boolean existsByCode(String code);
}
