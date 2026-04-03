package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ValidBirthDTO;
import gov.ravec.backend.dto.ValidationActionRequest;
import gov.ravec.backend.services.ValidBirthService;
import gov.ravec.backend.utils.PageResponse;
import gov.ravec.backend.utils.ValidationStatut;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * API REST pour la gestion des actes de naissance validés.
 *
 * Toutes les routes requièrent une authentification JWT.
 * La restriction territoriale est appliquée au niveau du service (RBAC).
 *
 * Endpoints :
 *   GET  /valid-births              → liste paginée et filtrée
 *   GET  /valid-births/{id}         → détail d'un acte
 *   POST /valid-births/{id}/valider → valider un acte EN_ATTENTE
 *   POST /valid-births/{id}/rejeter → rejeter un acte EN_ATTENTE (motif obligatoire)
 *   POST /valid-births/{id}/corriger→ remettre EN_ATTENTE après correction (AGENT)
 */
@Tag(name = "Validation Actes", description = "Module de validation des actes de naissance")
@RestController
@RequestMapping("/valid-births")
public class ValidBirthController {

    private final ValidBirthService validBirthService;

    public ValidBirthController(ValidBirthService validBirthService) {
        this.validBirthService = validBirthService;
    }

    // ── GET /valid-births ─────────────────────────────────────────────────────

    @Operation(summary = "Lister les actes", description =
            "Retourne la liste paginée des actes visibles selon le périmètre territorial de l'utilisateur connecté.")
    @GetMapping
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<PageResponse<ValidBirthDTO>> index(
            @RequestParam(required = false) ValidationStatut statut,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String prefecture,
            @RequestParam(required = false) String commune,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "25") int size) {

        PageResponse<ValidBirthDTO> result =
                validBirthService.getAll(statut, region, prefecture, commune, page, size);
        return ResponseEntity.ok(result);
    }

    // ── GET /valid-births/{id} ────────────────────────────────────────────────

    @Operation(summary = "Détail d'un acte")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<ValidBirthDTO> show(@PathVariable String id) {
        return ResponseEntity.ok(validBirthService.getById(id));
    }

    // ── POST /valid-births/{id}/valider ───────────────────────────────────────

    @Operation(summary = "Valider un acte",
            description = "Passe le statut de l'acte à VALIDE. L'acte doit être EN_ATTENTE.")
    @PostMapping("/{id}/valider")
    @PreAuthorize("hasAuthority('CAN_VALIDATE_BIRTH')")
    public ResponseEntity<ValidBirthDTO> valider(@PathVariable String id) {
        return ResponseEntity.ok(validBirthService.valider(id));
    }

    // ── POST /valid-births/{id}/rejeter ───────────────────────────────────────

    @Operation(summary = "Rejeter un acte",
            description = "Passe le statut de l'acte à REJETE. Le motif de rejet est obligatoire.")
    @PostMapping("/{id}/rejeter")
    @PreAuthorize("hasAuthority('CAN_REJECT_BIRTH')")
    public ResponseEntity<ValidBirthDTO> rejeter(
            @PathVariable String id,
            @RequestBody ValidationActionRequest request) {
        return ResponseEntity.ok(validBirthService.rejeter(id, request));
    }

    // ── POST /valid-births/{id}/corriger ──────────────────────────────────────

    @Operation(summary = "Soumettre une correction",
            description = "Remet un acte REJETÉ au statut EN_ATTENTE. Réservé à l'agent saisisseur.")
    @PostMapping("/{id}/corriger")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ValidBirthDTO> corriger(@PathVariable String id) {
        return ResponseEntity.ok(validBirthService.corriger(id));
    }
}
