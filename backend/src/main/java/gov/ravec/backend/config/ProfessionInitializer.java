package gov.ravec.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ravec.backend.entities.Profession;
import gov.ravec.backend.repositories.ProfessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(4)
public class ProfessionInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ProfessionInitializer.class);

    private final ProfessionRepository professionRepository;
    private final ObjectMapper objectMapper;

    public ProfessionInitializer(ProfessionRepository professionRepository,
                                  ObjectMapper objectMapper) {
        this.professionRepository = professionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (professionRepository.count() > 0) {
            log.debug("=== ProfessionInitializer : données déjà présentes, skip ===");
            return;
        }
        log.info("=== ProfessionInitializer : chargement des professions ===");
        ClassPathResource resource = new ClassPathResource("data/professions.json");
        List<Profession> professions = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Profession>>() {}
        );
        professionRepository.saveAll(professions);
        log.info("=== {} professions chargées ===", professions.size());
    }
}
