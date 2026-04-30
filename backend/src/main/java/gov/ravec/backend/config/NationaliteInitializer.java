package gov.ravec.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ravec.backend.entities.Nationalite;
import gov.ravec.backend.repositories.NationaliteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Order(5)
public class NationaliteInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(NationaliteInitializer.class);

    private final NationaliteRepository nationaliteRepository;
    private final ObjectMapper objectMapper;

    public NationaliteInitializer(NationaliteRepository nationaliteRepository,
                                   ObjectMapper objectMapper) {
        this.nationaliteRepository = nationaliteRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (nationaliteRepository.count() > 0) {
            log.debug("=== NationaliteInitializer : données déjà présentes, skip ===");
            return;
        }
        log.info("=== NationaliteInitializer : chargement des nationalités ===");
        ClassPathResource resource = new ClassPathResource("data/nationalites.json");
        List<Nationalite> nationalites = objectMapper.readValue(
                resource.getInputStream(),
                new TypeReference<List<Nationalite>>() {}
        );
        nationaliteRepository.saveAll(nationalites);
        log.info("=== {} nationalités chargées ===", nationalites.size());
    }
}
