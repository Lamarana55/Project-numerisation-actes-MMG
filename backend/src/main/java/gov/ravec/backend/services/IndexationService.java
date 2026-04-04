package gov.ravec.backend.services;

import gov.ravec.backend.dto.IndexationRequest;
import gov.ravec.backend.dto.ValidBirthDTO;
import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.repositories.ValidBirthRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Gère la réception et la persistance des actes indexés depuis le module
 * de numérisation. Chaque acte est créé avec le statut EN_ATTENTE.
 */
@Service
public class IndexationService {

    private final ValidBirthRepository validBirthRepository;
    private final UserConnected userConnected;

    public IndexationService(ValidBirthRepository validBirthRepository,
                             UserConnected userConnected) {
        this.validBirthRepository = validBirthRepository;
        this.userConnected = userConnected;
    }

    @Transactional
    public ValidBirthDTO sauvegarder(IndexationRequest req) {

        ValidBirth acte = ValidBirth.builder()
                .id(UUID.randomUUID().toString())
                // Localisation
                .region(req.getRegion_collecte())
                .prefecture(req.getPrefecture_collecte())
                .commune(req.getCommune())
                .district(req.getDistrict())
                .secteur(req.getSecteur())
                // Registre
                .anneeRegistre(req.getAnnee_registre())
                .numeroRegistre(req.getNumero_registre())
                .feuillet(req.getFeuillet())
                .numeroActe(req.getNumero_acte())
                .numeroVolet(req.getNumero_volet())
                // Dates du fait
                .jours_des_faits(req.getJours_des_faits())
                .mois_des_faits(req.getMois_des_faits())
                .annee_des_faits(req.getAnnee_des_faits())
                .heureNaissance(req.getHeure_naissance())
                .minuteNaissance(req.getMinute_naissance())
                .rangNaissance(req.getRang_de_naissance())
                .date_etablissement_acte(req.getDate_etablissement_acte())
                // Enfant
                .prenoms(req.getPrenoms())
                .nom(req.getNom_membre())
                .genre(req.getGenre_membre())
                .dateNaissance(req.getDate_de_nais_membre())
                .nationalite_du_membre(req.getNationalite_du_membre())
                .code_profession(req.getCode_profession())
                // Lieu naissance
                .pays_de_naissance(req.getPays_de_naissance())
                .commune_de_nais(req.getCommune_de_nais())
                .district_de_nais(req.getDistrict_de_nais())
                .place_de_naissance(req.getPlace_de_naissance())
                // Père
                .prenomPere(req.getPrenoms_pere())
                .nomPere(req.getNom_pere())
                .dateNaissancePere(req.getDate_de_nais_pere())
                .nationalitePere(req.getNationalite_pere())
                .professionPere(req.getCode_profession_pere())
                // Mère
                .prenomMere(req.getPrenoms_mere())
                .nomMere(req.getNom_mere())
                .dateNaissanceMere(req.getDate_de_nais_mere())
                .nationaliteMere(req.getNationalite_mere())
                .professionMere(req.getCode_profession_mere())
                .domicileParent(req.getDomicileParent())
                // Déclarant
                .prenomDeclarant(req.getPrenom_1_declarant())
                .nomDeclarant(req.getNom_declarant())
                .lien_de_prarente_avec_le_declarant(req.getLien_de_prarente_avec_le_declarant())
                // Officier
                .prenomOffichier(req.getPrenom_1_officier())
                .nomOfficier(req.getNom_officier())
                .professionOfficier(req.getProfession_officier())
                // Image (base64 stocké en TEXT)
                .images(req.getImage_base64())
                .extension(req.getMedia_type())
                // Workflow
                .statut(ValidationStatut.EN_ATTENTE)
                .dateAction(LocalDateTime.now())
                .isDeleted(Delete.No)
                // Agent saisisseur
                .user(userConnected.getUserConnected())
                .build();

        return ValidBirthDTO.fromEntity(validBirthRepository.save(acte));
    }
}
