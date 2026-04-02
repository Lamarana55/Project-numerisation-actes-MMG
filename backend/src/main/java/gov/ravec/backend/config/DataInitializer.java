package gov.ravec.backend.config;

import gov.ravec.backend.entities.Permission;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.repositories.PermissionRepository;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.utils.NiveauAdministratif;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * ============================================================
 *  DataInitializer — PN-RAVEC
 *  Initialise les 8 profils métiers et leurs permissions.
 *  Idempotent : ne recrée rien si les données existent déjà.
 * ============================================================
 *
 * HIÉRARCHIE DES PROFILS
 * ─────────────────────────────────────────────────────────────
 *
 * ▶ NIVEAU CENTRAL (PN-RAVEC) — accès national complet
 *   ├── SUPER_ADMINISTRATEUR : accès total à toutes les fonctionnalités
 *   ├── ADMINISTRATEUR       : gestion opérationnelle étendue
 *   └── ANALYSTE             : lecture et analyse des données nationales
 *
 * ▶ NIVEAU RÉGIONAL — restreint à la région d'affectation
 *   └── COORDINATEUR_REGIONAL : gestion et suivi régional
 *
 * ▶ NIVEAU PRÉFECTORAL — restreint à la préfecture d'affectation
 *   └── COORDINATEUR_PREFECTORAL : gestion et suivi préfectoral
 *
 * ▶ NIVEAU COMMUNAL — restreint à la commune d'affectation
 *   ├── SUPERVISEUR : supervision des opérations communales
 *   ├── ODEC        : gestion de l'état civil communal
 *   └── AGENT       : exécution des tâches opérationnelles
 *
 * DOMAINES FONCTIONNELS DES PERMISSIONS
 * ─────────────────────────────────────────────────────────────
 *  [1] Administration système   → réservé niveau CENTRAL
 *  [2] Gestion des utilisateurs → SUPER_ADMIN + ADMIN
 *  [3] Tableau de bord          → tous les profils
 *  [4] Rapports & statistiques  → selon niveau
 *  [5] Données territoriales    → selon niveau
 *  [6] Numérisation / Indexation → opérationnel
 *  [7] État civil (ODEC)        → réservé ODEC
 *  [8] Supervision des agents   → coordinateurs + superviseur
 *  [9] Profil personnel         → tous les profils
 */
