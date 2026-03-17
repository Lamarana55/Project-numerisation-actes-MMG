package gov.ravec.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/actuator/")
@Tag(name = "🔧 Monitoring & Actuator", description = "Guide d'utilisation des endpoints de monitoring Actuator")
public class ActuatorDocController {

    @Value("${server.port:8083}")
    private String serverPort;

    @Value("${server.servlet.context-path:/api/v1}")
    private String contextPath;

    /**
     * Page d'accueil de la documentation Actuator
     */
    @GetMapping
    @Operation(summary = "Guide Actuator", description = "Documentation complète des endpoints Actuator disponibles")
    public ResponseEntity<ActuatorGuide> getActuatorGuide() {
        String baseUrl = "http://localhost:" + serverPort + contextPath + "/actuator";
        
        ActuatorGuide guide = new ActuatorGuide();
        guide.setDescription("Spring Boot Actuator fournit des endpoints pour surveiller et gérer votre application");
        guide.setBaseUrl(baseUrl);
        
        // Liste des endpoints
        List<ActuatorEndpoint> endpoints = new ArrayList<>();
        
        // Health
        endpoints.add(new ActuatorEndpoint(
            "health",
            baseUrl + "/health",
            "GET",
            "Vérifie l'état de santé de l'application (base de données, espace disque, etc.)",
            "Surveillance en temps réel de l'état de l'application"
        ));
        
        // Info
        endpoints.add(new ActuatorEndpoint(
            "info",
            baseUrl + "/info",
            "GET",
            "Affiche les informations sur l'application (nom, version, description)",
            "Connaître les détails de l'application déployée"
        ));
        
        // Loggers
        endpoints.add(new ActuatorEndpoint(
            "loggers",
            baseUrl + "/loggers",
            "GET",
            "Liste tous les loggers et leurs niveaux de log actuels",
            "Voir tous les niveaux de log configurés"
        ));
        
        // Logger spécifique
        endpoints.add(new ActuatorEndpoint(
            "loggers/{name}",
            baseUrl + "/loggers/gov.ravec.backend",
            "GET",
            "Voir le niveau de log d'un package spécifique",
            "Vérifier le niveau de log d'un package précis"
        ));
        
        // Changer niveau de log
        endpoints.add(new ActuatorEndpoint(
            "loggers/{name}",
            baseUrl + "/loggers/gov.ravec.backend",
            "POST",
            "Modifier le niveau de log en temps réel (TRACE, DEBUG, INFO, WARN, ERROR)",
            "Activer le mode DEBUG pour debugger sans redémarrer"
        ));
        
        // Metrics
        endpoints.add(new ActuatorEndpoint(
            "metrics",
            baseUrl + "/metrics",
            "GET",
            "Liste toutes les métriques disponibles (mémoire, CPU, requêtes HTTP, etc.)",
            "Analyser les performances de l'application"
        ));
        
        // Metric spécifique
        endpoints.add(new ActuatorEndpoint(
            "metrics/{name}",
            baseUrl + "/metrics/http.server.requests",
            "GET",
            "Détails d'une métrique spécifique",
            "Voir les statistiques détaillées d'une métrique"
        ));
        
        // Env
        endpoints.add(new ActuatorEndpoint(
            "env",
            baseUrl + "/env",
            "GET",
            "Affiche toutes les variables d'environnement et propriétés de configuration",
            "Vérifier les configurations actives"
        ));
        
        // Beans
        endpoints.add(new ActuatorEndpoint(
            "beans",
            baseUrl + "/beans",
            "GET",
            "Liste tous les beans Spring chargés dans le contexte",
            "Voir tous les composants Spring actifs"
        ));
        
        // Mappings
        endpoints.add(new ActuatorEndpoint(
            "mappings",
            baseUrl + "/mappings",
            "GET",
            "Liste tous les mappings HTTP (tous vos endpoints REST)",
            "Voir tous les endpoints de votre API"
        ));
        
        // Thread Dump
        endpoints.add(new ActuatorEndpoint(
            "threaddump",
            baseUrl + "/threaddump",
            "GET",
            "Dump de tous les threads actifs de l'application",
            "Diagnostiquer les problèmes de performance"
        ));
        
        guide.setEndpoints(endpoints);
        
        // Exemples pratiques
        guide.setExamples(getExamples(baseUrl));
        
        return ResponseEntity.ok(guide);
    }

