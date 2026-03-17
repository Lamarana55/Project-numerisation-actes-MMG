package gov.ravec.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Pays;
import gov.ravec.backend.entities.Ville;

public interface VilleRepository extends JpaRepository<Ville, UUID>{
    boolean existsByCode( String code);
    Optional<Ville> findByCode(String code);
    List<Ville> findByPays(Pays pays);
}
