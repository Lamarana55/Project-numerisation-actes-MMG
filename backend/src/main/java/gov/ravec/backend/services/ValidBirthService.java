package gov.ravec.backend.services;

import gov.ravec.backend.dto.ValidBirthDTO;
import gov.ravec.backend.dto.ValidationActionRequest;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.repositories.ValidBirthRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.NiveauAdministratif;
import gov.ravec.backend.utils.PageResponse;
import gov.ravec.backend.utils.ValidationStatut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service métier pour le module de validation des actes de naissance.
 *
 * Règles RBAC appliquées :
 *   CENTRAL      → tous les actes
 *   REGIONAL     → actes de la région de l'utilisateur
 *   PREFECTORAL  → actes de la préfecture de l'utilisateur
 *   COMMUNAL (ODEC, SUPERVISEUR) → actes de la commune de l'utilisateur
 *   AGENT        → uniquement ses propres actes
 *
 * Qui peut valider / rejeter :
 *   CENTRAL, REGIONAL, PREFECTORAL (coordinateurs), COMMUNAL (ODEC, SUPERVISEUR)
 *
 * L'AGENT peut uniquement corriger un acte qui lui a été renvoyé (REJETE).
 */
@Service
public class ValidBirthService {

    private final ValidBirthRepository validBirthRepository;
    private final UserConnected userConnected;

    public ValidBirthService(ValidBirthRepository validBirthRepository,
                             UserConnected userConnected) {
        this.validBirthRepository = validBirthRepository;
        this.userConnected = userConnected;
    }

    // ── Lecture : liste paginée avec filtres ─────────────────────────────────

    /**
     * Retourne la liste des actes visibles par l'utilisateur connecté,
     * en appliquant le périmètre territorial et les filtres optionnels.
     *
     * @param statut     filtre optionnel sur le statut de validation
     * @param region     filtre optionnel sur la région (ignoré si non CENTRAL)
     * @param prefecture filtre optionnel sur la préfecture
     * @param commune    filtre optionnel sur la commune
     * @param page       numéro de page (0-based)
     * @param size       nombre d'éléments par page
     */
    @Transactional(readOnly = true)
    public PageResponse<ValidBirthDTO> getAll(
            ValidationStatut statut,
            String region,
            String prefecture,
            String commune,
            int page,
            int size) {

        User currentUser = userConnected.getUserConnected();
        NiveauAdministratif niveau = currentUser.getNiveauAdministratif();
        Pageable pageable = PageRequest.of(page, size);
        Page<ValidBirth> resultPage;

        if (niveau == null) {
            throw new RuntimeException("Niveau administratif non défini pour cet utilisateur.");
        }

        switch (niveau) {
            case CENTRAL -> resultPage = validBirthRepository.findAllWithFilters(
                    Delete.No, statut, region, prefecture, commune, pageable);

            case REGIONAL -> {
                String userRegion = currentUser.getRegion() != null
                        ? currentUser.getRegion().getNom() : null;
                resultPage = validBirthRepository.findByRegionWithFilters(
                        Delete.No, userRegion, statut, prefecture, commune, pageable);
            }

            case PREFECTORAL -> {
                String userPref = currentUser.getPrefecture() != null
                        ? currentUser.getPrefecture().getNom() : null;
                resultPage = validBirthRepository.findByPrefectureWithFilters(
                        Delete.No, userPref, statut, commune, pageable);
            }

            case COMMUNAL -> {
                // ODEC, SUPERVISEUR : commune de l'utilisateur
                if (currentUser.hasRole("AGENT")) {
                    // AGENT : uniquement ses propres actes
                    resultPage = validBirthRepository.findByAgentWithFilters(
                            Delete.No, currentUser, statut, pageable);
                } else {
                    String userCommune = currentUser.getCommune() != null
                            ? currentUser.getCommune().getNom() : null;
                    resultPage = validBirthRepository.findByCommuneWithFilters(
                            Delete.No, userCommune, statut, pageable);
                }
            }

            default -> throw new RuntimeException("Niveau administratif non reconnu : " + niveau);
        }

        return toPageResponse(resultPage);
    }