@Component
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    // ═══════════════════════════════════════════════════════════
    //  [1] ADMINISTRATION SYSTÈME — réservé CENTRAL
    // ═══════════════════════════════════════════════════════════
    /** Configuration globale du système */
    private static final String P_ADMIN_SYSTEME       = "CAN_MANAGE_SETTINGS";
    /** Gestion des localités (régions, préfectures, communes) */
    private static final String P_GERER_LOCALITES     = "CAN_MANAGE_LOCALITES";
    /** Gestion des profils et niveaux d'accès */
    private static final String P_GERER_PROFILS       = "CAN_MANAGE_ROLES";
    /** Gestion fine des permissions */
    private static final String P_GERER_PERMISSIONS   = "CAN_MANAGE_PERMISSIONS";

    // ═══════════════════════════════════════════════════════════
    //  [2] GESTION DES UTILISATEURS
    // ═══════════════════════════════════════════════════════════
    /** Créer, modifier, désactiver, supprimer des comptes */
    private static final String P_GERER_UTILISATEURS  = "CAN_MANAGE_USERS";

    // ═══════════════════════════════════════════════════════════
    //  [3] TABLEAU DE BORD
    // ═══════════════════════════════════════════════════════════
    /** Accéder au tableau de bord (commun à tous) */
    private static final String P_VOIR_TABLEAU_BORD   = "CAN_VIEW_DASHBOARD";

    // ═══════════════════════════════════════════════════════════
    //  [4] RAPPORTS & STATISTIQUES
    // ═══════════════════════════════════════════════════════════
    /** Consulter les rapports à l'échelle nationale (CENTRAL) */
    private static final String P_RAPPORTS_NATIONAL   = "CAN_VIEW_REPORTS_NATIONAL";
    /** Consulter les rapports à l'échelle régionale */
    private static final String P_RAPPORTS_REGIONAL   = "CAN_VIEW_REPORTS_REGIONAL";
    /** Consulter les rapports à l'échelle préfectorale */
    private static final String P_RAPPORTS_PREFECTORAL= "CAN_VIEW_REPORTS_PREFECTORAL";
    /** Consulter les rapports à l'échelle communale */
    private static final String P_RAPPORTS_COMMUNAL   = "CAN_VIEW_REPORTS_COMMUNAL";
    /** Exporter les rapports en PDF / Excel */
    private static final String P_EXPORTER_RAPPORTS   = "CAN_EXPORT_REPORTS";

    // ═══════════════════════════════════════════════════════════
    //  [5] DONNÉES TERRITORIALES — visibilité nationale (CENTRAL)
    // ═══════════════════════════════════════════════════════════
    /** Voir la liste complète de toutes les régions */
    private static final String P_VOIR_REGIONS        = "CAN_VIEW_ALL_REGIONS";
    /** Voir la liste complète de toutes les préfectures */
    private static final String P_VOIR_PREFECTURES    = "CAN_VIEW_ALL_PREFECTURES";
    /** Voir la liste complète de toutes les communes */
    private static final String P_VOIR_COMMUNES       = "CAN_VIEW_ALL_COMMUNES";

    // ═══════════════════════════════════════════════════════════
    //  [6] NUMÉRISATION & INDEXATION
    // ═══════════════════════════════════════════════════════════
    /** Piloter et configurer les campagnes de numérisation */
    private static final String P_PILOTER_NUMERISATION= "CAN_MANAGE_NUMERISATION";
    /** Valider les lots numérisés */
    private static final String P_VALIDER_NUMERISATION= "CAN_VALIDER_NUMERISATION";
    /** Numériser des actes (scanner / importer des images) */
    private static final String P_NUMERISER           = "CAN_NUMERISER_ACTES";
    /** Indexer / annoter les actes numérisés */
    private static final String P_INDEXER             = "CAN_INDEXER_ACTES";

    // ═══════════════════════════════════════════════════════════
    //  [7] ÉTAT CIVIL — réservé ODEC
    // ═══════════════════════════════════════════════════════════
    /** Accès complet aux actes d'état civil */
    private static final String P_GERER_ACTES         = "CAN_MANAGE_ACTS";
    /** Enregistrer des actes de naissance */
    private static final String P_SAISIR_NAISSANCE    = "CAN_SAISIR_NAISSANCE";
    /** Enregistrer des actes de décès */
    private static final String P_SAISIR_DECES        = "CAN_SAISIR_DECES";
    /** Enregistrer des actes de mariage */
    private static final String P_SAISIR_MARIAGE      = "CAN_SAISIR_MARIAGE";
    /** Corriger ou invalider un acte existant */
    private static final String P_CORRIGER_ACTES      = "CAN_CORRIGER_ACTES";

    // ═══════════════════════════════════════════════════════════
    //  [8] SUPERVISION DES AGENTS
    // ═══════════════════════════════════════════════════════════
    /** Superviser les agents et suivre leur activité */
    private static final String P_SUPERVISER_AGENTS   = "CAN_SUPERVISE_AGENTS";
    /** Affecter des tâches aux agents */
    private static final String P_AFFECTER_TACHES     = "CAN_AFFECTER_TACHES";

    // ═══════════════════════════════════════════════════════════
    //  [9] PROFIL PERSONNEL — commun à tous
    // ═══════════════════════════════════════════════════════════
    /** Consulter son propre profil */
    private static final String P_VOIR_PROFIL         = "CAN_VIEW_PROFILE";
    /** Modifier ses informations personnelles */
    private static final String P_MODIFIER_PROFIL     = "CAN_EDIT_PROFILE";

    // ── Noms techniques des profils ──────────────────────────
    private static final String PROFIL_SUPER_ADMIN       = "SUPER_ADMINISTRATEUR";
    private static final String PROFIL_ADMIN             = "ADMINISTRATEUR";
    private static final String PROFIL_ANALYSTE          = "ANALYSTE";
    private static final String PROFIL_COORD_REGIONAL    = "COORDINATEUR_REGIONAL";
    private static final String PROFIL_COORD_PREFECTORAL = "COORDINATEUR_PREFECTORAL";
    private static final String PROFIL_SUPERVISEUR       = "SUPERVISEUR";
    private static final String PROFIL_ODEC              = "ODEC";
    private static final String PROFIL_AGENT             = "AGENT";

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public DataInitializer(PermissionRepository permissionRepository,
                           RoleRepository roleRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== DataInitializer PN-RAVEC : initialisation des profils métiers ===");
        Map<String, Permission> perms = initPermissions();
        initProfils(perms);
        log.info("=== DataInitializer : terminé ===");
    }

    // ─────────────────────────────────────────────────────────
    //  PERMISSIONS — création idempotente
    // ─────────────────────────────────────────────────────────

    private Map<String, Permission> initPermissions() {
        // LinkedHashMap pour conserver l'ordre d'affichage
        Map<String, String> catalogue = new LinkedHashMap<>();

        // [1] Administration système
        catalogue.put(P_ADMIN_SYSTEME,        "Configurer les paramètres globaux du système");
        catalogue.put(P_GERER_LOCALITES,      "Créer, modifier et supprimer les entités territoriales");
        catalogue.put(P_GERER_PROFILS,        "Créer et modifier les profils d'accès");
        catalogue.put(P_GERER_PERMISSIONS,    "Gérer les permissions associées aux profils");

        // [2] Utilisateurs
        catalogue.put(P_GERER_UTILISATEURS,   "Créer, modifier, désactiver et supprimer des comptes utilisateurs");

        // [3] Tableau de bord
        catalogue.put(P_VOIR_TABLEAU_BORD,    "Accéder au tableau de bord principal");

        // [4] Rapports
        catalogue.put(P_RAPPORTS_NATIONAL,    "Consulter les rapports et statistiques à l'échelle nationale");
        catalogue.put(P_RAPPORTS_REGIONAL,    "Consulter les rapports et statistiques de sa région");
        catalogue.put(P_RAPPORTS_PREFECTORAL, "Consulter les rapports et statistiques de sa préfecture");
        catalogue.put(P_RAPPORTS_COMMUNAL,    "Consulter les rapports et statistiques de sa commune");
        catalogue.put(P_EXPORTER_RAPPORTS,    "Exporter les rapports en PDF ou Excel");

        // [5] Données territoriales
        catalogue.put(P_VOIR_REGIONS,         "Accéder à la liste complète de toutes les régions");
        catalogue.put(P_VOIR_PREFECTURES,     "Accéder à la liste complète de toutes les préfectures");
        catalogue.put(P_VOIR_COMMUNES,        "Accéder à la liste complète de toutes les communes");

        // [6] Numérisation
        catalogue.put(P_PILOTER_NUMERISATION, "Piloter et configurer les campagnes de numérisation");
        catalogue.put(P_VALIDER_NUMERISATION, "Valider les lots d'actes numérisés");
        catalogue.put(P_NUMERISER,            "Numériser des actes (scan / import d'images)");
        catalogue.put(P_INDEXER,              "Indexer et annoter les actes numérisés");

        // [7] État civil
        catalogue.put(P_GERER_ACTES,          "Accès complet à la gestion des actes d'état civil");
        catalogue.put(P_SAISIR_NAISSANCE,     "Enregistrer des actes de naissance");
        catalogue.put(P_SAISIR_DECES,         "Enregistrer des actes de décès");
        catalogue.put(P_SAISIR_MARIAGE,       "Enregistrer des actes de mariage");
        catalogue.put(P_CORRIGER_ACTES,       "Corriger ou invalider un acte d'état civil existant");

        // [8] Supervision
        catalogue.put(P_SUPERVISER_AGENTS,    "Superviser les agents et suivre leur activité");
        catalogue.put(P_AFFECTER_TACHES,      "Affecter des tâches de numérisation aux agents");

        // [9] Profil personnel
        catalogue.put(P_VOIR_PROFIL,          "Consulter son propre profil utilisateur");
        catalogue.put(P_MODIFIER_PROFIL,      "Modifier ses informations personnelles");

        Map<String, Permission> result = new LinkedHashMap<>();
        catalogue.forEach((nom, description) -> {
            Permission perm = permissionRepository.findByNom(nom).orElseGet(() -> {
                log.info("  [perm] Création : {}", nom);
                Permission p = new Permission();
                p.setId("PERM_" + nom);
                p.setNom(nom);
                p.setDescription(description);
                return permissionRepository.save(p);
            });
            result.put(nom, perm);
        });
        return result;
    }

    // ─────────────────────────────────────────────────────────
    //  PROFILS MÉTIERS
    // ─────────────────────────────────────────────────────────

    private void initProfils(Map<String, Permission> p) {

        /* ══════════════════════════════════════════════════
         *  NIVEAU CENTRAL — accès national, aucune restriction
         *  territoriale (pas de région / préfecture / commune)
         * ══════════════════════════════════════════════════ */

        // ── SUPER_ADMINISTRATEUR ──────────────────────────
        // Accès total : toutes les permissions sans exception
        creerProfilSiAbsent(
            PROFIL_SUPER_ADMIN,
            "Super-Administrateur",
            "Accès total à toutes les fonctionnalités du système PN-RAVEC",
            NiveauAdministratif.CENTRAL,
            p.values()  // ← toutes les permissions
        );

        // ── ADMINISTRATEUR ────────────────────────────────
        // Gestion opérationnelle étendue : peut tout faire sauf modifier
        // les permissions système elles-mêmes
        creerProfilSiAbsent(
            PROFIL_ADMIN,
            "Administrateur",
            "Gestion opérationnelle avec des privilèges étendus au niveau national",
            NiveauAdministratif.CENTRAL,
            Set.of(
                // Administration
                p.get(P_ADMIN_SYSTEME),
                p.get(P_GERER_LOCALITES),
                p.get(P_GERER_PROFILS),
                // Utilisateurs
                p.get(P_GERER_UTILISATEURS),
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Rapports nationaux
                p.get(P_RAPPORTS_NATIONAL),
                p.get(P_EXPORTER_RAPPORTS),
                // Visibilité nationale complète
                p.get(P_VOIR_REGIONS),
                p.get(P_VOIR_PREFECTURES),
                p.get(P_VOIR_COMMUNES),
                // Numérisation (pilotage national)
                p.get(P_PILOTER_NUMERISATION),
                p.get(P_VALIDER_NUMERISATION),
                // Supervision
                p.get(P_SUPERVISER_AGENTS),
                p.get(P_AFFECTER_TACHES),
                // Profil
                p.get(P_VOIR_PROFIL),
                p.get(P_MODIFIER_PROFIL)
            )
        );

        // ── ANALYSTE ──────────────────────────────────────
        // Lecture et analyse uniquement — aucune action d'écriture
        creerProfilSiAbsent(
            PROFIL_ANALYSTE,
            "Analyste",
            "Accès en lecture et analyse des données à l'échelle nationale",
            NiveauAdministratif.CENTRAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Rapports nationaux (lecture seule)
                p.get(P_RAPPORTS_NATIONAL),
                p.get(P_EXPORTER_RAPPORTS),
                // Visibilité nationale (lecture seule)
                p.get(P_VOIR_REGIONS),
                p.get(P_VOIR_PREFECTURES),
                p.get(P_VOIR_COMMUNES),
                // Profil
                p.get(P_VOIR_PROFIL)
            )
        );

        /* ══════════════════════════════════════════════════
         *  NIVEAU RÉGIONAL — accès limité à la région affectée
         * ══════════════════════════════════════════════════ */

        // ── COORDINATEUR_REGIONAL ─────────────────────────
        // Responsable du suivi et de la coordination dans sa région.
        // Peut superviser les coordinateurs préfectoraux, superviseurs
        // et agents de sa région. Valide les opérations de numérisation.
        creerProfilSiAbsent(
            PROFIL_COORD_REGIONAL,
            "Coordinateur Régional",
            "Responsable de la gestion et du suivi des activités au niveau d'une région",
            NiveauAdministratif.REGIONAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Rapports de sa région
                p.get(P_RAPPORTS_REGIONAL),
                p.get(P_EXPORTER_RAPPORTS),
                // Numérisation régionale
                p.get(P_PILOTER_NUMERISATION),
                p.get(P_VALIDER_NUMERISATION),
                // Supervision régionale
                p.get(P_SUPERVISER_AGENTS),
                p.get(P_AFFECTER_TACHES),
                // Profil
                p.get(P_VOIR_PROFIL),
                p.get(P_MODIFIER_PROFIL)
            )
        );

        /* ══════════════════════════════════════════════════
         *  NIVEAU PRÉFECTORAL — accès limité à la préfecture affectée
         * ══════════════════════════════════════════════════ */

        // ── COORDINATEUR_PREFECTORAL ──────────────────────
        // Responsable du suivi et de la coordination dans sa préfecture.
        // Supervise les superviseurs et agents de sa préfecture.
        // Valide les opérations de numérisation dans son périmètre.
        creerProfilSiAbsent(
            PROFIL_COORD_PREFECTORAL,
            "Coordinateur Préfectoral",
            "Responsable de la gestion et du suivi des activités au niveau d'une préfecture",
            NiveauAdministratif.PREFECTORAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Rapports de sa préfecture
                p.get(P_RAPPORTS_PREFECTORAL),
                p.get(P_EXPORTER_RAPPORTS),
                // Numérisation préfectorale
                p.get(P_PILOTER_NUMERISATION),
                p.get(P_VALIDER_NUMERISATION),
                // Supervision préfectorale
                p.get(P_SUPERVISER_AGENTS),
                p.get(P_AFFECTER_TACHES),
                // Profil
                p.get(P_VOIR_PROFIL),
                p.get(P_MODIFIER_PROFIL)
            )
        );

        /* ══════════════════════════════════════════════════
         *  NIVEAU COMMUNAL — accès limité à la commune affectée
         * ══════════════════════════════════════════════════ */

        // ── SUPERVISEUR ───────────────────────────────────
        // Supervise les opérations de numérisation et les agents dans
        // sa commune. Valide les lots numérisés, coordonne les tâches.
        // N'a pas accès aux actes d'état civil (rôle de l'ODEC).
        creerProfilSiAbsent(
            PROFIL_SUPERVISEUR,
            "Superviseur",
            "Supervision des opérations de numérisation au niveau communal",
            NiveauAdministratif.COMMUNAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Rapports communaux
                p.get(P_RAPPORTS_COMMUNAL),
                p.get(P_EXPORTER_RAPPORTS),
                // Numérisation communale (pilotage + validation)
                p.get(P_VALIDER_NUMERISATION),
                p.get(P_NUMERISER),
                p.get(P_INDEXER),
                // Supervision des agents de sa commune
                p.get(P_SUPERVISER_AGENTS),
                p.get(P_AFFECTER_TACHES),
                // Profil
                p.get(P_VOIR_PROFIL),
                p.get(P_MODIFIER_PROFIL)
            )
        );

        // ── ODEC ──────────────────────────────────────────
        // Officier Délégué d'État Civil : responsable de la gestion
        // des actes d'état civil dans sa commune (naissances, décès,
        // mariages). Peut aussi numériser et indexer des actes anciens.
        creerProfilSiAbsent(
            PROFIL_ODEC,
            "Officier Délégué d'État Civil (ODEC)",
            "Gestion des activités d'état civil dans la commune",
            NiveauAdministratif.COMMUNAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // État civil — domaine principal de l'ODEC
                p.get(P_GERER_ACTES),
                p.get(P_SAISIR_NAISSANCE),
                p.get(P_SAISIR_DECES),
                p.get(P_SAISIR_MARIAGE),
                p.get(P_CORRIGER_ACTES),
                // Numérisation des actes anciens
                p.get(P_NUMERISER),
                p.get(P_INDEXER),
                // Rapports communaux (lecture)
                p.get(P_RAPPORTS_COMMUNAL),
                // Profil
                p.get(P_VOIR_PROFIL),
                p.get(P_MODIFIER_PROFIL)
            )
        );

        // ── AGENT ─────────────────────────────────────────
        // Exécute les tâches opérationnelles de numérisation et
        // d'indexation dans sa commune. Niveau le plus bas de la
        // hiérarchie — pas de validation ni de supervision.
        creerProfilSiAbsent(
            PROFIL_AGENT,
            "Agent",
            "Exécution des tâches opérationnelles de numérisation, affecté à une commune",
            NiveauAdministratif.COMMUNAL,
            Set.of(
                // Tableau de bord
                p.get(P_VOIR_TABLEAU_BORD),
                // Numérisation et indexation (tâches de base)
                p.get(P_NUMERISER),
                p.get(P_INDEXER),
                // Profil
                p.get(P_VOIR_PROFIL)
            )
        );
    }

    // ─────────────────────────────────────────────────────────
    //  Utilitaire — création idempotente d'un profil
    // ─────────────────────────────────────────────────────────

    private void creerProfilSiAbsent(String nom, String libelle, String description,
                                      NiveauAdministratif niveau,
                                      Iterable<Permission> permissions) {
        if (roleRepository.findByNom(nom).isPresent()) {
            log.debug("  [profil] Déjà existant : {}", nom);
            return;
        }

        log.info("  [profil] Création : {} [{}]", nom, niveau);
        Set<Permission> permSet = new HashSet<>();
        permissions.forEach(permSet::add);

        Role role = new Role();
        role.setId(nom);                        // ID stable = nom technique
        role.setNom(nom);
        role.setLibelle(libelle);
        role.setDescription(description);
        role.setNiveauAdministratif(niveau);
        role.setPermissions(permSet);
        roleRepository.save(role);
    }
}
