package gov.ravec.backend.dto;

import lombok.*;

/**
 * Corps de requête pour les actions de validation ou de rejet d'un acte.
 * Le champ {@code motifRejet} est obligatoire lorsqu'on rejette un acte.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ValidationActionRequest {

    /** Motif de rejet — obligatoire si l'action est un rejet. */
    private String motifRejet;
}
