package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ResetPasswordResponse;
import gov.ravec.backend.dto.UserCreateRequest;
import gov.ravec.backend.dto.UserDTO;
import gov.ravec.backend.dto.UserUpdateRequest;
import gov.ravec.backend.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@Tag(name = "Utilisateurs", description = "Gestion complète des utilisateurs du système")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Liste des utilisateurs", description = "Récupère tous les utilisateurs actifs du système")
    @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès")
    public List<UserDTO> index() {
        return userService.index();
    }

    @GetMapping("{id}")
    @Operation(summary = "Détails d'un utilisateur", description = "Récupère les informations détaillées d'un utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<UserDTO> show(@PathVariable String id) {
        return userService.show(id);
    }

    @PostMapping
    @Operation(summary = "Créer un utilisateur", description = "Crée un nouvel utilisateur avec le mot de passe par défaut")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès"),
            @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public ResponseEntity<UserDTO> save(@RequestBody UserCreateRequest req) {
        UserDTO saved = userService.save(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("{id}")
    @Operation(summary = "Modifier un utilisateur", description = "Met à jour les informations d'un utilisateur existant")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur modifié avec succès"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<UserDTO> update(@PathVariable String id, @RequestBody UserUpdateRequest req) {
        UserDTO updated = userService.update(id, req);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("{id}/toggle-status")
    @Operation(summary = "Activer / Désactiver un utilisateur", description = "Bascule le statut Activated ↔ Desactivated")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statut modifié avec succès"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<UserDTO> toggleStatus(@PathVariable String id) {
        UserDTO updated = userService.toggleStatus(id);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PostMapping("{id}/reset-password")
    @Operation(summary = "Réinitialiser le mot de passe", description = "Réinitialise le mot de passe au mot de passe par défaut")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé avec succès"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<ResetPasswordResponse> resetPassword(@PathVariable String id) {
        ResetPasswordResponse response = userService.resetPassword(id);
        return response != null ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Supprimer un utilisateur", description = "Suppression logique (soft delete) de l'utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur supprimé avec succès"),
            @ApiResponse(responseCode = "404", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<String> delete(@PathVariable String id) {
        String result = userService.delete(id);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }
}
