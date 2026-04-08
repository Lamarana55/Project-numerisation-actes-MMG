package gov.ravec.backend.services;

import gov.ravec.backend.dto.*;
import gov.ravec.backend.entities.*;
import gov.ravec.backend.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
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

    // ========== Opérations CRUD Région ==========

    @Transactional
    public RegionDTO updateRegion(UUID id, CreateRegionRequest request) {
        log.info("Mise à jour de la région: {}", id);
        Region region = regionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Région non trouvée: " + id));
        region.setCode(request.getCode());
        region.setNom(request.getNom());
        return toRegionDTO(regionRepository.save(region));
    }

    @Transactional
    public void deleteRegion(UUID id) {
        log.info("Suppression de la région: {}", id);
        regionRepository.deleteById(id);
    }

    // ========== Opérations CRUD Préfecture ==========

    @Transactional
    public PrefectureDTO updatePrefecture(UUID id, CreatePrefectureRequest request) {
        log.info("Mise à jour de la préfecture: {}", id);
        Prefecture prefecture = prefectureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Préfecture non trouvée: " + id));
        prefecture.setCode(request.getCode());
        prefecture.setNom(request.getNom());
        if (request.getRegionCode() != null && !request.getRegionCode().isBlank()) {
            Region region = regionRepository.findByCode(request.getRegionCode())
                    .orElseThrow(() -> new RuntimeException("Région non trouvée: " + request.getRegionCode()));
            prefecture.setRegion(region);
        }
        return toPrefectureDTO(prefectureRepository.save(prefecture));
    }

    @Transactional
    public void deletePrefecture(UUID id) {
        log.info("Suppression de la préfecture: {}", id);
        prefectureRepository.deleteById(id);
    }

    // ========== Opérations CRUD Pays ==========

    @Transactional
    public PaysDTO updatePays(UUID id, CreateRegionRequest request) {
        log.info("Mise à jour du pays: {}", id);
        Pays pays = paysRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pays non trouvé: " + id));
        pays.setCode(request.getCode());
        pays.setNom(request.getNom());
        return toPaysDTO(paysRepository.save(pays));
    }

    @Transactional
    public void deletePays(UUID id) {
        log.info("Suppression du pays: {}", id);
        paysRepository.deleteById(id);
    }

    // ========== Opérations CRUD Commune ==========

    @Transactional
    public CommuneDTO createCommune(CreateCommuneRequest request) {
        log.info("Création d'une commune: {}", request.getCode());
        Prefecture prefecture = prefectureRepository.findByCode(request.getPrefectureCode())
                .orElseThrow(() -> new RuntimeException("Préfecture non trouvée: " + request.getPrefectureCode()));
        Commune commune = Commune.builder()
                .code(request.getCode())
                .nom(request.getNom())
                .prefecture(prefecture)
                .build();
        return toCommuneDTO(communeRepository.save(commune));
    }

    @Transactional
    public CommuneDTO updateCommune(UUID id, CreateCommuneRequest request) {
        log.info("Mise à jour de la commune: {}", id);
        Commune commune = communeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commune non trouvée: " + id));
        commune.setCode(request.getCode());
        commune.setNom(request.getNom());
        if (request.getPrefectureCode() != null && !request.getPrefectureCode().isBlank()) {
            Prefecture prefecture = prefectureRepository.findByCode(request.getPrefectureCode())
                    .orElseThrow(() -> new RuntimeException("Préfecture non trouvée: " + request.getPrefectureCode()));
            commune.setPrefecture(prefecture);
        }
        return toCommuneDTO(communeRepository.save(commune));
    }

    @Transactional
    public void deleteCommune(UUID id) {
        log.info("Suppression de la commune: {}", id);
        communeRepository.deleteById(id);
    }

    // ========== Opérations CRUD Quartier ==========

    @Transactional
    public QuartierDTO createQuartier(CreateQuartierRequest request) {
        log.info("Création d'un quartier: {}", request.getCode());
        Commune commune = communeRepository.findByCode(request.getCommuneCode())
                .orElseThrow(() -> new RuntimeException("Commune non trouvée: " + request.getCommuneCode()));
        Quartier quartier = Quartier.builder()
                .code(request.getCode())
                .nom(request.getNom())
                .commune(commune)
                .build();
        return toQuartierDTO(quartierRepository.save(quartier));
    }

    @Transactional
    public QuartierDTO updateQuartier(UUID id, CreateQuartierRequest request) {
        log.info("Mise à jour du quartier: {}", id);
        Quartier quartier = quartierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quartier non trouvé: " + id));
        quartier.setCode(request.getCode());
        quartier.setNom(request.getNom());
        if (request.getCommuneCode() != null && !request.getCommuneCode().isBlank()) {
            Commune commune = communeRepository.findByCode(request.getCommuneCode())
                    .orElseThrow(() -> new RuntimeException("Commune non trouvée: " + request.getCommuneCode()));
            quartier.setCommune(commune);
        }
        return toQuartierDTO(quartierRepository.save(quartier));
    }

    @Transactional
    public void deleteQuartier(UUID id) {
        log.info("Suppression du quartier: {}", id);
        quartierRepository.deleteById(id);
    }

    // ========== Opérations CRUD Ville ==========

    @Transactional
    public VilleDTO createVille(CreateVilleRequest request) {
        log.info("Création d'une ville: {}", request.getCode());
        Pays pays = paysRepository.findByCode(request.getPaysCode())
                .orElseThrow(() -> new RuntimeException("Pays non trouvé: " + request.getPaysCode()));
        Ville ville = Ville.builder()
                .code(request.getCode())
                .nom(request.getNom())
                .codePays(request.getPaysCode())
                .pays(pays)
                .build();
        return toVilleDTO(villeRepository.save(ville));
    }

    @Transactional
    public VilleDTO updateVille(UUID id, CreateVilleRequest request) {
        log.info("Mise à jour de la ville: {}", id);
        Ville ville = villeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ville non trouvée: " + id));
        ville.setCode(request.getCode());
        ville.setNom(request.getNom());
        if (request.getPaysCode() != null && !request.getPaysCode().isBlank()) {
            Pays pays = paysRepository.findByCode(request.getPaysCode())
                    .orElseThrow(() -> new RuntimeException("Pays non trouvé: " + request.getPaysCode()));
            ville.setCodePays(request.getPaysCode());
            ville.setPays(pays);
        }
        return toVilleDTO(villeRepository.save(ville));
    }

    @Transactional
    public void deleteVille(UUID id) {
        log.info("Suppression de la ville: {}", id);
        villeRepository.deleteById(id);
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