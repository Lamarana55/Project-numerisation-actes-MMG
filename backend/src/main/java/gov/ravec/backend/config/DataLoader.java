package gov.ravec.backend.config;

import gov.ravec.backend.entities.*;
import gov.ravec.backend.repositories.*;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.Statut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;

@Component
public class DataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si les données existent déjà
        if (permissionRepository.count() > 0 && roleRepository.count() > 0 && userRepository.count() > 0) {
            logger.info("Les données de base existent déjà. Arrêt du chargement.");
            return;
        }

        logger.info("Début du chargement des données de base...");

        loadPermissions();
        loadRoles();
        loadUsers();

        logger.info("Chargement des données terminé avec succès !");
    }

    private void loadPermissions() {
        if (permissionRepository.count() > 0) {
            logger.info("Les permissions existent déjà. Arrêt du chargement des permissions.");
            return;
        }

        logger.info("Chargement des permissions...");

        List<Permission> permissions = Arrays.asList(
                createPermission("PERM_001", "CAN_VIEW_DASHBOARD", "Voir le tableau de bord"),
                createPermission("PERM_002", "CAN_MANAGE_USERS", "Gérer les utilisateurs (création, modification, suppression)"),
                createPermission("PERM_003", "CAN_MANAGE_ROLES", "Gérer les rôles et permissions"),
                createPermission("PERM_004", "CAN_MANAGE_PERMISSIONS", "Gérer les permissions système"),
                createPermission("PERM_005", "CAN_VIEW_COLLECTES_AVEC_ACTES", "Voir les collectes avec actes"),
                createPermission("PERM_006", "CAN_MANAGE_COLLECTES", "Gérer les collectes avec actes (modifier, valider)"),
                createPermission("PERM_007", "CAN_VIEW_COLLECTES_SANS_ACTES", "Voir les collectes sans actes"),
                createPermission("PERM_008", "CAN_MANAGE_COLLECTES_SANS_ACTES", "Gérer les collectes sans actes (modifier, valider)"),
                createPermission("PERM_009", "CAN_VALIDATE_BIRTH_DATA", "Valider les données de naissance"),
                createPermission("PERM_010", "CAN_REJECT_BIRTH_DATA", "Rejeter les données de naissance"),
                createPermission("PERM_011", "CAN_VIEW_VALIDATED_ACTS", "Voir les actes validés"),
                createPermission("PERM_012", "CAN_GENERATE_BIRTH_CERTIFICATES", "Générer des actes de naissance"),
                createPermission("PERM_013", "CAN_DELIVER_BIRTH_CERTIFICATES", "Délivrer des actes de naissance"),
                createPermission("PERM_014", "CAN_CANCEL_BIRTH_CERTIFICATES", "Annuler des actes de naissance"),
                createPermission("PERM_015", "CAN_MANAGE_BIRTH_TEMPLATES", "Gérer les modèles d'actes"),
                createPermission("PERM_016", "CAN_MANAGE_LOCALITES", "Gérer les localités (régions, préfectures, communes)"),
                createPermission("PERM_017", "CAN_VIEW_REPORTS", "Voir les rapports et statistiques"),
                createPermission("PERM_018", "CAN_EXPORT_DATA", "Exporter des données"),
                createPermission("PERM_019", "CAN_MANAGE_SYSTEM_SETTINGS", "Gérer les paramètres système"),
                createPermission("PERM_020", "CAN_VIEW_AUDIT_LOGS", "Voir les logs d'audit"),
                createPermission("PERM_021", "CAN_VIEW_PROFILE", "Voir son profil utilisateur"),
                createPermission("PERM_022", "CAN_EDIT_PROFILE", "Modifier son profil utilisateur"),
                createPermission("PERM_023", "CAN_CHANGE_PASSWORD", "Changer son mot de passe")
        );

        permissionRepository.saveAll(permissions);
        logger.info("Permissions chargées : {}", permissions.size());
    }

    private void loadRoles() {
        if (roleRepository.count() > 0) {
            logger.info("Les rôles existent déjà. Arrêt du chargement des rôles.");
            return;
        }

        logger.info("Chargement des rôles...");

        // Récupérer toutes les permissions
        List<Permission> allPermissions = permissionRepository.findAll();
        Map<String, Permission> permissionMap = new HashMap<>();
        allPermissions.forEach(p -> permissionMap.put(p.getNom(), p));

        // ADMINISTRATEUR - Toutes les permissions
        Role adminRole = createRole("ROLE_001", "ADMINISTRATEUR", "Administrateur système avec tous les privilèges");
        adminRole.setPermissions(new HashSet<>(allPermissions));

        // SUPERVISEUR - Permissions de supervision
        Role superviseurRole = createRole("ROLE_002", "SUPERVISEUR", "Superviseur avec accès aux rapports et gestion");
        superviseurRole.setPermissions(getPermissions(permissionMap, Arrays.asList(
                "CAN_VIEW_DASHBOARD", "CAN_VIEW_COLLECTES_AVEC_ACTES", "CAN_VIEW_COLLECTES_SANS_ACTES",
                "CAN_VIEW_VALIDATED_ACTS", "CAN_VIEW_REPORTS", "CAN_EXPORT_DATA", "CAN_REJECT_BIRTH_DATA",
                "CAN_VIEW_PROFILE", "CAN_EDIT_PROFILE", "CAN_CHANGE_PASSWORD", "CAN_MANAGE_COLLECTES"
        )));

        // AGENT - Permissions basiques
        Role agentRole = createRole("ROLE_003", "AGENT", "Agent avec permissions basiques");
        agentRole.setPermissions(getPermissions(permissionMap, Arrays.asList(
                "CAN_VIEW_DASHBOARD", "CAN_VIEW_COLLECTES_AVEC_ACTES",
                "CAN_VIEW_COLLECTES_SANS_ACTES", "CAN_REJECT_BIRTH_DATA",
                "CAN_VIEW_PROFILE", "CAN_EDIT_PROFILE", "CAN_CHANGE_PASSWORD"
        )));

        roleRepository.saveAll(Arrays.asList(adminRole, superviseurRole, agentRole));
        logger.info("Rôles chargés : 3");
    }

    private void loadUsers() {
        if (userRepository.count() > 0) {
            logger.info("Les utilisateurs existent déjà. Arrêt du chargement des utilisateurs.");
            return;
        }

        logger.info("Chargement des utilisateurs...");

        // Récupérer les rôles
        Optional<Role> adminRole = roleRepository.findByNom("ADMINISTRATEUR");
        Optional<Role> superviseurRole = roleRepository.findByNom("SUPERVISEUR");
        Optional<Role> agentRole = roleRepository.findByNom("AGENT");

        // === 1. CRÉER L'ADMINISTRATEUR (parent = null) ===
        User adminUser = null;
        if (adminRole.isPresent()) {
            adminUser = createUser("USR-001", "admin@ravec.gov.gn", "Admin@123",
                    "DIALLO", "Amadou", "+224621234567", "ADM001",
                    "Administrateur Système", adminRole.get(), null); // parent = null
            adminUser = userRepository.save(adminUser);
            logger.info("Administrateur créé : {}", adminUser.getEmail());
        }

        // === 2. CRÉER UN SUPERVISEUR (parent = admin) ===
        User superviseur = null;
        if (superviseurRole.isPresent() && adminUser != null) {
            superviseur = createUser("USR-002", "superviseur@ravec.gov.gn", "Sup@123",
                    "BARRY", "Mamadou", "+224620000001", "SUP001",
                    "Superviseur", superviseurRole.get(),
                    adminUser); // parent = admin
            
            superviseur = userRepository.save(superviseur);
            logger.info("Superviseur créé : {}", superviseur.getEmail());
        }

        // === 3. CRÉER 2 AGENTS (parent = superviseur) ===
        if (agentRole.isPresent() && superviseur != null) {
            // Agent 1
            User agent1 = createUser("USR-003", "agent1@ravec.gov.gn", "Agent@123",
                    "CAMARA", "Fatoumata", "+224630000001", "AGT001",
                    "Agent", agentRole.get(),
                    superviseur); // parent = superviseur
            userRepository.save(agent1);
            logger.info("Agent 1 créé : {}", agent1.getEmail());
            
            // Agent 2
            User agent2 = createUser("USR-004", "agent2@ravec.gov.gn", "Agent@123",
                    "SOW", "Ibrahim", "+224630000002", "AGT002",
                    "Agent", agentRole.get(),
                    superviseur); // parent = superviseur
            userRepository.save(agent2);
            logger.info("Agent 2 créé : {}", agent2.getEmail());
        }

        logger.info("==============================================");
        logger.info("Chargement terminé :");
        logger.info("- 1 Administrateur");
        logger.info("- 1 Superviseur");
        logger.info("- 2 Agents");
        logger.info("Total : 4 utilisateurs créés");
        logger.info("==============================================");
    }

    // === MÉTHODES UTILITAIRES ===

    private Permission createPermission(String id, String nom, String description) {
        return Permission.builder()
                .id(id)
                .nom(nom)
                .description(description)
                .build();
    }

    private Role createRole(String id, String nom, String description) {
        return Role.builder()
                .id(id)
                .nom(nom)
                .description(description)
                .permissions(new HashSet<>())
                .build();
    }

    private User createUser(String id, String email, String password, String nom, String prenom,
                            String telephone, String code, String fonction, Role role,
                            User parent) { // Ajout du paramètre parent
        return User.builder()
                .id(id)
                .username(email) // username = email
                .email(email)
                .password(passwordEncoder.encode(password))
                .nom(nom)
                .prenom(prenom)
                .telephone(telephone)
                .code(code)
                .fonction(fonction)
                .role(role)
                .statut(Statut.Activated)
                .build();
    }

    private Set<Permission> getPermissions(Map<String, Permission> permissionMap, List<String> permissionNames) {
        Set<Permission> permissions = new HashSet<>();
        permissionNames.forEach(name -> {
            Permission permission = permissionMap.get(name);
            if (permission != null) {
                permissions.add(permission);
            } else {
                logger.warn("Permission non trouvée : {}", name);
            }
        });
        return permissions;
    }
}