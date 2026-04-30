package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.dto.IndexationRequest;
import gov.ravec.backend.services.IndexationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint de réception des actes indexés depuis le module de numérisation.
 * POST /actes/indexation — crée un ValidBirth avec statut EN_ATTENTE.
 */
@Tag(name = "Indexation", description = "Réception des actes numérisés et indexés")
@RestController
@RequestMapping("/actes")
public class IndexationController {

    private final IndexationService indexationService;

    public IndexationController(IndexationService indexationService) {
        this.indexationService = indexationService;
    }

    @Operation(summary = "Sauvegarder un acte indexé",
            description = "Crée un acte de naissance avec le statut EN_ATTENTE à partir des données d'indexation.")
    @PostMapping("/indexation")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> sauvegarder(@RequestBody IndexationRequest request) {
        ActeSummaryDTO saved = indexationService.sauvegarder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
