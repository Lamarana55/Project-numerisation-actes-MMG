package gov.ravec.backend.utils;

/**
 * Statut du cycle de validation d'un acte de naissance indexé.
 */
public enum ValidationStatut {

    /** Acte saisi, en attente de validation par un superviseur/ODEC/coordinateur. */
    EN_ATTENTE,

    /** Acte validé par un agent habilité. */
    VALIDE,

    /** Acte rejeté — motif obligatoire, renvoyé à l'agent pour correction. */
    REJETE
}
