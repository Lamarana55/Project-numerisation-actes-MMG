package gov.ravec.backend.services;

import gov.ravec.backend.dto.ActeNaissanceDetailDTO;
import gov.ravec.backend.dto.ActeNaissanceRequest;
import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.Personne;
import gov.ravec.backend.repositories.ActeNaissanceRepository;
import gov.ravec.backend.repositories.CommuneRepository;
import gov.ravec.backend.repositories.PersonneRepository;
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
public class ActeNaissanceService {

    private final ActeNaissanceRepository acteRepo;
    private final CommuneRepository communeRepo;
    private final TypeActeRepository typeActeRepo;
    private final UserConnected userConnected;
    private final NpiGeneratorService npiGenerator;
    private final PersonneRepository personneRepo;

    public ActeNaissanceService(ActeNaissanceRepository acteRepo,
                                CommuneRepository communeRepo,
                                TypeActeRepository typeActeRepo,
                                UserConnected userConnected,
                                NpiGeneratorService npiGenerator,
                                PersonneRepository personneRepo) {
        this.acteRepo      = acteRepo;
        this.communeRepo   = communeRepo;
        this.typeActeRepo  = typeActeRepo;
        this.userConnected = userConnected;
        this.npiGenerator  = npiGenerator;
        this.personneRepo  = personneRepo;
    }

    // ── Consultation par identifiant ──────────────────────────────

