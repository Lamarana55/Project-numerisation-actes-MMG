package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.services.ActeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint unifié : GET /actes
 * Retourne l'ensemble des actes (naissances + décès) dans une liste paginée.
 */
@Tag(name = "Actes", description = "Liste unifiée de tous les actes d'état civil")
@RestController
@RequestMapping("/actes")
public class ActeController {

    private final ActeService acteService;

    public ActeController(ActeService acteService) {
        this.acteService = acteService;
    }

    @Operation(summary = "Lister tous les actes",
               description = "Retourne l'ensemble des actes (naissances + décès) paginés et filtrés.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<ActePageResponseDTO> searchAll(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String npi,
            @RequestParam(required = false) String numero,
            @RequestParam(required = false) String typeCreation,
            @RequestParam(required = false) String typeActe,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {

        ActePageResponseDTO result = acteService.searchAll(
                nom, prenom, npi, numero, typeCreation, typeActe,
                dateDebut, dateFin, page, size);
        return ResponseEntity.ok(result);
    }
}
