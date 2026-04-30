package gov.ravec.backend.services;

import gov.ravec.backend.dto.ActeDecesRequest;
import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.entities.ActeDeces;
import gov.ravec.backend.entities.Personne;
import gov.ravec.backend.repositories.ActeDecesRepository;
import gov.ravec.backend.repositories.TypeActeRepository;
import gov.ravec.backend.utils.ActionsFaire;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.SourceActe;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ActeDecesService {

    private final ActeDecesRepository acteRepo;
    private final TypeActeRepository typeActeRepo;
    private final UserConnected userConnected;

    public ActeDecesService(ActeDecesRepository acteRepo,
                            TypeActeRepository typeActeRepo,
                            UserConnected userConnected) {
        this.acteRepo      = acteRepo;
        this.typeActeRepo  = typeActeRepo;
        this.userConnected = userConnected;
    }

    // ── Suppression logique ───────────────────────────────────────

    @Transactional
    public void softDelete(String id) {
        ActeDeces acte = acteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));
        acte.setIsDeleted(Delete.Yes);
        acteRepo.save(acte);
    }

    // ── Recherche paginée ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public ActePageResponseDTO search(String nom, String prenom, String npi,
                                      String numero, String typeCreation,
                                      String dateDebut, String dateFin,
                                      int page, int size) {
        LocalDate debut = parseDate(dateDebut);
        LocalDate fin   = parseDate(dateFin);

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActeDeces> result = acteRepo.search(
                blankToNull(nom), blankToNull(prenom),
                blankToNull(numero), null,
                debut, fin, Delete.No, pageable
        );
        return ActePageResponseDTO.from(result, ActeSummaryDTO::from);
    }

    // ── Création déclaration dans les délais ──────────────────────

    @Transactional
    public ActeSummaryDTO createDeclaration(ActeDecesRequest req) {
        return sauvegarder(req, SourceActe.DECLARATION);
    }

    // ── Création transcription jugement supplétif ─────────────────

    @Transactional
    public ActeSummaryDTO createTranscription(ActeDecesRequest req) {
        return sauvegarder(req, SourceActe.TRANSCRIPTION);
    }

    // ── Logique commune de sauvegarde ─────────────────────────────

    private ActeSummaryDTO sauvegarder(ActeDecesRequest req, SourceActe source) {

        // ── Défunt ──────────────────────────────────────────────
        Personne defunt = new Personne();
        defunt.setId(UUID.randomUUID().toString());
        defunt.setPrenom(req.getPrenomDefunt());
        defunt.setNom(req.getNomDefunt());
        defunt.setSexe(req.getSexeDefunt());
        defunt.setDateNaissance(req.getDateNaissanceDefunt());
        defunt.setNationalite(req.getNationaliteDefunt());
        defunt.setProfession(req.getProfessionDefunt());
        defunt.setPaysNaissance(req.getPaysNaissanceDefunt());
        defunt.setRegionNaissance(req.getRegionNaissanceDefunt());
        defunt.setPrefectureNaissance(req.getPrefectureNaissanceDefunt());
        defunt.setCommuneNaissance(req.getCommuneNaissanceDefunt());
        defunt.setSituationMatrimoniale(req.getSituationMatrimoniale());

        // ── Conjoint ────────────────────────────────────────────
        Personne conjoint = null;
        if (hasName(req.getPrenomConjoint(), req.getNomConjoint())) {
            conjoint = new Personne();
            conjoint.setId(UUID.randomUUID().toString());
            conjoint.setPrenom(req.getPrenomConjoint());
            conjoint.setNom(req.getNomConjoint());
            conjoint.setSexe(req.getSexeConjoint());
            conjoint.setNationalite(req.getNationaliteConjoint());
            conjoint.setProfession(req.getProfessionConjoint());
        }

        // ── Père ────────────────────────────────────────────────
        Personne pere = null;
        if (hasName(req.getPrenomPere(), req.getNomPere())) {
            pere = new Personne();
            pere.setId(UUID.randomUUID().toString());
            pere.setPrenom(req.getPrenomPere());
            pere.setNom(req.getNomPere());
            pere.setSexe("M");
            pere.setDateNaissance(req.getDateNaissancePere());
            pere.setNationalite(req.getNationalitePere());
            pere.setProfession(req.getProfessionPere());
        }

        // ── Mère ────────────────────────────────────────────────
        Personne mere = null;
        if (hasName(req.getPrenomMere(), req.getNomMere())) {
            mere = new Personne();
            mere.setId(UUID.randomUUID().toString());
            mere.setPrenom(req.getPrenomMere());
            mere.setNom(req.getNomMere());
            mere.setSexe("F");
            mere.setDateNaissance(req.getDateNaissanceMere());
            mere.setNationalite(req.getNationaliteMere());
            mere.setProfession(req.getProfessionMere());
        }

        // ── Déclarant ───────────────────────────────────────────
        Personne declarant = null;
        if (hasName(req.getPrenomDeclarant(), req.getNomDeclarant())) {
            declarant = new Personne();
            declarant.setId(UUID.randomUUID().toString());
            declarant.setPrenom(req.getPrenomDeclarant());
            declarant.setNom(req.getNomDeclarant());
            declarant.setSexe(req.getSexeDeclarant());
            declarant.setTelephone(req.getTelephoneDeclarant());
        }

        // ── Type d'acte ─────────────────────────────────────────
        var typeActe = typeActeRepo.findByCode("DECES").orElse(null);

        // ── ActionsFaire ────────────────────────────────────────
        ActionsFaire actionsFaire = ActionsFaire.EN_COURS_SAISIE;
        if (req.getActionsFaire() != null) {
            try {
                actionsFaire = ActionsFaire.valueOf(req.getActionsFaire().toUpperCase());
            } catch (IllegalArgumentException ignored) { }
        }

        // ── Construction de l'acte ──────────────────────────────
        ActeDeces acte = ActeDeces.builder()
                .id(UUID.randomUUID().toString())
                .source(source)
                .typeActe(typeActe)
                .numeroActe(req.getNumeroActe())
                // Personnes
                .defunt(defunt)
                .conjoint(conjoint)
                .pere(pere)
                .mere(mere)
                .declarant(declarant)
                // Décès
                .dateDeces(req.getDateDeces())
                .heureDeces(req.getHeureDeces())
                .lieuDeces(req.getLieuDeces())
                .causeDeces(req.getCauseDeces())
                .typeDeces(req.getTypeDeces())
                .situationMatrimoniale(req.getSituationMatrimoniale())
                .conjointConnu(req.getConjointConnu())
                // Déclarant
                .qualiteDeclarant(req.getQualiteDeclarant())
                .dateDeclaration(req.getDateDeclaration())
                .lienDeclarantDefunt(req.getLienDeclarantDefunt())
                .signatureDeclarant(req.getSignatureDeclarant())
                // Transcription
                .dateJugement(req.getDateJugement())
                .numeroJugement(req.getNumeroJugement())
                .tribunal(req.getTribunal())
                // Inscription
                .dateInscription(req.getDateInscription())
                .heureInscription(req.getHeureInscription())
                .dateDressage(req.getDateDressage())
                .heureDressage(req.getHeureDressage())
                // Workflow
                .actionsFaire(actionsFaire)
                .statut(ValidationStatut.EN_ATTENTE)
                .dateAction(LocalDateTime.now())
                // Agent
                .agent(userConnected.getUserConnected())
                .isDeleted(Delete.No)
                .build();

        acteRepo.save(acte);
        return ActeSummaryDTO.from(acte);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private boolean hasName(String prenom, String nom) {
        return (prenom != null && !prenom.isBlank()) || (nom != null && !nom.isBlank());
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private LocalDate parseDate(String s) {
        try {
            return (s != null && !s.isBlank()) ? LocalDate.parse(s) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
