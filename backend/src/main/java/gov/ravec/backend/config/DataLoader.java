package gov.ravec.backend.config;

import gov.ravec.backend.entities.*;
import gov.ravec.backend.repositories.*;
import gov.ravec.backend.utils.Statut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.*;

/**
 * ============================================================
 *  DataLoader — PN-RAVEC
 *  Crée les utilisateurs de référence du système.
 *  S'exécute APRÈS DataInitializer (@Order 1) grâce à @Order(2).
 *  Idempotent : ne recrée rien si des utilisateurs existent déjà.
 * ============================================================
 *
 * COMPTES CRÉÉS
 * ─────────────────────────────────────────────────────────────
 *  NIVEAU CENTRAL (3 comptes fixes)
 *    superadmin@ravec.gov.gn   → SUPER_ADMINISTRATEUR
 *    admin@ravec.gov.gn        → ADMINISTRATEUR
 *    analyste@ravec.gov.gn     → ANALYSTE
 *
 *  NIVEAU RÉGIONAL (1 compte par région)
 *    cr_[region]@ravec.gov.gn  → COORDINATEUR_REGIONAL
 *
 *  NIVEAU PRÉFECTORAL (1 compte par préfecture)
 *    cp_[prefecture]@ravec.gov.gn → COORDINATEUR_PREFECTORAL
 *
 *  NIVEAU COMMUNAL (2 comptes par commune)
 *    sup_[commune]@ravec.gov.gn   → SUPERVISEUR
 *    odec_[commune]@ravec.gov.gn  → ODEC
 *
 *  Mot de passe par défaut : Ravec@2024
 * ============================================================
 */
