package gov.ravec.backend.services;

import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.dto.IndexationRequest;
import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.entities.DocumentActe;
import gov.ravec.backend.entities.Personne;
import gov.ravec.backend.repositories.ActeNaissanceRepository;
import gov.ravec.backend.repositories.TypeActeRepository;
import gov.ravec.backend.utils.ActionsFaire;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.SourceActe;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Gère la réception et la persistance des actes indexés depuis le module
 * de numérisation. Chaque acte est créé dans ActeNaissance avec la source
 * NUMERISATION et le statut EN_ATTENTE.
 */
@Service
public class IndexationService {

    private final ActeNaissanceRepository acteNaissanceRepository;
    private final TypeActeRepository typeActeRepo;
    private final UserConnected userConnected;

    public IndexationService(ActeNaissanceRepository acteNaissanceRepository,
                             TypeActeRepository typeActeRepo,
                             UserConnected userConnected) {
        this.acteNaissanceRepository = acteNaissanceRepository;
        this.typeActeRepo = typeActeRepo;
        this.userConnected = userConnected;
    }

    @Transactional
    public ActeSummaryDTO sauvegarder(IndexationRequest req) {
        return sauvegarder(req, SourceActe.NUMERISATION);
    }

    @Transactional
    public ActeSummaryDTO sauvegarder(IndexationRequest req, SourceActe source) {

        // ── Enfant ──────────────────────────────────────────────
        Personne enfant = new Personne();
        enfant.setId(UUID.randomUUID().toString());
        enfant.setPrenom(req.getPrenoms());
        enfant.setNom(req.getNom_membre());
        enfant.setSexe(req.getGenre_membre());
        enfant.setDateNaissance(parseDate(req.getDate_de_nais_membre()));
        enfant.setNationalite(req.getNationalite_du_membre());
        enfant.setProfession(req.getCode_profession());
        enfant.setPaysNaissance(req.getPays_de_naissance());
        enfant.setRegionNaissance(req.getRegion_naissance());
        enfant.setPrefectureNaissance(req.getPrefecture_naissance());
        enfant.setCommuneNaissance(req.getCommune_de_nais());
        enfant.setQuartierNaissance(req.getDistrict_de_nais());
        enfant.setVilleNaissance(req.getPlace_de_naissance());

        // ── Père ────────────────────────────────────────────────
        Personne pere = null;
        if (hasName(req.getPrenoms_pere(), req.getNom_pere())) {
            pere = new Personne();
            pere.setId(UUID.randomUUID().toString());
            pere.setPrenom(req.getPrenoms_pere());
            pere.setNom(req.getNom_pere());
            pere.setSexe("M");
            pere.setDateNaissance(parseDate(req.getDate_de_nais_pere()));
            pere.setNationalite(req.getNationalite_pere());
            pere.setProfession(req.getCode_profession_pere());
        }

        // ── Mère ────────────────────────────────────────────────
        Personne mere = null;
        if (hasName(req.getPrenoms_mere(), req.getNom_mere())) {
            mere = new Personne();
            mere.setId(UUID.randomUUID().toString());
            mere.setPrenom(req.getPrenoms_mere());
            mere.setNom(req.getNom_mere());
            mere.setSexe("F");
            mere.setDateNaissance(parseDate(req.getDate_de_nais_mere()));
            mere.setNationalite(req.getNationalite_mere());
            mere.setProfession(req.getCode_profession_mere());
            mere.setAdresse(req.getDomicileParent());
        }

        // ── Déclarant ───────────────────────────────────────────
        Personne declarant = null;
        if (hasName(req.getPrenom_1_declarant(), req.getNom_declarant())) {
            declarant = new Personne();
            declarant.setId(UUID.randomUUID().toString());
            declarant.setPrenom(req.getPrenom_1_declarant());
            declarant.setNom(req.getNom_declarant());
        }

        // ── Type d'acte ─────────────────────────────────────────
        var typeActe = typeActeRepo.findByCode("NAISSANCE").orElse(null);

        // ── Image → DocumentActe ────────────────────────────────
        List<DocumentActe> documents = new ArrayList<>();
        if (req.getImage_base64() != null && !req.getImage_base64().isBlank()) {
            DocumentActe doc = new DocumentActe();
            doc.setId(UUID.randomUUID().toString());
            doc.setNomFichier("scan_" + req.getNumero_acte());
            doc.setExtension(req.getMedia_type());
            doc.setContenu(req.getImage_base64());
            doc.setTypeDocument("IMAGE_SCAN");
            documents.add(doc);
        }

        // ── Construction de l'acte ──────────────────────────────
        ActeNaissance acte = ActeNaissance.builder()
                .id(UUID.randomUUID().toString())
                .source(source)
                .typeActe(typeActe)
                .numeroActe(req.getNumero_acte())
                .anneeRegistre(req.getAnnee_registre())
                .feuillet(req.getFeuillet())
                // Personnes
                .enfant(enfant)
                .pere(pere)
                .mere(mere)
                .declarant(declarant)
                // Naissance
                .heureNaissance(req.getHeure_naissance())
                .rangNaissanceMere(parseInteger(req.getRang_de_naissance()))
                // Zone de collecte → stockée dans pointCollecte
                .pointCollecte(buildPointCollecte(req))
                // Workflow
                .actionsFaire(ActionsFaire.EN_COURS_SAISIE)
                .statut(ValidationStatut.EN_ATTENTE)
                .dateAction(LocalDateTime.now())
                // Agent
                .agent(userConnected.getUserConnected())
                .isDeleted(Delete.No)
                .build();

        // Lier les documents à l'acte
        for (DocumentActe doc : documents) {
            doc.setActeNaissance(acte);
        }
        acte.getDocuments().addAll(documents);

        acteNaissanceRepository.save(acte);
        return ActeSummaryDTO.from(acte);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private String buildPointCollecte(IndexationRequest req) {
        StringBuilder sb = new StringBuilder();
        if (req.getRegion_collecte() != null)     sb.append(req.getRegion_collecte());
        if (req.getPrefecture_collecte() != null) sb.append(" / ").append(req.getPrefecture_collecte());
        if (req.getCommune() != null)             sb.append(" / ").append(req.getCommune());
        if (req.getDistrict() != null)            sb.append(" / ").append(req.getDistrict());
        return sb.length() > 0 ? sb.toString() : null;
    }

    private boolean hasName(String prenom, String nom) {
        return (prenom != null && !prenom.isBlank()) || (nom != null && !nom.isBlank());
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer parseInteger(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return Integer.parseInt(s.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
