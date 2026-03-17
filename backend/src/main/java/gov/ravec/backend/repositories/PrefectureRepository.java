package gov.ravec.backend.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import gov.ravec.backend.entities.Prefecture;
import gov.ravec.backend.entities.Region;

public interface PrefectureRepository extends JpaRepository<Prefecture, UUID>{
    boolean existsByCode( String code);
    Optional<Prefecture> findByCode(String code);
    List<Prefecture> findByRegion(Region region);
}
