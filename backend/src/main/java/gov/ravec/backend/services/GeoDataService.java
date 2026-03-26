package gov.ravec.backend.services;

import gov.ravec.backend.dto.*;
import gov.ravec.backend.entities.*;
import gov.ravec.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GeoDataService {

    private final PaysRepository paysRepository;
    private final VilleRepository villeRepository;
    private final RegionRepository regionRepository;
    private final PrefectureRepository prefectureRepository;
    private final CommuneRepository communeRepository;
    private final QuartierRepository quartierRepository;


    /**
     * Récupère toutes les régions
     */
    public List<RegionDTO> getAllRegions() {
        log.info("Récupération de toutes les régions");
        return regionRepository.findAll().stream()
                .map(this::toRegionDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les pays
     */
    public List<PaysDTO> getAllPays() {
        log.info("Récupération de tous les pays");
        return paysRepository.findAll().stream()
                .map(this::toPaysDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les communes
     */
    public List<CommuneDTO> getAllCommunes() {
        log.info("Récupération de toutes les communes");
        return communeRepository.findAll().stream()
                .map(this::toCommuneDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les préfectures d'une région donnée
     */
    public List<PrefectureDTO> getPrefecturesByRegionCode(String codeRegion) {
        log.info("Récupération des préfectures de la région: {}", codeRegion);
        Region region = regionRepository.findByCode(codeRegion)
                .orElseThrow(() -> new RuntimeException("Région non trouvée: " + codeRegion));
        return prefectureRepository.findByRegion(region).stream()
                .map(this::toPrefectureDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les communes d'une préfecture donnée
     */
    public List<CommuneDTO> getCommunesByPrefectureCode(String codePrefecture) {
        log.info("Récupération des communes de la préfecture: {}", codePrefecture);
        Prefecture prefecture = prefectureRepository.findByCode(codePrefecture)
                .orElseThrow(() -> new RuntimeException("Préfecture non trouvée: " + codePrefecture));
        return communeRepository.findByPrefecture(prefecture).stream()
                .map(this::toCommuneDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les quartiers d'une commune donnée
     */
    public List<QuartierDTO> getQuartiersByCommuneCode(String codeCommune) {
        log.info("Récupération des quartiers de la commune: {}", codeCommune);
        Commune commune = communeRepository.findByCode(codeCommune)
                .orElseThrow(() -> new RuntimeException("Commune non trouvée: " + codeCommune));
        return quartierRepository.findByCommune(commune).stream()
                .map(this::toQuartierDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère toutes les villes d'un pays donné
     */
    public List<VilleDTO> getVillesByPaysCode(String codePays) {
        log.info("Récupération des villes du pays: {}", codePays);
        Pays pays = paysRepository.findByCode(codePays)
                .orElseThrow(() -> new RuntimeException("Pays non trouvé: " + codePays));
        return villeRepository.findByPays(pays).stream()
                .map(this::toVilleDTO)
                .collect(Collectors.toList());
    }

    // ========== Méthodes de mapping ==========

    private PaysDTO toPaysDTO(Pays pays) {
        return PaysDTO.builder()
                .id(pays.getId())
                .code(pays.getCode())
                .nom(pays.getNom())
                .codeRegion(pays.getCodeRegion())
                .codeNumerique(pays.getCodeNumerique())
                .build();
    }

    private VilleDTO toVilleDTO(Ville ville) {
        return VilleDTO.builder()
                .id(ville.getId())
                .code(ville.getCode())
                .nom(ville.getNom())
                .codePays(ville.getCodePays())
                .build();
    }

    private RegionDTO toRegionDTO(Region region) {
        return RegionDTO.builder()
                .id(region.getId())
                .code(region.getCode())
                .nom(region.getNom())
                .build();
    }

    private PrefectureDTO toPrefectureDTO(Prefecture prefecture) {
        return PrefectureDTO.builder()
                .id(prefecture.getId())
                .code(prefecture.getCode())
                .nom(prefecture.getNom())
                .codeRegion(prefecture.getRegion().getCode())
                .build();
    }

    private CommuneDTO toCommuneDTO(Commune commune) {
        return CommuneDTO.builder()
                .id(commune.getId())
                .code(commune.getCode())
                .nom(commune.getNom())
                .codePrefecture(commune.getPrefecture().getCode())
                .build();
    }

    private QuartierDTO toQuartierDTO(Quartier quartier) {
        return QuartierDTO.builder()
                .id(quartier.getId())
                .code(quartier.getCode())
                .nom(quartier.getNom())
                .codeCommune(quartier.getCommune().getCode())
                .build();
    }
}