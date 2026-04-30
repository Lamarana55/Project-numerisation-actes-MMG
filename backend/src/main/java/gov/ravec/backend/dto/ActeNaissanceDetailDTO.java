package gov.ravec.backend.dto;

import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.entities.Personne;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO complet d'un acte de naissance pour consultation / modification.
 * Tous les champs sont exposés pour permettre le pré-remplissage du formulaire.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActeNaissanceDetailDTO {

    private String id;
    private String source;          // DECLARATION, TRANSCRIPTION, NUMERISATION, INDEXATION
    private String typeActe;        // "naissance"
    private String statut;
    private String actionsFaire;
    private String numeroActe;
    private String anneeRegistre;
    private String feuillet;
    private String numeroVolume;

    // ── Enfant ──────────────────────────────────────────────────────
    private String prenom;
    private String nom;
    private String sexe;
    private LocalDate dateNaissance;
    private String heureNaissance;
    private String npiEnfant;
    private String paysNaissance;
    private String regionNaissance;
    private String prefectureNaissance;
    private String communeNaissance;
    private String quartierNaissance;
    private String villeNaissance;
    private String lieuAccouchement;
    private String formationSanitaire;
    private String adresseLieu;
    private String naissanceMultiple;
    private String typeNaissanceMultiple;
    private Integer rangEnfant;
    private Integer rangNaissanceMere;

    // ── Père ────────────────────────────────────────────────────────
    private String pereConnu;
    private String pereDecede;
    private String prenomPere;
    private String nomPere;
    private LocalDate dateNaissancePere;
    private String npiPere;
    private String paysNaissancePere;
    private String regionNaissancePere;
    private String prefectureNaissancePere;
    private String communeNaissancePere;
    private String quartierNaissancePere;
    private String villeNaissancePere;
    private String nationalitePere;
    private String professionPere;
    private String telephonePere;
    private String situationMatrimPere;
    private String adressePere;
    private String paysResidencePere;
    private String regionDomicilePere;
    private String prefectureDomicilePere;
    private String communeDomicilePere;
    private String quartierDomicilePere;

    // ── Mère ────────────────────────────────────────────────────────
    private String mereConnue;
    private String mereDecedee;
    private String prenomMere;
    private String nomMere;
    private LocalDate dateNaissanceMere;
    private String npiMere;
    private String paysNaissanceMere;
    private String regionNaissanceMere;
    private String prefectureNaissanceMere;
    private String communeNaissanceMere;
    private String quartierNaissanceMere;
    private String villeNaissanceMere;
    private String nationaliteMere;
    private String professionMere;
    private String telephoneMere;
    private String situationMatrimMere;
    private String memeDomicileQuePere;
    private String adresseMere;
    private String paysResidenceMere;
    private String regionDomicileMere;
    private String prefectureDomicileMere;
    private String communeDomicileMere;
    private String quartierDomicileMere;
    private String parentsMaries;
    private String documentMariage;
    private String numeroActeMariage;
    private LocalDate dateMariage;
    private String communeMariage;

    // ── Déclarant ───────────────────────────────────────────────────
    private String qualiteDeclarant;
    private LocalDate dateDeclaration;
    private String prenomDeclarant;
    private String nomDeclarant;
    private String sexeDeclarant;
    private String telephoneDeclarant;
    private String signatureDeclarant;
    private String raisonNonSignature;

    // ── Transcription ───────────────────────────────────────────────
    private LocalDate dateJugement;
    private String numeroJugement;
    private String tribunal;

    // ── Inscription / Dressage ──────────────────────────────────────
    private LocalDate dateInscription;
    private String heureInscription;
    private LocalDate dateDressage;
    private String heureDressage;
    private String pointCollecte;

    // ── Méta ────────────────────────────────────────────────────────
    private String commune;
    private String agentNomComplet;
    private String validateurNomComplet;
    private String createdAt;

    // ── Factory ─────────────────────────────────────────────────────
    public static ActeNaissanceDetailDTO from(ActeNaissance a) {
        Personne e  = a.getEnfant();
        Personne p  = a.getPere();
        Personne m  = a.getMere();
        Personne d  = a.getDeclarant();

        return ActeNaissanceDetailDTO.builder()
                .id(a.getId())
                .source(a.getSource() != null ? a.getSource().name() : null)
                .typeActe("naissance")
                .statut(a.getStatut() != null ? a.getStatut().name() : null)
                .actionsFaire(a.getActionsFaire() != null ? a.getActionsFaire().name() : null)
                .numeroActe(a.getNumeroActe())
                .anneeRegistre(a.getAnneeRegistre())
                .feuillet(a.getFeuillet())
                .numeroVolume(a.getNumeroVolume())
                // Enfant
                .prenom(e != null ? e.getPrenom() : null)
                .nom(e != null ? e.getNom() : null)
                .sexe(e != null ? e.getSexe() : null)
                .dateNaissance(e != null ? e.getDateNaissance() : null)
                .npiEnfant(e != null ? e.getNpi() : null)
                .heureNaissance(a.getHeureNaissance())
                .paysNaissance(e != null ? e.getPaysNaissance() : null)
                .regionNaissance(e != null ? e.getRegionNaissance() : null)
                .prefectureNaissance(e != null ? e.getPrefectureNaissance() : null)
                .communeNaissance(e != null ? e.getCommuneNaissance() : null)
                .quartierNaissance(e != null ? e.getQuartierNaissance() : null)
                .villeNaissance(e != null ? e.getVilleNaissance() : null)
                .lieuAccouchement(a.getLieuAccouchement())
                .formationSanitaire(a.getFormationSanitaire())
                .adresseLieu(a.getAdresseLieu())
                .naissanceMultiple(a.getNaissanceMultiple())
                .typeNaissanceMultiple(a.getTypeNaissanceMultiple())
                .rangEnfant(a.getRangEnfant())
                .rangNaissanceMere(a.getRangNaissanceMere())
                // Père
                .pereConnu(a.getPereConnu())
                .pereDecede(a.getPereDecede())
                .prenomPere(p != null ? p.getPrenom() : null)
                .nomPere(p != null ? p.getNom() : null)
                .dateNaissancePere(p != null ? p.getDateNaissance() : null)
                .npiPere(p != null ? p.getNpi() : null)
                .paysNaissancePere(p != null ? p.getPaysNaissance() : null)
                .regionNaissancePere(p != null ? p.getRegionNaissance() : null)
                .prefectureNaissancePere(p != null ? p.getPrefectureNaissance() : null)
                .communeNaissancePere(p != null ? p.getCommuneNaissance() : null)
                .quartierNaissancePere(p != null ? p.getQuartierNaissance() : null)
                .villeNaissancePere(p != null ? p.getVilleNaissance() : null)
                .nationalitePere(p != null ? p.getNationalite() : null)
                .professionPere(p != null ? p.getProfession() : null)
                .telephonePere(p != null ? p.getTelephone() : null)
                .situationMatrimPere(p != null ? p.getSituationMatrimoniale() : null)
                .adressePere(p != null ? p.getAdresse() : null)
                .paysResidencePere(p != null ? p.getPaysResidence() : null)
                .regionDomicilePere(p != null ? p.getRegionDomicile() : null)
                .prefectureDomicilePere(p != null ? p.getPrefectureDomicile() : null)
                .communeDomicilePere(p != null ? p.getCommuneDomicile() : null)
                .quartierDomicilePere(p != null ? p.getQuartierDomicile() : null)
                // Mère
                .mereConnue(a.getMereConnue())
                .mereDecedee(a.getMereDecedee())
                .prenomMere(m != null ? m.getPrenom() : null)
                .nomMere(m != null ? m.getNom() : null)
                .dateNaissanceMere(m != null ? m.getDateNaissance() : null)
                .npiMere(m != null ? m.getNpi() : null)
                .paysNaissanceMere(m != null ? m.getPaysNaissance() : null)
                .regionNaissanceMere(m != null ? m.getRegionNaissance() : null)
                .prefectureNaissanceMere(m != null ? m.getPrefectureNaissance() : null)
                .communeNaissanceMere(m != null ? m.getCommuneNaissance() : null)
                .quartierNaissanceMere(m != null ? m.getQuartierNaissance() : null)
                .villeNaissanceMere(m != null ? m.getVilleNaissance() : null)
                .nationaliteMere(m != null ? m.getNationalite() : null)
                .professionMere(m != null ? m.getProfession() : null)
                .telephoneMere(m != null ? m.getTelephone() : null)
                .situationMatrimMere(m != null ? m.getSituationMatrimoniale() : null)
                .memeDomicileQuePere(a.getMemeDomicileQuePere())
                .adresseMere(m != null ? m.getAdresse() : null)
                .paysResidenceMere(m != null ? m.getPaysResidence() : null)
                .regionDomicileMere(m != null ? m.getRegionDomicile() : null)
                .prefectureDomicileMere(m != null ? m.getPrefectureDomicile() : null)
                .communeDomicileMere(m != null ? m.getCommuneDomicile() : null)
                .quartierDomicileMere(m != null ? m.getQuartierDomicile() : null)
                .parentsMaries(a.getParentsMaries())
                .documentMariage(a.getDocumentMariage())
                .numeroActeMariage(a.getNumeroActeMariage())
                .dateMariage(a.getDateMariage())
                .communeMariage(a.getCommuneMariage())
                // Déclarant
                .qualiteDeclarant(a.getQualiteDeclarant())
                .dateDeclaration(a.getDateDeclaration())
                .prenomDeclarant(d != null ? d.getPrenom() : null)
                .nomDeclarant(d != null ? d.getNom() : null)
                .sexeDeclarant(a.getSexeDeclarant())
                .telephoneDeclarant(d != null ? d.getTelephone() : null)
                .signatureDeclarant(a.getSignatureDeclarant())
                .raisonNonSignature(a.getRaisonNonSignature())
                // Transcription
                .dateJugement(a.getDateJugement())
                .numeroJugement(a.getNumeroJugement())
                .tribunal(a.getTribunal())
                // Inscription
                .dateInscription(a.getDateInscription())
                .heureInscription(a.getHeureInscription())
                .dateDressage(a.getDateDressage())
                .heureDressage(a.getHeureDressage())
                .pointCollecte(a.getPointCollecte())
                // Méta
                .commune(a.getCommune() != null ? a.getCommune().getNom() : null)
                .agentNomComplet(a.getAgent() != null ? a.getAgent().getNomComplet() : null)
                .validateurNomComplet(a.getValidateur() != null ? a.getValidateur().getNomComplet() : null)
                .createdAt(a.getCreatedAt() != null ? a.getCreatedAt().toString() : null)
                .build();
    }
}
