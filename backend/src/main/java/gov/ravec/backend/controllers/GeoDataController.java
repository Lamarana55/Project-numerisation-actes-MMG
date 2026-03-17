package gov.ravec.backend.controllers;

import gov.ravec.backend.dto.*;
import gov.ravec.backend.services.GeoDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}