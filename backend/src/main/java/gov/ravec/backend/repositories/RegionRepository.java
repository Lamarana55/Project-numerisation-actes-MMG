package gov.ravec.backend.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Region;

public interface RegionRepository extends JpaRepository<Region, UUID>{
    boolean existsByCode( String code);
    Optional<Region> findByCode(String code);
}
