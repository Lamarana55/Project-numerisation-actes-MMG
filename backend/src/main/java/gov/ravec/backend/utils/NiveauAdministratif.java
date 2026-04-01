package gov.ravec.backend.utils;

/**
 * Niveaux administratifs hiérarchiques du système PN-RAVEC.
 * Détermine la portée territoriale d'accès d'un profil utilisateur.
 */
public enum NiveauAdministratif {

    /** Accès national — couvre l'ensemble des régions, préfectures et communes */
    CENTRAL,

    /** Accès régional — limité à une région et ses préfectures/communes */
    REGIONAL,

    /** Accès préfectoral — limité à une préfecture et ses communes */
    PREFECTORAL,

    /** Accès communal — limité à une seule commune */
    COMMUNAL
}
