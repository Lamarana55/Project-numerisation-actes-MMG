package gov.ravec.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Pays;

public interface PaysRepository extends JpaRepository<Pays, UUID>{
    boolean existsByCode( String code);
    Optional<Pays> findByCode(String code);
}
