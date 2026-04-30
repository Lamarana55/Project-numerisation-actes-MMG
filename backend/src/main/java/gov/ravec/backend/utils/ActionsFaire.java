package gov.ravec.backend.utils;

/**
 * Actions de workflow à effectuer sur un acte.
 */
public enum ActionsFaire {
    /** L'acte est en cours de saisie par l'agent. */
    EN_COURS_SAISIE,
    /** L'acte a été rejeté et doit être corrigé. */
    A_CORRIGER,
    /** L'acte attend validation par un superviseur. */
    A_VALIDER
}
