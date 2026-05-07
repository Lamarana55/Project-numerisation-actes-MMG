package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.StatistiquesDTO;
import gov.ravec.backend.services.StatistiquesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@RestController
@RequestMapping("/statistiques")
@RequiredArgsConstructor
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    @GetMapping("/dashboard")
    public ResponseEntity<StatistiquesDTO> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(statistiquesService.getDashboard(authentication.getName()));
    }

    @GetMapping("/rapport")
    public ResponseEntity<StatistiquesDTO> getRapport(
            @RequestParam String dateDebut,
            @RequestParam String dateFin,
            Authentication authentication) {
        Instant debut = LocalDate.parse(dateDebut).atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant fin   = LocalDate.parse(dateFin).atTime(23, 59, 59).atOffset(ZoneOffset.UTC).toInstant();
        return ResponseEntity.ok(statistiquesService.getRapport(authentication.getName(), debut, fin));
    }
}