    @Transactional(readOnly = true)
    public ActeNaissanceDetailDTO getById(String id) {
        ActeNaissance acte = acteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));
        return ActeNaissanceDetailDTO.from(acte);
    }

    // ── Validation ────────────────────────────────────────────────

    @Transactional
    public ActeSummaryDTO valider(String id) {
        ActeNaissance acte = acteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));
        acte.setStatut(ValidationStatut.VALIDE);
        acte.setValidateur(userConnected.getUserConnected());
        acte.setDateAction(LocalDateTime.now());

        // Générer le NPI de l'enfant si pas encore attribué, puis persister explicitement
        Personne enfant = acte.getEnfant();
        if (enfant != null && (enfant.getNpi() == null || enfant.getNpi().isBlank())) {
            enfant.setNpi(npiGenerator.generate(acte));
            personneRepo.save(enfant);
        }

        acteRepo.save(acte);
        return ActeSummaryDTO.from(acte);
    }

    // ── Mise à jour ───────────────────────────────────────────────

    @Transactional
    public ActeSummaryDTO update(String id, ActeNaissanceRequest req) {
        ActeNaissance acte = acteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));

        // Enfant
        Personne enfant = acte.getEnfant();
        if (enfant == null) { enfant = new Personne(); enfant.setId(UUID.randomUUID().toString()); }
        enfant.setPrenom(req.getPrenom());
        enfant.setNom(req.getNom());
        enfant.setSexe(req.getSexe());
        enfant.setDateNaissance(req.getDateNaissance());
        enfant.setPaysNaissance(req.getPaysNaissance());
        enfant.setRegionNaissance(req.getRegionNaissance());
        enfant.setPrefectureNaissance(req.getPrefectureNaissance());
        enfant.setCommuneNaissance(req.getCommuneNaissance());
        enfant.setQuartierNaissance(req.getQuartierNaissance());
        enfant.setVilleNaissance(req.getVilleNaissance());
        acte.setEnfant(enfant);

        // Père
        if (hasName(req.getPrenomPere(), req.getNomPere())) {
            Personne pere = acte.getPere();
            if (pere == null) { pere = new Personne(); pere.setId(UUID.randomUUID().toString()); }
            pere.setPrenom(req.getPrenomPere()); pere.setNom(req.getNomPere());
            pere.setSexe("M"); pere.setDateNaissance(req.getDateNaissancePere());
            pere.setPaysNaissance(req.getPaysNaissancePere());
            pere.setRegionNaissance(req.getRegionNaissancePere());
            pere.setPrefectureNaissance(req.getPrefectureNaissancePere());
            pere.setCommuneNaissance(req.getCommuneNaissancePere());
            pere.setQuartierNaissance(req.getQuartierNaissancePere());
            pere.setVilleNaissance(req.getVilleNaissancePere());
            pere.setNationalite(req.getNationalitePere());
            pere.setProfession(req.getProfessionPere());
            pere.setTelephone(req.getTelephonePere());
            pere.setSituationMatrimoniale(req.getSituationMatrimPere());
            pere.setAdresse(req.getAdressePere());
            pere.setPaysResidence(req.getPaysResidencePere());
            pere.setRegionDomicile(req.getRegionDomicilePere());
            pere.setPrefectureDomicile(req.getPrefectureDomicilePere());
            pere.setCommuneDomicile(req.getCommuneDomicilePere());
            pere.setQuartierDomicile(req.getQuartierDomicilePere());
            acte.setPere(pere);
        }

        // Mère
        if (hasName(req.getPrenomMere(), req.getNomMere())) {
            Personne mere = acte.getMere();
            if (mere == null) { mere = new Personne(); mere.setId(UUID.randomUUID().toString()); }
            mere.setPrenom(req.getPrenomMere()); mere.setNom(req.getNomMere());
            mere.setSexe("F"); mere.setDateNaissance(req.getDateNaissanceMere());
            mere.setPaysNaissance(req.getPaysNaissanceMere());
            mere.setRegionNaissance(req.getRegionNaissanceMere());
            mere.setPrefectureNaissance(req.getPrefectureNaissanceMere());
            mere.setCommuneNaissance(req.getCommuneNaissanceMere());
            mere.setQuartierNaissance(req.getQuartierNaissanceMere());
            mere.setVilleNaissance(req.getVilleNaissanceMere());
            mere.setNationalite(req.getNationaliteMere());
            mere.setProfession(req.getProfessionMere());
            mere.setTelephone(req.getTelephoneMere());
            mere.setSituationMatrimoniale(req.getSituationMatrimMere());
            mere.setAdresse(req.getAdresseMere());
            mere.setPaysResidence(req.getPaysResidenceMere());
            mere.setRegionDomicile(req.getRegionDomicileMere());
            mere.setPrefectureDomicile(req.getPrefectureDomicileMere());
            mere.setCommuneDomicile(req.getCommuneDomicileMere());
            mere.setQuartierDomicile(req.getQuartierDomicileMere());
            acte.setMere(mere);
        }

        // Déclarant
        if (hasName(req.getPrenomDeclarant(), req.getNomDeclarant())) {
            Personne decl = acte.getDeclarant();
            if (decl == null) { decl = new Personne(); decl.setId(UUID.randomUUID().toString()); }
            decl.setPrenom(req.getPrenomDeclarant());
            decl.setNom(req.getNomDeclarant());
            decl.setSexe(req.getSexeDeclarant());
            decl.setTelephone(req.getTelephoneDeclarant());
            acte.setDeclarant(decl);
        }

        // Champs acte
        acte.setHeureNaissance(req.getHeureNaissance());
        acte.setLieuAccouchement(req.getLieuAccouchement());
        acte.setFormationSanitaire(req.getFormationSanitaire());
        acte.setAdresseLieu(req.getAdresseLieu());
        acte.setNaissanceMultiple(req.getNaissanceMultiple());
        acte.setTypeNaissanceMultiple(req.getTypeNaissanceMultiple());
        acte.setRangEnfant(req.getRangEnfant());
        acte.setRangNaissanceMere(req.getRangNaissanceMere());
        acte.setPereConnu(req.getPereConnu());
        acte.setPereDecede(req.getPereDecede());
        acte.setMereConnue(req.getMereConnue());
        acte.setMereDecedee(req.getMereDecedee());
        acte.setMemeDomicileQuePere(req.getMemeDomicileQuePere());
        acte.setParentsMaries(req.getParentsMaries());
        acte.setDocumentMariage(req.getDocumentMariage());
        acte.setNumeroActeMariage(req.getNumeroActeMariage());
        acte.setDateMariage(req.getDateMariage());
        acte.setCommuneMariage(req.getCommuneMariage());
        acte.setQualiteDeclarant(req.getQualiteDeclarant());
        acte.setDateDeclaration(req.getDateDeclaration());
        acte.setSexeDeclarant(req.getSexeDeclarant());
        acte.setSignatureDeclarant(req.getSignatureDeclarant());
        acte.setRaisonNonSignature(req.getRaisonNonSignature());
        acte.setDateJugement(req.getDateJugement());
        acte.setNumeroJugement(req.getNumeroJugement());
        acte.setTribunal(req.getTribunal());
        acte.setDateInscription(req.getDateInscription());
        acte.setHeureInscription(req.getHeureInscription());
        acte.setDateDressage(req.getDateDressage());
        acte.setHeureDressage(req.getHeureDressage());
        acte.setPointCollecte(req.getPointCollecte());
        acte.setNumeroActe(req.getNumeroActe());

        if (req.getActionsFaire() != null) {
            try {
                acte.setActionsFaire(ActionsFaire.valueOf(req.getActionsFaire().toUpperCase()));
            } catch (IllegalArgumentException ignored) { }
        }

        acte.setDateAction(LocalDateTime.now());
        acteRepo.save(acte);
        return ActeSummaryDTO.from(acte);
    }

    // ── Suppression logique ───────────────────────────────────────

    @Transactional
    public void softDelete(String id) {
        ActeNaissance acte = acteRepo.findById(id)
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
        String src      = blankToNull(typeCreation);

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActeNaissance> result = acteRepo.search(
                blankToNull(nom), blankToNull(prenom), blankToNull(npi),
                blankToNull(numero), src, null,
                debut, fin, Delete.No, pageable
        );
        return ActePageResponseDTO.from(result, ActeSummaryDTO::from);
    }

    // ── Création déclaration dans les délais ──────────────────────

    @Transactional
    public ActeSummaryDTO createDeclaration(ActeNaissanceRequest req) {
        return sauvegarder(req, SourceActe.DECLARATION);
    }

    // ── Création transcription jugement supplétif ─────────────────

    @Transactional
    public ActeSummaryDTO createTranscription(ActeNaissanceRequest req) {
        return sauvegarder(req, SourceActe.TRANSCRIPTION);
    }

    // ── Création depuis numérisation / indexation ─────────────────

    @Transactional
    public ActeSummaryDTO createFromNumerisation(ActeNaissanceRequest req, SourceActe source) {
        return sauvegarder(req, source);
    }

    // ── Logique commune de sauvegarde ─────────────────────────────

    private ActeSummaryDTO sauvegarder(ActeNaissanceRequest req, SourceActe source) {

        // ── Enfant ──────────────────────────────────────────────
        Personne enfant = buildPersonne(
                req.getPrenom(), req.getNom(), req.getSexe(), req.getDateNaissance(),
                req.getPaysNaissance(), req.getRegionNaissance(),
                req.getPrefectureNaissance(), req.getCommuneNaissance(),
                req.getQuartierNaissance(), req.getVilleNaissance(),
                null, null, null, null, null, null, null, null, null, null);

        // ── Père ────────────────────────────────────────────────
        Personne pere = null;
        if (hasName(req.getPrenomPere(), req.getNomPere())) {
            pere = buildPersonne(
                    req.getPrenomPere(), req.getNomPere(), "M", req.getDateNaissancePere(),
                    req.getPaysNaissancePere(), req.getRegionNaissancePere(),
                    req.getPrefectureNaissancePere(), req.getCommuneNaissancePere(),
                    req.getQuartierNaissancePere(), req.getVilleNaissancePere(),
                    req.getNationalitePere(), req.getProfessionPere(),
                    req.getTelephonePere(), req.getSituationMatrimPere(),
                    req.getAdressePere(), req.getPaysResidencePere(),
                    req.getRegionDomicilePere(), req.getPrefectureDomicilePere(),
                    req.getCommuneDomicilePere(), req.getQuartierDomicilePere());
        }

        // ── Mère ────────────────────────────────────────────────
        Personne mere = null;
        if (hasName(req.getPrenomMere(), req.getNomMere())) {
            mere = buildPersonne(
                    req.getPrenomMere(), req.getNomMere(), "F", req.getDateNaissanceMere(),
                    req.getPaysNaissanceMere(), req.getRegionNaissanceMere(),
                    req.getPrefectureNaissanceMere(), req.getCommuneNaissanceMere(),
                    req.getQuartierNaissanceMere(), req.getVilleNaissanceMere(),
                    req.getNationaliteMere(), req.getProfessionMere(),
                    req.getTelephoneMere(), req.getSituationMatrimMere(),
                    req.getAdresseMere(), req.getPaysResidenceMere(),
                    req.getRegionDomicileMere(), req.getPrefectureDomicileMere(),
                    req.getCommuneDomicileMere(), req.getQuartierDomicileMere());
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
        var typeActe = typeActeRepo.findByCode("NAISSANCE").orElse(null);

        // ── Commune de l'acte ───────────────────────────────────
        Commune commune = null;
        // La commune sera résolu par le frontend via le Centre d'État Civil de l'agent

        // ── ActionsFaire ────────────────────────────────────────
        ActionsFaire actionsFaire = ActionsFaire.EN_COURS_SAISIE;
        if (req.getActionsFaire() != null) {
            try {
                actionsFaire = ActionsFaire.valueOf(req.getActionsFaire().toUpperCase());
            } catch (IllegalArgumentException ignored) { }
        }

        // ── Construction de l'acte ──────────────────────────────
        ActeNaissance acte = ActeNaissance.builder()
                .id(UUID.randomUUID().toString())
                .source(source)
                .typeActe(typeActe)
                .numeroActe(req.getNumeroActe())
                // Personnes
                .enfant(enfant)
                .pere(pere)
                .mere(mere)
                .declarant(declarant)
                // Naissance
                .heureNaissance(req.getHeureNaissance())
                .lieuAccouchement(req.getLieuAccouchement())
                .formationSanitaire(req.getFormationSanitaire())
                .adresseLieu(req.getAdresseLieu())
                .naissanceMultiple(req.getNaissanceMultiple())
                .typeNaissanceMultiple(req.getTypeNaissanceMultiple())
                .rangEnfant(req.getRangEnfant())
                .rangNaissanceMere(req.getRangNaissanceMere())
                // Statuts père / mère
                .pereConnu(req.getPereConnu())
                .pereDecede(req.getPereDecede())
                .mereConnue(req.getMereConnue())
                .mereDecedee(req.getMereDecedee())
                .memeDomicileQuePere(req.getMemeDomicileQuePere())
                // Mariage parents
                .parentsMaries(req.getParentsMaries())
                .documentMariage(req.getDocumentMariage())
                .numeroActeMariage(req.getNumeroActeMariage())
                .dateMariage(req.getDateMariage())
                .communeMariage(req.getCommuneMariage())
                // Déclarant (champs acte-spécifiques)
                .qualiteDeclarant(req.getQualiteDeclarant())
                .dateDeclaration(req.getDateDeclaration())
                .sexeDeclarant(req.getSexeDeclarant())
                .signatureDeclarant(req.getSignatureDeclarant())
                .raisonNonSignature(req.getRaisonNonSignature())
                // Transcription
                .dateJugement(req.getDateJugement())
                .numeroJugement(req.getNumeroJugement())
                .tribunal(req.getTribunal())
                // Inscription
                .dateInscription(req.getDateInscription())
                .heureInscription(req.getHeureInscription())
                .dateDressage(req.getDateDressage())
                .heureDressage(req.getHeureDressage())
                .pointCollecte(req.getPointCollecte())
                // Workflow
                .actionsFaire(actionsFaire)
                .statut(ValidationStatut.EN_ATTENTE)
                .dateAction(LocalDateTime.now())
                // Localisation & agent
                .commune(commune)
                .agent(userConnected.getUserConnected())
                .isDeleted(Delete.No)
                .build();

        acteRepo.save(acte);
        return ActeSummaryDTO.from(acte);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private Personne buildPersonne(String prenom, String nom, String sexe, LocalDate dateNaissance,
                                   String paysNaissance, String regionNaissance,
                                   String prefectureNaissance, String communeNaissance,
                                   String quartierNaissance, String villeNaissance,
                                   String nationalite, String profession,
                                   String telephone, String situationMatrimoniale,
                                   String adresse, String paysResidence,
                                   String regionDomicile, String prefectureDomicile,
                                   String communeDomicile, String quartierDomicile) {
        Personne p = new Personne();
        p.setId(UUID.randomUUID().toString());
        p.setPrenom(prenom);
        p.setNom(nom);
        p.setSexe(sexe);
        p.setDateNaissance(dateNaissance);
        p.setPaysNaissance(paysNaissance);
        p.setRegionNaissance(regionNaissance);
        p.setPrefectureNaissance(prefectureNaissance);
        p.setCommuneNaissance(communeNaissance);
        p.setQuartierNaissance(quartierNaissance);
        p.setVilleNaissance(villeNaissance);
        p.setNationalite(nationalite);
        p.setProfession(profession);
        p.setTelephone(telephone);
        p.setSituationMatrimoniale(situationMatrimoniale);
        p.setAdresse(adresse);
        p.setPaysResidence(paysResidence);
        p.setRegionDomicile(regionDomicile);
        p.setPrefectureDomicile(prefectureDomicile);
        p.setCommuneDomicile(communeDomicile);
        p.setQuartierDomicile(quartierDomicile);
        return p;
    }

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
