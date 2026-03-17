package gov.ravec.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.Quartier;
import java.util.List;


public interface QuartierRepository extends JpaRepository<Quartier, UUID>{
    boolean existsByCode( String code);
    Optional<Quartier> findByCode(String code);
    List<Quartier> findByCommune(Commune commune);
}
