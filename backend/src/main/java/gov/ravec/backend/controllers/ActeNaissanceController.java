package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.ActeNaissanceDetailDTO;
import gov.ravec.backend.dto.ActeNaissanceRequest;
import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.services.ActeNaissanceService;
import gov.ravec.backend.services.BirthCertificatePdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * API REST pour les actes de naissance.
 *
 * Endpoints :
 *   GET  /actes/naissance               → liste paginée et filtrée
 *   POST /actes/naissance               → déclaration dans les délais
 *   POST /actes/naissance/transcription → transcription jugement supplétif
 */
@Tag(name = "Actes Naissance", description = "Gestion des actes de naissance")
@RestController
@RequestMapping("/actes/naissance")
public class ActeNaissanceController {

    private final ActeNaissanceService acteNaissanceService;
    private final BirthCertificatePdfService pdfService;

    public ActeNaissanceController(ActeNaissanceService acteNaissanceService,
                                   BirthCertificatePdfService pdfService) {
        this.acteNaissanceService = acteNaissanceService;
        this.pdfService = pdfService;
    }

    // ── GET /actes/naissance ──────────────────────────────────────

    @Operation(summary = "Lister les actes de naissance",
               description = "Retourne la liste paginée et filtrée des actes de naissance.")
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

        ActePageResponseDTO result = acteNaissanceService.search(
                nom, prenom, npi, numero, typeCreation, dateDebut, dateFin, page, size);
        return ResponseEntity.ok(result);
    }

    // ── POST /actes/naissance ─────────────────────────────────────

    @Operation(summary = "Créer une déclaration de naissance dans les délais")
    @PostMapping
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> createDeclaration(@RequestBody ActeNaissanceRequest request) {
        ActeSummaryDTO saved = acteNaissanceService.createDeclaration(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── POST /actes/naissance/transcription ───────────────────────

    @Operation(summary = "Créer une transcription de jugement supplétif de naissance")
    @PostMapping("/transcription")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> createTranscription(@RequestBody ActeNaissanceRequest request) {
        ActeSummaryDTO saved = acteNaissanceService.createTranscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── GET /actes/naissance/{id} ─────────────────────────────────

    @Operation(summary = "Consulter le détail d'un acte de naissance")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<ActeNaissanceDetailDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(acteNaissanceService.getById(id));
    }

    // ── PUT /actes/naissance/{id} ─────────────────────────────────

    @Operation(summary = "Mettre à jour un acte de naissance")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<ActeSummaryDTO> update(@PathVariable String id,
                                                 @RequestBody ActeNaissanceRequest request) {
        return ResponseEntity.ok(acteNaissanceService.update(id, request));
    }

    // ── PUT /actes/naissance/{id}/valider ─────────────────────────

    @Operation(summary = "Valider un acte de naissance")
    @PutMapping("/{id}/valider")
    @PreAuthorize("hasAuthority('CAN_VALIDATE_ACTS')")
    public ResponseEntity<ActeSummaryDTO> valider(@PathVariable String id) {
        return ResponseEntity.ok(acteNaissanceService.valider(id));
    }

    // ── GET /actes/naissance/{id}/pdf ─────────────────────────────

    @Operation(summary = "Générer le PDF de la copie intégrale d'un acte de naissance")
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('CAN_VIEW_VALIDATED_ACTS')")
    public ResponseEntity<byte[]> getPdf(@PathVariable String id) {
        try {
            byte[] pdf = pdfService.generateForActeNaissance(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "acte-naissance-" + id + ".pdf");
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ── DELETE /actes/naissance/{id} ──────────────────────────────

    @Operation(summary = "Supprimer logiquement un acte de naissance")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CAN_SAISIR_NAISSANCE')")
    public ResponseEntity<Void> softDelete(@PathVariable String id) {
        acteNaissanceService.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
