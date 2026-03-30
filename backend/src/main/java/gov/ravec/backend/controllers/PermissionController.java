package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.Permission;
import gov.ravec.backend.services.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@Tag(name = "Permissions", description = "Gestion des permissions et autorisations système")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    @Operation(summary = "Liste des permissions")
    public List<Permission> index() {
        return permissionService.index();
    }

    @GetMapping("{id}")
    @Operation(summary = "Détails d'une permission")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permission trouvée"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public ResponseEntity<Permission> show(@PathVariable String id) {
        Permission p = permissionService.show(id);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @Operation(summary = "Créer une permission")
    @ApiResponse(responseCode = "201", description = "Permission créée avec succès")
    public ResponseEntity<Permission> save(@RequestBody Permission permission) {
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionService.save(permission));
    }

    @PutMapping("{id}")
    @Operation(summary = "Modifier une permission")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permission modifiée avec succès"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public ResponseEntity<Permission> update(@PathVariable String id, @RequestBody Permission permission) {
        Permission updated = permissionService.update(id, permission);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Supprimer une permission")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permission supprimée avec succès"),
        @ApiResponse(responseCode = "404", description = "Permission non trouvée")
    })
    public ResponseEntity<String> delete(@PathVariable String id) {
        String result = permissionService.delete(id);
        return result != null ? ResponseEntity.ok(result) : ResponseEntity.notFound().build();
    }

    @GetMapping("findByNom")
    @Operation(summary = "Rechercher une permission par nom")
    public ResponseEntity<Permission> findByNom(@RequestParam String nom) {
        Permission p = permissionService.findByNom(nom);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }
}
