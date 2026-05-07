package gov.ravec.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ravec.backend.entities.CauseDeces;
import gov.ravec.backend.repositories.CauseDecesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(6)
public class CauseDecesInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CauseDecesInitializer.class);

    private final CauseDecesRepository causeDecesRepository;
    private final ObjectMapper objectMapper;

    public CauseDecesInitializer(CauseDecesRepository causeDecesRepository,
                                  ObjectMapper objectMapper) {
        this.causeDecesRepository = causeDecesRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (causeDecesRepository.count() > 0) {
            log.debug("=== CauseDecesInitializer : données déjà présentes, skip ===");
            return;
        }
        log.info("=== CauseDecesInitializer : chargement des causes de décès ===");
        ClassPathResource resource = new ClassPathResource("data/causes_deces.json");
        List<CauseDeces> causes = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<CauseDeces>>() {}
        );
        causeDecesRepository.saveAll(causes);
        log.info("=== {} causes de décès chargées ===", causes.size());
    }
}
