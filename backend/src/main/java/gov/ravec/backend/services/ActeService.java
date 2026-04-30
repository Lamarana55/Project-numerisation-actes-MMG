package gov.ravec.backend.services;

import gov.ravec.backend.dto.ActePageResponseDTO;
import gov.ravec.backend.dto.ActeSummaryDTO;
import gov.ravec.backend.entities.ActeDeces;
import gov.ravec.backend.entities.ActeNaissance;
import gov.ravec.backend.repositories.ActeDecesRepository;
import gov.ravec.backend.repositories.ActeNaissanceRepository;
import gov.ravec.backend.utils.Delete;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Endpoint unifié GET /actes : combine les actes de naissance et de décès.
 */
@Service
public class ActeService {

    private final ActeNaissanceRepository naissanceRepo;
    private final ActeDecesRepository     decesRepo;

    public ActeService(ActeNaissanceRepository naissanceRepo,
                       ActeDecesRepository decesRepo) {
        this.naissanceRepo = naissanceRepo;
        this.decesRepo     = decesRepo;
    }

    @Transactional(readOnly = true)
    public ActePageResponseDTO searchAll(String nom, String prenom, String npi,
                                         String numero, String typeCreation,
                                         String typeActe,
                                         String dateDebut, String dateFin,
                                         int page, int size) {

        LocalDate debut = parseDate(dateDebut);
        LocalDate fin   = parseDate(dateFin);

        // ── Normaliser les filtres ─────────────────────────────
        String nomF    = blankToNull(nom);
        String prenomF = blankToNull(prenom);
        String npiF    = blankToNull(npi);
        String numF    = blankToNull(numero);
        String srcF    = blankToNull(typeCreation);
        String taF     = blankToNull(typeActe); // "naissance" ou "deces"

        // On charge les deux types avec un budget généreux pour faire
        // la pagination côté service (max 5000 enregistrements chargés).
        int maxFetch = Math.max(size * (page + 1) + size, 500);
        PageRequest all = PageRequest.of(0, maxFetch, Sort.by(Sort.Direction.DESC, "createdAt"));

        List<ActeSummaryDTO> combined = new ArrayList<>();

        // ── Actes de naissance ────────────────────────────────
        if (taF == null || taF.equalsIgnoreCase("naissance")) {
            List<ActeNaissance> naissances = naissanceRepo.search(
                    nomF, prenomF, npiF, numF, srcF, null,
                    debut, fin, Delete.No, all
            ).getContent();
            naissances.stream().map(ActeSummaryDTO::from).forEach(combined::add);
        }

        // ── Actes de décès ────────────────────────────────────
        if (taF == null || taF.equalsIgnoreCase("deces")) {
            List<ActeDeces> deces = decesRepo.search(
                    nomF, prenomF, numF, null,
                    debut, fin, Delete.No, all
            ).getContent();
            deces.stream().map(ActeSummaryDTO::from).forEach(combined::add);
        }

        // ── Tri global par createdAt DESC ─────────────────────
        combined.sort(Comparator.comparing(
                (ActeSummaryDTO a) -> a.getCreatedAt() != null ? a.getCreatedAt() : "",
                Comparator.reverseOrder()
        ));

        // ── Pagination manuelle ───────────────────────────────
        long totalElements = combined.size();
        int  totalPages    = (int) Math.ceil((double) totalElements / size);
        int  fromIndex     = Math.min(page * size, (int) totalElements);
        int  toIndex       = Math.min(fromIndex + size, (int) totalElements);

        List<ActeSummaryDTO> pageContent = combined.subList(fromIndex, toIndex);

        return ActePageResponseDTO.builder()
                .content(pageContent)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .size(size)
                .number(page)
                .numberOfElements(pageContent.size())
                .first(page == 0)
                .last(page >= totalPages - 1)
                .empty(pageContent.isEmpty())
                .build();
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