    // ── Lecture : détail d'un acte ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public ValidBirthDTO getById(String id) {
        ValidBirth acte = findActeAccessible(id);
        return ValidBirthDTO.fromEntity(acte);
    }

    // ── Action : valider un acte ─────────────────────────────────────────────

    @Transactional
    public ValidBirthDTO valider(String id) {
        User currentUser = userConnected.getUserConnected();
        assertPeutValiderOuRejeter(currentUser);

        ValidBirth acte = findActeAccessible(id);

        if (acte.getStatut() != ValidationStatut.EN_ATTENTE) {
            throw new IllegalStateException(
                    "Seul un acte EN_ATTENTE peut être validé. Statut actuel : " + acte.getStatut());
        }

        acte.setStatut(ValidationStatut.VALIDE);
        acte.setDateAction(LocalDateTime.now());
        acte.setValidateur(currentUser);
        acte.setMotifRejet(null);

        return ValidBirthDTO.fromEntity(validBirthRepository.save(acte));
    }

    // ── Action : rejeter un acte ─────────────────────────────────────────────

    @Transactional
    public ValidBirthDTO rejeter(String id, ValidationActionRequest request) {
        User currentUser = userConnected.getUserConnected();
        assertPeutValiderOuRejeter(currentUser);

        if (request.getMotifRejet() == null || request.getMotifRejet().isBlank()) {
            throw new IllegalArgumentException("Le motif de rejet est obligatoire.");
        }

        ValidBirth acte = findActeAccessible(id);

        if (acte.getStatut() != ValidationStatut.EN_ATTENTE) {
            throw new IllegalStateException(
                    "Seul un acte EN_ATTENTE peut être rejeté. Statut actuel : " + acte.getStatut());
        }

        acte.setStatut(ValidationStatut.REJETE);
        acte.setDateAction(LocalDateTime.now());
        acte.setValidateur(currentUser);
        acte.setMotifRejet(request.getMotifRejet().trim());

        return ValidBirthDTO.fromEntity(validBirthRepository.save(acte));
    }

    // ── Action : corriger un acte rejeté (AGENT) ─────────────────────────────

    @Transactional
    public ValidBirthDTO corriger(String id) {
        User currentUser = userConnected.getUserConnected();

        ValidBirth acte = validBirthRepository.findByIdAndIsDeleted(id, Delete.No)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));

        // Un agent ne peut corriger que ses propres actes
        if (acte.getUser() == null || !acte.getUser().getId().equals(currentUser.getId())) {
            throw new SecurityException("Accès refusé : vous ne pouvez corriger que vos propres actes.");
        }

        if (acte.getStatut() != ValidationStatut.REJETE) {
            throw new IllegalStateException(
                    "Seul un acte REJETÉ peut être soumis à correction. Statut actuel : " + acte.getStatut());
        }

        // Remettre en attente pour re-validation
        acte.setStatut(ValidationStatut.EN_ATTENTE);
        acte.setDateAction(LocalDateTime.now());
        acte.setValidateur(null);
        acte.setMotifRejet(null);

        return ValidBirthDTO.fromEntity(validBirthRepository.save(acte));
    }

    // ── Helpers privés ───────────────────────────────────────────────────────

    /**
     * Charge un acte et vérifie que l'utilisateur connecté a le droit de le voir,
     * selon son niveau territorial.
     */
    private ValidBirth findActeAccessible(String id) {
        User currentUser = userConnected.getUserConnected();
        NiveauAdministratif niveau = currentUser.getNiveauAdministratif();

        ValidBirth acte = validBirthRepository.findByIdAndIsDeleted(id, Delete.No)
                .orElseThrow(() -> new RuntimeException("Acte introuvable : " + id));

        switch (niveau) {
            case CENTRAL -> { /* accès total */ }
            case REGIONAL -> {
                String userRegion = currentUser.getRegion() != null
                        ? currentUser.getRegion().getNom() : "";
                if (!userRegion.equals(acte.getRegion())) {
                    throw new SecurityException("Accès refusé : cet acte n'appartient pas à votre région.");
                }
            }
            case PREFECTORAL -> {
                String userPref = currentUser.getPrefecture() != null
                        ? currentUser.getPrefecture().getNom() : "";
                if (!userPref.equals(acte.getPrefecture())) {
                    throw new SecurityException("Accès refusé : cet acte n'appartient pas à votre préfecture.");
                }
            }
            case COMMUNAL -> {
                if (currentUser.hasRole("AGENT")) {
                    if (acte.getUser() == null || !acte.getUser().getId().equals(currentUser.getId())) {
                        throw new SecurityException("Accès refusé : vous ne pouvez consulter que vos propres actes.");
                    }
                } else {
                    String userCommune = currentUser.getCommune() != null
                            ? currentUser.getCommune().getNom() : "";
                    if (!userCommune.equals(acte.getCommune())) {
                        throw new SecurityException("Accès refusé : cet acte n'appartient pas à votre commune.");
                    }
                }
            }
        }
        return acte;
    }

    /**
     * Vérifie que l'utilisateur a le droit de valider ou rejeter un acte.
     * Profils autorisés : tous sauf AGENT.
     */
    private void assertPeutValiderOuRejeter(User user) {
        if (user.hasRole("AGENT")) {
            throw new SecurityException(
                    "Les agents ne peuvent pas valider ou rejeter des actes.");
        }
    }

    /** Convertit une Page JPA en PageResponse<ValidBirthDTO>. */
    private PageResponse<ValidBirthDTO> toPageResponse(Page<ValidBirth> page) {
        PageResponse<ValidBirthDTO> response = new PageResponse<>();
        response.setContent(page.getContent().stream()
                .map(ValidBirthDTO::fromEntity)
                .toList());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setSize(page.getSize());
        response.setNumber(page.getNumber());
        response.setNumberOfElements(page.getNumberOfElements());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        response.setEmpty(page.isEmpty());
        return response;
    }
}
