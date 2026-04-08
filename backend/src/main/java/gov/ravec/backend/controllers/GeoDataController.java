package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.*;
import gov.ravec.backend.services.GeoDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/geodata")
@RequiredArgsConstructor
@Tag(name = "Données Géographiques", description = "API de gestion des données géographiques (Régions, Préfectures, Communes, Quartiers, Pays, Villes)")
public class GeoDataController {

    private final GeoDataService geoDataService;

    /**
     * GET /geodata/regions
     * Récupère toutes les régions
     */
    @GetMapping("/regions")
    @Operation(summary = "Liste des régions", description = "Récupère toutes les régions de Guinée")
    public ResponseEntity<List<RegionDTO>> getAllRegions() {
        return ResponseEntity.ok(geoDataService.getAllRegions());
    }

    /**
     * GET /geodata/pays
     * Récupère tous les pays
     */
    @GetMapping("/pays")
    @Operation(summary = "Liste des pays", description = "Récupère tous les pays enregistrés")
    public ResponseEntity<List<PaysDTO>> getAllPays() {
        return ResponseEntity.ok(geoDataService.getAllPays());
    }

    /**
     * GET /geodata/regions/{codeRegion}/prefectures
     * Récupère toutes les préfectures d'une région donnée
     */
    @GetMapping("/regions/{codeRegion}/prefectures")
    @Operation(summary = "Préfectures par région", description = "Récupère toutes les préfectures d'une région spécifique")
    public ResponseEntity<List<PrefectureDTO>> getPrefecturesByRegion(
            @PathVariable String codeRegion) {
        return ResponseEntity.ok(geoDataService.getPrefecturesByRegionCode(codeRegion));
    }

    /**
     * GET /geodata/communes
     * Récupère toutes les communes
     */
    @GetMapping("/communes")
    @Operation(summary = "Liste des communes", description = "Récupère toutes les communes enregistrées")
    public ResponseEntity<List<CommuneDTO>> getAllCommunes() {
        return ResponseEntity.ok(geoDataService.getAllCommunes());
    }

    /**
     * GET /geodata/prefectures/{codePrefecture}/communes
     * Récupère toutes les communes d'une préfecture donnée
     */
    @GetMapping("/prefectures/{codePrefecture}/communes")
    @Operation(summary = "Communes par préfecture", description = "Récupère toutes les communes d'une préfecture spécifique")
    public ResponseEntity<List<CommuneDTO>> getCommunesByPrefecture(
            @PathVariable String codePrefecture) {
        return ResponseEntity.ok(geoDataService.getCommunesByPrefectureCode(codePrefecture));
    }

    /**
     * GET /geodata/communes/{codeCommune}/quartiers
     * Récupère tous les quartiers d'une commune donnée
     */
    @GetMapping("/communes/{codeCommune}/quartiers")
    @Operation(summary = "Quartiers par commune", description = "Récupère tous les quartiers d'une commune spécifique")
    public ResponseEntity<List<QuartierDTO>> getQuartiersByCommune(
            @PathVariable String codeCommune) {
        return ResponseEntity.ok(geoDataService.getQuartiersByCommuneCode(codeCommune));
    }

    /**
     * GET /geodata/pays/{codePays}/villes
     * Récupère toutes les villes d'un pays donné
     */
    @GetMapping("/pays/{codePays}/villes")
    @Operation(summary = "Villes par pays", description = "Récupère toutes les villes d'un pays spécifique")
    public ResponseEntity<List<VilleDTO>> getVillesByPays(
            @PathVariable String codePays) {
        return ResponseEntity.ok(geoDataService.getVillesByPaysCode(codePays));
    }

    // ─── Régions ────────────────────────────────────────────────────────────

    @PutMapping("/regions/{id}")
    @Operation(summary = "Modifier une région")
    public ResponseEntity<RegionDTO> updateRegion(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRegionRequest request) {
        return ResponseEntity.ok(geoDataService.updateRegion(id, request));
    }

