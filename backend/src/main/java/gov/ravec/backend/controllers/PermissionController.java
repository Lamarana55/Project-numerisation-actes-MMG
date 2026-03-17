package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.Permission;
import gov.ravec.backend.services.PermissionService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/permissions")
@Tag(name = "Permissions", description = "Gestion des permissions et autorisations système")
public class PermissionController {
    @Autowired
    private PermissionService permissionService;

    @GetMapping
    @Operation(summary = "Liste des permissions", description = "Récupère toutes les permissions du système")
    @ApiResponse(responseCode = "200", description = "Liste récupérée avec succès")
    public List<Permission> index(){
        return permissionService.index();
    }

    @GetMapping("{id}")
    @Operation(summary = "Détails d'une permission", description = "Récupère les informations détaillées d'une permission spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Permission trouvée"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public Permission show(
            @Parameter(description = "ID de la permission", required = true) 
            @PathVariable String id){
        return permissionService.show(id);
    }

    @PostMapping
    @Operation(summary = "Créer une permission", description = "Crée une nouvelle permission dans le système")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Permission créée avec succès"),
        @ApiResponse(responseCode = "400", description = "Données invalides")
    })
    public Permission save(@RequestBody Permission permission){
        return permissionService.save(permission);
    }

    @PutMapping("{id}")
    @Operation(summary = "Modifier une permission", description = "Met à jour les informations d'une permission existante")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Permission modifiée avec succès"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public Permission update(
            @Parameter(description = "ID de la permission", required = true) 
            @PathVariable String id, 
            @RequestBody Permission permission){
        return permissionService.update(id, permission);
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Supprimer une permission", description = "Supprime une permission du système")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Permission supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public String delete(
            @Parameter(description = "ID de la permission", required = true) 
            @PathVariable String id){
        return permissionService.delete(id);
    }

    @GetMapping("findByNom")
    @Operation(summary = "Rechercher une permission par nom", description = "Recherche et récupère une permission en fonction de son nom")
    @ApiResponse(responseCode = "200", description = "Permission trouvée")
    public Permission findByNom(
            @Parameter(description = "Nom de la permission", required = true, example = "CREATE_USER") 
            @RequestParam String nom){
        return permissionService.findByNom(nom);
    }
}