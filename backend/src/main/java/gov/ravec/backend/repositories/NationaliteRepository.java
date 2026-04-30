package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.Nationalite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NationaliteRepository extends JpaRepository<Nationalite, String> {
}
