package gov.ravec.backend.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ravec.backend.entities.*;
import gov.ravec.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeoDataLoader implements CommandLineRunner {

    private final PaysRepository paysRepository;
    private final VilleRepository villeRepository;
    private final RegionRepository regionRepository;
    private final PrefectureRepository prefectureRepository;
    private final CommuneRepository communeRepository;
    private final QuartierRepository quartierRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        log.info("✨ Début du chargement des données géographiques ... ");

        chargerPays();
        chargerVilles();
        chargerRegions();
        chargerPrefectures();
        chargerCommunes();
        chargerQuartiers();

        log.info("✅ Chargement des données terminé avec succès!");
    }

    private void chargerPays() throws Exception {
        log.info("✨ Chargement des pays...");

        List<Map<String, String>> paysData = objectMapper.readValue(
                new ClassPathResource("data/pays.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : paysData) {
            String code = data.get("code");

            if (!paysRepository.existsByCode(code)) {
                Pays pays = Pays.builder()
                        .code(code)
                        .nom(data.get("nom"))
                        .codeRegion(data.get("codeRegion"))
                        .codeNumerique(data.get("codeNumerique"))
                        .build();

                paysRepository.save(pays);
                log.info("Pays créé: {} - {}", code, data.get("nom"));
            } else {
                log.debug("Pays existant: {}", code);
            }
        }
    }

    private void chargerVilles() throws Exception {
        log.info("Chargement des villes...");

        List<Map<String, String>> villesData = objectMapper.readValue(
                new ClassPathResource("data/villes.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : villesData) {
            String code = data.get("code");

            if (!villeRepository.existsByCode(code)) {
                String codePays = data.get("codePays");
                Pays pays = paysRepository.findByCode(codePays)
                        .orElseThrow(() -> new RuntimeException("Pays non trouvé: " + codePays));

                Ville ville = Ville.builder()
                        .code(code)
                        .nom(data.get("nom"))
                        .codePays(codePays)
                        .pays(pays)
                        .build();

                villeRepository.save(ville);
                log.info("Ville créée: {} - {}", code, data.get("nom"));
            } else {
                log.debug("Ville existante: {}", code);
            }
        }
    }

    private void chargerRegions() throws Exception {
        log.info("✨ Chargement des régions...");

        List<Map<String, String>> regionsData = objectMapper.readValue(
                new ClassPathResource("data/regions.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : regionsData) {
            String code = data.get("code");

            if (!regionRepository.existsByCode(code)) {
                Region region = Region.builder()
                        .code(code)
                        .nom(data.get("nom"))
                        .build();

                regionRepository.save(region);
                log.info("Région créée: {} - {}", code, data.get("nom"));
            } else {
                log.debug("Région existante: {}", code);
            }
        }
    }

    private void chargerPrefectures() throws Exception {
        log.info("✨ Chargement des préfectures...");

        List<Map<String, String>> prefecturesData = objectMapper.readValue(
                new ClassPathResource("data/prefectures.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : prefecturesData) {
            String code = data.get("code");

            if (!prefectureRepository.existsByCode(code)) {
                String codeRegion = data.get("codeRegion");
                Region region = regionRepository.findByCode(codeRegion)
                        .orElseThrow(() -> new RuntimeException("Région non trouvée: " + codeRegion));

                Prefecture prefecture = Prefecture.builder()
                        .code(code)
                        .nom(data.get("nom"))
                        .region(region)
                        .build();

                prefectureRepository.save(prefecture);
                log.info("Préfecture créée: {} - {}", code, data.get("nom"));
            } else {
                log.debug("Préfecture existante: {}", code);
            }
        }
    }

    private void chargerCommunes() throws Exception {
        log.info("✨ Chargement des communes...");

        List<Map<String, String>> communesData = objectMapper.readValue(
                new ClassPathResource("data/communes.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : communesData) {
            String code = data.get("code");

            if (!communeRepository.existsByCode(code)) {
                String codePrefecture = data.get("prefectureCode");
                Prefecture prefecture = prefectureRepository.findByCode(codePrefecture)
                        .orElseThrow(() -> new RuntimeException("Préfecture non trouvée: " + codePrefecture));

                Commune commune = Commune.builder()
                        .code(code)
                        .nom(data.get("nom"))
                        .prefecture(prefecture)
                        .build();

                communeRepository.save(commune);
                log.info("Commune créée: {} - {}", code, data.get("nom"));
            } else {
                log.debug("Commune existante: {}", code);
            }
        }
    }

    private void chargerQuartiers() throws Exception {
        log.info("✨ Chargement des quartiers...");

        List<Map<String, String>> quartiersData = objectMapper.readValue(
                new ClassPathResource("data/quartiers.json").getInputStream(),
                new TypeReference<>() {
                });

        for (Map<String, String> data : quartiersData) {
            String codeCommune = data.get("communeCode");
            String codePartiel = data.get("code");

            // Recomposer le code: communeCode + les 2 derniers caractères du code
            String deuxDerniersChiffres = codePartiel.substring(codePartiel.length() - 2);
            String codeFinal = codeCommune + deuxDerniersChiffres;

            if (!quartierRepository.existsByCode(codeFinal)) {
                Commune commune = communeRepository.findByCode(codeCommune)
                        .orElseThrow(() -> new RuntimeException("Commune non trouvée: " + codeCommune));

                Quartier quartier = Quartier.builder()
                        .code(codeFinal)
                        .nom(data.get("nom"))
                        .commune(commune)
                        .build();

                quartierRepository.save(quartier);
                log.info("Quartier créé: {} - {}", codeFinal, data.get("nom"));
            } else {
                log.debug("Quartier existant: {}", codeFinal);
            }
        }
    }

}