    /**
     * Exemples d'utilisation pratiques
     */
    @GetMapping("/examples")
    @Operation(summary = "Exemples pratiques", description = "Exemples concrets d'utilisation d'Actuator")
    public ResponseEntity<Map<String, Object>> getExamples() {
        String baseUrl = "http://localhost:" + serverPort + contextPath + "/actuator";
        return ResponseEntity.ok(getExamples(baseUrl));
    }

    private Map<String, Object> getExamples(String baseUrl) {
        Map<String, Object> examples = new HashMap<>();
        
        // Exemple 1: Vérifier la santé
        Map<String, String> example1 = new HashMap<>();
        example1.put("titre", "Vérifier si l'application fonctionne");
        example1.put("url", baseUrl + "/health");
        example1.put("methode", "GET");
        example1.put("description", "Retourne 'UP' si tout va bien, 'DOWN' si un problème est détecté");
        examples.put("example1", example1);
        
        // Exemple 2: Activer le mode DEBUG
        Map<String, Object> example2 = new HashMap<>();
        example2.put("titre", "Activer le mode DEBUG pour votre application");
        example2.put("url", baseUrl + "/loggers/gov.ravec.backend");
        example2.put("methode", "POST");
        example2.put("description", "Change le niveau de log en DEBUG pour voir tous les détails");
        example2.put("body", Map.of("configuredLevel", "DEBUG"));
        examples.put("example2", example2);
        
        // Exemple 3: Voir les performances
        Map<String, String> example3 = new HashMap<>();
        example3.put("titre", "Voir les statistiques des requêtes HTTP");
        example3.put("url", baseUrl + "/metrics/http.server.requests");
        example3.put("methode", "GET");
        example3.put("description", "Montre le nombre de requêtes, temps de réponse moyen, etc.");
        examples.put("example3", example3);
        
        // Exemple 4: Lister tous vos endpoints
        Map<String, String> example4 = new HashMap<>();
        example4.put("titre", "Voir tous les endpoints de votre API");
        example4.put("url", baseUrl + "/mappings");
        example4.put("methode", "GET");
        example4.put("description", "Liste complète de tous vos controllers et leurs méthodes");
        examples.put("example4", example4);
        
        return examples;
    }

    /**
     * Guide rapide pour débuter
     */
    @GetMapping("/quickstart")
    @Operation(summary = "Guide rapide", description = "Les 3 endpoints essentiels à connaître")
    public ResponseEntity<Map<String, Object>> getQuickStart() {
        String baseUrl = "http://localhost:" + serverPort + contextPath + "/actuator";
        
        Map<String, Object> quickStart = new HashMap<>();
        quickStart.put("message", "Les 3 endpoints les plus utiles pour commencer");
        
        List<Map<String, String>> essentials = new ArrayList<>();
        
        Map<String, String> health = new HashMap<>();
        health.put("nom", "Health Check");
        health.put("url", baseUrl + "/health");
        health.put("utilite", "Savoir si votre application fonctionne correctement");
        essentials.add(health);
        
        Map<String, String> loggers = new HashMap<>();
        loggers.put("nom", "Gestion des Logs");
        loggers.put("url", baseUrl + "/loggers");
        loggers.put("utilite", "Activer/désactiver les logs détaillés sans redémarrer");
        essentials.add(loggers);
        
        Map<String, String> mappings = new HashMap<>();
        mappings.put("nom", "Liste des Endpoints");
        mappings.put("url", baseUrl + "/mappings");
        mappings.put("utilite", "Voir tous les endpoints disponibles dans votre API");
        essentials.add(mappings);
        
        quickStart.put("essentials", essentials);
        
        return ResponseEntity.ok(quickStart);
    }

    // ========== DTOs ==========
    
    @Data
    public static class ActuatorGuide {
        private String description;
        private String baseUrl;
        private List<ActuatorEndpoint> endpoints;
        private Map<String, Object> examples;
    }
    
    @Data
    @AllArgsConstructor
    public static class ActuatorEndpoint {
        private String nom;
        private String url;
        private String methode;
        private String description;
        private String utilisation;
    }
}