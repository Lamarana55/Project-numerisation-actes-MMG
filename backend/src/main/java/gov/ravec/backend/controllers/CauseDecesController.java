package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.CauseDeces;
import gov.ravec.backend.services.CauseDecesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/causes-deces")
@RequiredArgsConstructor
@Tag(name = "Causes de décès", description = "API de gestion des causes de décès")
public class CauseDecesController {

    private final CauseDecesService causeDecesService;

    @GetMapping
    @Operation(summary = "Liste de toutes les causes de décès")
    public ResponseEntity<List<CauseDeces>> getAll() {
        return ResponseEntity.ok(causeDecesService.findAll());
    }
}
