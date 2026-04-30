package gov.ravec.backend.config;

import gov.ravec.backend.entities.TypeActe;
import gov.ravec.backend.repositories.TypeActeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Initialise les types d'actes de base (NAISSANCE, DECES, MARIAGE).
 * S'exécute après DataLoader (@Order 2). Idempotent.
 */
@Component
@Order(3)
public class TypeActeInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(TypeActeInitializer.class);

    private final TypeActeRepository typeActeRepository;

    public TypeActeInitializer(TypeActeRepository typeActeRepository) {
        this.typeActeRepository = typeActeRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== TypeActeInitializer : initialisation des types d'actes ===");
        creerSiAbsent("NAISSANCE", "Acte de Naissance",
                "Acte constatant la naissance d'une personne");
        creerSiAbsent("DECES",     "Acte de Décès",
                "Acte constatant le décès d'une personne");
        creerSiAbsent("MARIAGE",   "Acte de Mariage",
                "Acte constatant le mariage entre deux personnes");
        log.info("=== TypeActeInitializer : terminé ===");
    }

    private void creerSiAbsent(String code, String libelle, String description) {
        if (typeActeRepository.existsByCode(code)) {
            log.debug("  [type-acte] Déjà existant : {}", code);
            return;
        }
        TypeActe type = new TypeActe();
        type.setId("TA-" + code);
        type.setCode(code);
        type.setLibelle(libelle);
        type.setDescription(description);
        type.setActif(true);
        typeActeRepository.save(type);
        log.info("  [type-acte] Créé : {}", code);
    }
}
