package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.Nationalite;
import gov.ravec.backend.services.NationaliteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nationalites")
@RequiredArgsConstructor
@Tag(name = "Nationalités", description = "API de gestion des nationalités")
public class NationaliteController {

    private final NationaliteService nationaliteService;

    @GetMapping
    @Operation(summary = "Liste de toutes les nationalités")
    public ResponseEntity<List<Nationalite>> getAll() {
        return ResponseEntity.ok(nationaliteService.findAll());
    }
}
