package gov.ravec.backend.repositories;

import gov.ravec.backend.entities.Personne;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonneRepository extends JpaRepository<Personne, String> {
    Optional<Personne> findByNpi(String npi);
    List<Personne> findByNomIgnoreCaseAndPrenomIgnoreCaseAndDateNaissance(
            String nom, String prenom, LocalDate dateNaissance);
}
