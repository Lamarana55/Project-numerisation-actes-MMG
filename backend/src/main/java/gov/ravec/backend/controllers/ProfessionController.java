package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.Profession;
import gov.ravec.backend.services.ProfessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/professions")
@RequiredArgsConstructor
@Tag(name = "Professions", description = "API de gestion des professions")
public class ProfessionController {

    private final ProfessionService professionService;

    @GetMapping
    @Operation(summary = "Liste de toutes les professions")
    public ResponseEntity<List<Profession>> getAll() {
        return ResponseEntity.ok(professionService.findAll());
    }
}
