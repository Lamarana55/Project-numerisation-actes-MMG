package gov.ravec.backend.utils;

/**
 * Source / mode de création d'un acte d'état civil.
 */
public enum SourceActe {
    /** Déclaration dans les délais (formulaire en ligne). */
    DECLARATION,
    /** Transcription de jugement supplétif. */
    TRANSCRIPTION,
    /** Acte repris par numérisation d'un registre papier. */
    NUMERISATION,
    /** Acte indexé via OCR depuis un registre numérisé. */
    INDEXATION
}
