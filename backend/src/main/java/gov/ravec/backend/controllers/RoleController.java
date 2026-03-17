package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.Role;
import gov.ravec.backend.services.RoleService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Hidden
@RestController
@RequestMapping("/roles")
@Tag(name = "Rôles", description = "Gestion des rôles et des droits d'accès")
public class RoleController {
    @Autowired
    private RoleService roleService;

    @GetMapping
    @Operation(summary = "Liste des rôles", description = "Récupère tous les rôles du système")
    @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès")
    public List<Role> index(){
        return roleService.index();
    }

    @GetMapping("{id}")
    @Operation(summary = "Détails d'un rôle", description = "Récupère les informations détaillées d'un rôle spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rôle trouvé"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public Role show(
            @Parameter(description = "ID du rôle", required = true) 
            @PathVariable String id){
        return roleService.show(id);
    }

    @PostMapping
    @Operation(summary = "Créer un rôle", description = "Crée un nouveau rôle dans le système")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Rôle créé avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public Role save(@RequestBody Role role){
        role.setId(UUID.randomUUID().toString());
        return roleService.save(role);
    }

    @PutMapping("{id}")
    @Operation(summary = "Modifier un rôle", description = "Met à jour les informations d'un rôle existant")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rôle modifié avec succès"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public Role update(
            @Parameter(description = "ID du rôle", required = true) 
            @PathVariable String id, 
            @RequestBody Role role){
        return roleService.update(id, role);
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Supprimer un rôle", description = "Supprime un rôle du système")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rôle supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public String delete(
            @Parameter(description = "ID du rôle", required = true) 
            @PathVariable String id){
        return roleService.delete(id);
    }

    @GetMapping("findByCode")
    @Operation(summary = "Rechercher un rôle par nom", description = "Recherche et récupère un rôle en fonction de son nom")
    @ApiResponse(responseCode = "200", description = "Rôle trouvé")
    public Role findByCode(
            @Parameter(description = "Nom du rôle", required = true, example = "ADMIN") 
            @RequestParam String nom){
        return roleService.findByNom(nom);
    }
}