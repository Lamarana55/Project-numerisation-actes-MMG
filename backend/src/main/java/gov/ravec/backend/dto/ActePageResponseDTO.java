package gov.ravec.backend.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.function.Function;

/**
 * Réponse paginée générique pour les actes.
 * Compatible avec l'interface ActeNaissancePage du frontend.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActePageResponseDTO {

    private List<ActeSummaryDTO> content;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;
    private int numberOfElements;
    private boolean first;
    private boolean last;
    private boolean empty;

    /** Construit la réponse à partir d'une Page Spring Data. */
    public static <T> ActePageResponseDTO from(Page<T> page, Function<T, ActeSummaryDTO> mapper) {
        List<ActeSummaryDTO> content = page.getContent().stream().map(mapper).toList();
        return ActePageResponseDTO.builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .number(page.getNumber())
                .numberOfElements(page.getNumberOfElements())
                .first(page.isFirst())
                .last(page.isLast())
                .empty(page.isEmpty())
                .build();
    }
}
