package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ActeDecesRequest;
import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.services.ActeDecesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * API REST pour les actes de décès.
 *
 * Endpoints :
 *   GET  /actes/deces               → liste paginée et filtrée
 *   POST /actes/deces               → déclaration de décès
 *   POST /actes/deces/transcription → transcription jugement supplétif
 */
@Tag(name = "Actes Décès", description = "Gestion des actes de décès")
@RestController
@RequestMapping("/actes/deces")
public class ActeDecesController {

    private final ActeDecesService acteDecesService;

    public ActeDecesController(ActeDecesService acteDecesService) {
        this.acteDecesService = acteDecesService;
    }

    // ── GET /actes/deces ──────────────────────────────────────────

    @Operation(summary = "Lister les actes de décès",
               description = "Retourne la liste paginée et filtrée des actes de décès.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<ActePageResponseDTO> search(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String npi,
            @RequestParam(required = false) String numero,
            @RequestParam(required = false) String typeCreation,
            @RequestParam(required = false) String dateDebut,
            @RequestParam(required = false) String dateFin,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {

        ActePageResponseDTO result = acteDecesService.search(
                nom, prenom, npi, numero, typeCreation, dateDebut, dateFin, page, size);
        return ResponseEntity.ok(result);
    }

    // ── POST /actes/deces ─────────────────────────────────────────

    @Operation(summary = "Créer une déclaration de décès")
    @PostMapping
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> createDeclaration(@RequestBody ActeDecesRequest request) {
        ActeSummaryDTO saved = acteDecesService.createDeclaration(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── POST /actes/deces/transcription ───────────────────────────

    @Operation(summary = "Créer une transcription de jugement supplétif de décès")
    @PostMapping("/transcription")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> createTranscription(@RequestBody ActeDecesRequest request) {
        ActeSummaryDTO saved = acteDecesService.createTranscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── DELETE /actes/deces/{id} ──────────────────────────────────

    @Operation(summary = "Supprimer logiquement un acte de décès")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<Void> softDelete(@PathVariable String id) {
        acteDecesService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