@Component
@Order(2)
public class DataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    /** Mot de passe initial commun à tous les comptes de référence. */
    static final String DEFAULT_PASSWORD = "Ravec@2024";

    // ── Noms techniques des profils (doivent correspondre à DataInitializer) ─
    private static final String PROFIL_SUPER_ADMIN       = "SUPER_ADMINISTRATEUR";
    private static final String PROFIL_ADMIN             = "ADMINISTRATEUR";
    private static final String PROFIL_ANALYSTE          = "ANALYSTE";
    private static final String PROFIL_COORD_REGIONAL    = "COORDINATEUR_REGIONAL";
    private static final String PROFIL_COORD_PREFECTORAL = "COORDINATEUR_PREFECTORAL";
    private static final String PROFIL_SUPERVISEUR       = "SUPERVISEUR";
    private static final String PROFIL_ODEC              = "ODEC";

    @Autowired private UserRepository       userRepository;
    @Autowired private RoleRepository       roleRepository;
    @Autowired private RegionRepository     regionRepository;
    @Autowired private PrefectureRepository prefectureRepository;
    @Autowired private CommuneRepository    communeRepository;
    @Autowired private PasswordEncoder      passwordEncoder;

    // ─────────────────────────────────────────────────────────────────────────
    //  POINT D'ENTRÉE
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("=== DataLoader : utilisateurs déjà présents — arrêt ===");
            return;
        }

        log.info("=== DataLoader PN-RAVEC : création des utilisateurs de référence ===");

        // 1. Charger les profils créés par DataInitializer
        Map<String, Role> profils = chargerProfils();
        if (profils.size() < 7) {
            log.error("  ERREUR : seulement {}/7 profils disponibles. " +
                      "Vérifier que DataInitializer s'est exécuté correctement.", profils.size());
            return;
        }

        // 2. Charger l'arborescence territoriale en mémoire (évite les N+1 queries)
        List<Region> regions = regionRepository.findAll();
        if (regions.isEmpty()) {
            log.warn("  ATTENTION : aucune région trouvée — " +
                     "vérifier que GeoDataLoader s'est exécuté correctement.");
        }

        Map<Region, List<Prefecture>>  prefParRegion  = new LinkedHashMap<>();
        Map<Prefecture, List<Commune>> communeParPref = new LinkedHashMap<>();

        for (Region region : regions) {
            List<Prefecture> prefectures = prefectureRepository.findByRegion(region);
            prefParRegion.put(region, prefectures);
            for (Prefecture prefecture : prefectures) {
                communeParPref.put(prefecture, communeRepository.findByPrefecture(prefecture));
            }
        }

        // 3. Créer les utilisateurs niveau par niveau
        int total = 0;
        total += creerUtilisateursCentrals(profils);
        total += creerCoordinateursRegionaux(profils.get(PROFIL_COORD_REGIONAL), prefParRegion);
        total += creerCoordinateursPrefectoraux(profils.get(PROFIL_COORD_PREFECTORAL),
                                                prefParRegion);
        total += creerSuperviseursCommunaux(profils.get(PROFIL_SUPERVISEUR),
                                            prefParRegion, communeParPref);
        total += creerOfficiersCivils(profils.get(PROFIL_ODEC),
                                      prefParRegion, communeParPref);

        log.info("=== DataLoader : {} utilisateurs créés ===", total);
        log.info("    Mot de passe par défaut : {}", DEFAULT_PASSWORD);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  NIVEAU CENTRAL — 3 comptes fixes
    // ─────────────────────────────────────────────────────────────────────────

    private int creerUtilisateursCentrals(Map<String, Role> profils) {
        int count = 0;

        // Super-Administrateur — accès total, aucune restriction territoriale
        count += creer(User.builder()
                .id("USR-SA-001")
                .code("SA-001")
                .nom("DIALLO").prenom("Mamadou Alpha")
                .email("superadmin@ravec.gov.gn").username("superadmin@ravec.gov.gn")
                .telephone("+224621000001")
                .fonction("Super-Administrateur National")
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(profils.get(PROFIL_SUPER_ADMIN))
                .statut(Statut.Activated)
                .build());

        // Administrateur — gestion opérationnelle nationale, sans accès aux permissions
        count += creer(User.builder()
                .id("USR-ADM-001")
                .code("ADM-001")
                .nom("BARRY").prenom("Aissatou")
                .email("admin@ravec.gov.gn").username("admin@ravec.gov.gn")
                .telephone("+224621000002")
                .fonction("Administrateur National")
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(profils.get(PROFIL_ADMIN))
                .statut(Statut.Activated)
                .build());

        // Analyste — lecture et analyse des données nationales, aucune écriture
        count += creer(User.builder()
                .id("USR-ANL-001")
                .code("ANL-001")
                .nom("CAMARA").prenom("Ibrahima Sory")
                .email("analyste@ravec.gov.gn").username("analyste@ravec.gov.gn")
                .telephone("+224621000003")
                .fonction("Analyste National des Données")
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(profils.get(PROFIL_ANALYSTE))
                .statut(Statut.Activated)
                .build());

        log.info("  [CENTRAL]       {} compte(s) : superadmin / admin / analyste", count);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  NIVEAU RÉGIONAL — 1 coordinateur par région
    //  Login : cr_[slug_region]@ravec.gov.gn
    // ─────────────────────────────────────────────────────────────────────────

    private int creerCoordinateursRegionaux(Role profil,
                                            Map<Region, List<Prefecture>> prefParRegion) {
        int count = 0;
        int index = 1;
        for (Region region : prefParRegion.keySet()) {
            String email = "cr_" + slug(region.getNom()) + "@ravec.gov.gn";
            count += creer(User.builder()
                    .id("USR-CR-" + String.format("%03d", index))
                    .code("CR-" + sanitizeCode(region.getCode()))
                    .nom("COORDINATEUR").prenom("Régional " + region.getNom())
                    .email(email).username(email)
                    .telephone("+224622" + String.format("%06d", index))
                    .fonction("Coordinateur Régional — " + region.getNom())
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .role(profil)
                    .region(region)
                    .statut(Statut.Activated)
                    .build());
            index++;
        }
        log.info("  [REGIONAL]      {} coordinateur(s) régional/aux", count);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  NIVEAU PRÉFECTORAL — 1 coordinateur par préfecture
    //  Login : cp_[slug_prefecture]@ravec.gov.gn
    // ─────────────────────────────────────────────────────────────────────────

    private int creerCoordinateursPrefectoraux(Role profil,
                                               Map<Region, List<Prefecture>> prefParRegion) {
        int count = 0;
        int index = 1;
        Set<String> emailsUtilises = new HashSet<>();

        for (Map.Entry<Region, List<Prefecture>> entree : prefParRegion.entrySet()) {
            Region region = entree.getKey();
            for (Prefecture prefecture : entree.getValue()) {
                String email = emailUnique("cp_" + slug(prefecture.getNom()),
                                           "@ravec.gov.gn", emailsUtilises);
                count += creer(User.builder()
                        .id("USR-CP-" + String.format("%03d", index))
                        .code("CP-" + sanitizeCode(prefecture.getCode()))
                        .nom("COORDINATEUR").prenom("Préfectoral " + prefecture.getNom())
                        .email(email).username(email)
                        .telephone("+224623" + String.format("%06d", index))
                        .fonction("Coordinateur Préfectoral — " + prefecture.getNom())
                        .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                        .role(profil)
                        .region(region)
                        .prefecture(prefecture)
                        .statut(Statut.Activated)
                        .build());
                index++;
            }
        }
        log.info("  [PREFECTORAL]   {} coordinateur(s) préfectoral/aux", count);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  NIVEAU COMMUNAL — Superviseurs (1 par commune)
    //  Login : sup_[slug_commune]@ravec.gov.gn
    // ─────────────────────────────────────────────────────────────────────────

    private int creerSuperviseursCommunaux(Role profil,
                                           Map<Region, List<Prefecture>> prefParRegion,
                                           Map<Prefecture, List<Commune>> communeParPref) {
        int count = 0;
        int index = 1;
        Set<String> emailsUtilises = new HashSet<>();

        for (Map.Entry<Region, List<Prefecture>> entree : prefParRegion.entrySet()) {
            Region region = entree.getKey();
            for (Prefecture prefecture : entree.getValue()) {
                for (Commune commune : communeParPref.getOrDefault(prefecture, List.of())) {
                    String email = emailUnique("sup_" + slug(commune.getNom()),
                                               "@ravec.gov.gn", emailsUtilises);
                    count += creer(User.builder()
                            .id("USR-SUP-" + String.format("%04d", index))
                            .code("SUP-" + sanitizeCode(commune.getCode()))
                            .nom("SUPERVISEUR").prenom(commune.getNom())
                            .email(email).username(email)
                            .telephone("+224624" + String.format("%06d", index))
                            .fonction("Superviseur Communal — " + commune.getNom())
                            .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                            .role(profil)
                            .region(region)
                            .prefecture(prefecture)
                            .commune(commune)
                            .statut(Statut.Activated)
                            .build());
                    index++;
                }
            }
        }
        log.info("  [COMMUNAL/SUP]  {} superviseur(s) communal/aux", count);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  NIVEAU COMMUNAL — Officiers Délégués d'État Civil / ODEC (1 par commune)
    //  Login : odec_[slug_commune]@ravec.gov.gn
    // ─────────────────────────────────────────────────────────────────────────

    private int creerOfficiersCivils(Role profil,
                                     Map<Region, List<Prefecture>> prefParRegion,
                                     Map<Prefecture, List<Commune>> communeParPref) {
        int count = 0;
        int index = 1;
        Set<String> emailsUtilises = new HashSet<>();

        for (Map.Entry<Region, List<Prefecture>> entree : prefParRegion.entrySet()) {
            Region region = entree.getKey();
            for (Prefecture prefecture : entree.getValue()) {
                for (Commune commune : communeParPref.getOrDefault(prefecture, List.of())) {
                    String email = emailUnique("odec_" + slug(commune.getNom()),
                                               "@ravec.gov.gn", emailsUtilises);
                    count += creer(User.builder()
                            .id("USR-ODEC-" + String.format("%04d", index))
                            .code("ODEC-" + sanitizeCode(commune.getCode()))
                            .nom("ODEC").prenom(commune.getNom())
                            .email(email).username(email)
                            .telephone("+224625" + String.format("%06d", index))
                            .fonction("Officier Délégué d'État Civil — " + commune.getNom())
                            .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                            .role(profil)
                            .region(region)
                            .prefecture(prefecture)
                            .commune(commune)
                            .statut(Statut.Activated)
                            .build());
                    index++;
                }
            }
        }
        log.info("  [COMMUNAL/ODEC] {} officier(s) d'état civil", count);
        return count;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  UTILITAIRES
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Charge les 7 profils métiers depuis la base (créés par DataInitializer).
     */
    private Map<String, Role> chargerProfils() {
        Map<String, Role> map = new LinkedHashMap<>();
        for (String nom : List.of(PROFIL_SUPER_ADMIN, PROFIL_ADMIN, PROFIL_ANALYSTE,
                                   PROFIL_COORD_REGIONAL, PROFIL_COORD_PREFECTORAL,
                                   PROFIL_SUPERVISEUR, PROFIL_ODEC)) {
            roleRepository.findByNom(nom).ifPresentOrElse(
                    role -> map.put(nom, role),
                    () -> log.warn("  Profil introuvable : {}", nom));
        }
        return map;
    }

    /**
     * Sauvegarde l'utilisateur si son email n'existe pas encore.
     * @return 1 si créé, 0 si déjà présent
     */
    private int creer(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            log.debug("  [skip] {}", user.getEmail());
            return 0;
        }
        userRepository.save(user);
        log.debug("  [+]    {}", user.getEmail());
        return 1;
    }

    /**
     * Génère un email unique en ajoutant un suffixe numérique si le login de base
     * est déjà réservé dans cette session.
     *
     * Cas typique : deux communes portant le même nom dans des préfectures différentes.
     *   sup_kindia@ravec.gov.gn      ← première commune "Kindia"
     *   sup_kindia_2@ravec.gov.gn    ← deuxième commune "Kindia"
     */
    private static String emailUnique(String local, String domain, Set<String> utilises) {
        String candidat = local + domain;
        if (utilises.add(candidat)) return candidat;  // add() renvoie true si ajouté
        int suffixe = 2;
        do {
            candidat = local + "_" + suffixe + domain;
            suffixe++;
        } while (!utilises.add(candidat));
        return candidat;
    }

    /**
     * Convertit un nom de localité en partie locale d'email (slug).
     *
     * "N'Zérékoré"  → "nzerekore"
     * "Labé"         → "labe"
     * "Basse-Guinée" → "basse_guinee"
     * "Mamou"        → "mamou"
     */
    static String slug(String nom) {
        if (nom == null || nom.isBlank()) return "inconnu";
        String nfd = Normalizer.normalize(nom, Normalizer.Form.NFD);
        return nfd
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "") // supprimer accents
                .replaceAll("[^\\p{Alnum}\\s\\-]", "")               // supprimer apostrophes…
                .trim()
                .toLowerCase()
                .replaceAll("[\\s\\-]+", "_");                        // espaces/tirets → _
    }

    /**
     * Nettoie un code territorial pour l'utiliser dans un identifiant ou un code.
     * Garde uniquement les caractères alphanumériques et les tirets, max 20 chars.
     */
    private static String sanitizeCode(String code) {
        if (code == null || code.isBlank()) return "XXX";
        String clean = code.replaceAll("[^\\p{Alnum}\\-]", "").toUpperCase();
        return clean.substring(0, Math.min(clean.length(), 20));
    }
}
