package gov.ravec.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.Prefecture;

public interface CommuneRepository extends JpaRepository<Commune, UUID>{
    boolean existsByCode( String code);
    Optional<Commune> findByCode(String code);
    Optional<Commune> findByNom(String nom);
    List<Commune> findByPrefecture(Prefecture prefecture);
}
