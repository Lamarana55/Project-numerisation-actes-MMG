package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.RoleRequestDTO;
import gov.ravec.backend.entities.Role;
import gov.ravec.backend.services.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Tag(name = "Rôles", description = "Gestion des rôles et des droits d'accès")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    @Operation(summary = "Liste des rôles")
    public List<Role> index() {
        return roleService.index();
    }

    @GetMapping("{id}")
    @Operation(summary = "Détails d'un rôle")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rôle trouvé"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public ResponseEntity<Role> show(@PathVariable String id) {
        return roleService.show(id);
    }

    @PostMapping
    @Operation(summary = "Créer un rôle")
    @ApiResponse(responseCode = "201", description = "Rôle créé avec succès")
    public ResponseEntity<Role> save(@RequestBody RoleRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleService.save(req));
    }

    @PutMapping("{id}")
    @Operation(summary = "Modifier un rôle")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rôle modifié avec succès"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public ResponseEntity<Role> update(@PathVariable String id, @RequestBody RoleRequestDTO req) {
        Role updated = roleService.update(id, req);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("{id}")
    @Operation(summary = "Supprimer un rôle")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Rôle supprimé avec succès"),
        @ApiResponse(responseCode = "404", description = "Rôle non trouvé")
    })
    public ResponseEntity<String> delete(@PathVariable String id) {
        return roleService.delete(id);
    }

    @GetMapping("findByCode")
    @Operation(summary = "Rechercher un rôle par nom")
    public Role findByCode(@RequestParam String nom) {
        return roleService.findByNom(nom);
    }
}