    @DeleteMapping("/regions/{id}")
    @Operation(summary = "Supprimer une région")
    public ResponseEntity<Void> deleteRegion(@PathVariable UUID id) {
        geoDataService.deleteRegion(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Préfectures ────────────────────────────────────────────────────────

    @PutMapping("/prefectures/{id}")
    @Operation(summary = "Modifier une préfecture")
    public ResponseEntity<PrefectureDTO> updatePrefecture(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePrefectureRequest request) {
        return ResponseEntity.ok(geoDataService.updatePrefecture(id, request));
    }

    @DeleteMapping("/prefectures/{id}")
    @Operation(summary = "Supprimer une préfecture")
    public ResponseEntity<Void> deletePrefecture(@PathVariable UUID id) {
        geoDataService.deletePrefecture(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Pays ───────────────────────────────────────────────────────────────

    @PutMapping("/pays/{id}")
    @Operation(summary = "Modifier un pays")
    public ResponseEntity<PaysDTO> updatePays(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRegionRequest request) {
        return ResponseEntity.ok(geoDataService.updatePays(id, request));
    }

    @DeleteMapping("/pays/{id}")
    @Operation(summary = "Supprimer un pays")
    public ResponseEntity<Void> deletePays(@PathVariable UUID id) {
        geoDataService.deletePays(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Communes ───────────────────────────────────────────────────────────

    @PostMapping("/communes")
    @Operation(summary = "Créer une commune")
    public ResponseEntity<CommuneDTO> createCommune(@Valid @RequestBody CreateCommuneRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(geoDataService.createCommune(request));
    }

    @PutMapping("/communes/{id}")
    @Operation(summary = "Modifier une commune")
    public ResponseEntity<CommuneDTO> updateCommune(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommuneRequest request) {
        return ResponseEntity.ok(geoDataService.updateCommune(id, request));
    }

    @DeleteMapping("/communes/{id}")
    @Operation(summary = "Supprimer une commune")
    public ResponseEntity<Void> deleteCommune(@PathVariable UUID id) {
        geoDataService.deleteCommune(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Quartiers ──────────────────────────────────────────────────────────

    @PostMapping("/quartiers")
    @Operation(summary = "Créer un quartier")
    public ResponseEntity<QuartierDTO> createQuartier(@Valid @RequestBody CreateQuartierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(geoDataService.createQuartier(request));
    }

    @PutMapping("/quartiers/{id}")
    @Operation(summary = "Modifier un quartier")
    public ResponseEntity<QuartierDTO> updateQuartier(
            @PathVariable UUID id,
            @Valid @RequestBody CreateQuartierRequest request) {
        return ResponseEntity.ok(geoDataService.updateQuartier(id, request));
    }

    @DeleteMapping("/quartiers/{id}")
    @Operation(summary = "Supprimer un quartier")
    public ResponseEntity<Void> deleteQuartier(@PathVariable UUID id) {
        geoDataService.deleteQuartier(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Villes ─────────────────────────────────────────────────────────────

    @PostMapping("/villes")
    @Operation(summary = "Créer une ville")
    public ResponseEntity<VilleDTO> createVille(@Valid @RequestBody CreateVilleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(geoDataService.createVille(request));
    }

    @PutMapping("/villes/{id}")
    @Operation(summary = "Modifier une ville")
    public ResponseEntity<VilleDTO> updateVille(
            @PathVariable UUID id,
            @Valid @RequestBody CreateVilleRequest request) {
        return ResponseEntity.ok(geoDataService.updateVille(id, request));
    }

    @DeleteMapping("/villes/{id}")
    @Operation(summary = "Supprimer une ville")
    public ResponseEntity<Void> deleteVille(@PathVariable UUID id) {
        geoDataService.deleteVille(id);
        return ResponseEntity.noContent().build();
    }
}