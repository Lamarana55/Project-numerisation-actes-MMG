package gov.ravec.backend.services;

import gov.ravec.backend.entities.Commune;
import gov.ravec.backend.entities.ValidBirth;
import gov.ravec.backend.repositories.CommuneRepository;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Génère le Numéro Personnel d'Identification (NPI) pour un acte de naissance.
 *
 * Format NPI (Type 1 — Guinéen né en Guinée) :
 *   Sexe(1) + Année(2) + Mois(2) + Préfecture(3) + Commune(2) + Quartier(2) + Aléatoire(4) + Clé(2)
 *   Total : 18 caractères  (sans quartier connu : préfecture(3) + commune(2) + 00 + aléatoire(4) + clé(2))
 *
 * Algorithme de clé de contrôle :
 *   Pour chaque caractère numérique du NPI (sans clé) :
 *     position paire  → multiplier par 2
 *     position impaire → multiplier par 1
 *   Clé = 97 - (somme % 97), formaté sur 2 chiffres
 */
@Service
public class NpiGeneratorService {

    private final CommuneRepository communeRepository;

    public NpiGeneratorService(CommuneRepository communeRepository) {
        this.communeRepository = communeRepository;
    }

    /**
     * Génère un NPI pour un acte de naissance validé.
     *
     * @param acte l'acte de naissance validé
     * @return le NPI généré (15-18 caractères alphanumériques)
     */
    public String generate(ValidBirth acte) {
        // ── Sexe : 1 = Masculin, 2 = Féminin ──────────────────
        String sexe = "M".equalsIgnoreCase(safe(acte.getGenre())) ? "1" : "2";

        // ── Année et mois de naissance (2 chiffres chacun) ─────
        String annee = extractAnnee(acte);
        String mois = extractMois(acte);

        // ── Préfecture (3 caractères) ──────────────────────────
        String prefectureCode = extractPrefectureCode(acte);

        // ── Commune (2 derniers chiffres du code commune) ──────
        String communeCode = extractCommuneDigits(acte);

        // ── Quartier (pas disponible dans l'acte → "00") ───────
        String quartier = "00";

        // ── Numéro aléatoire (4 chiffres) ──────────────────────
        String aleatoire = String.valueOf(
                ThreadLocalRandom.current().nextInt(1000, 10000));

        // ── Construction NPI sans clé ──────────────────────────
        String npiSansCle = sexe + annee + mois + prefectureCode + communeCode + quartier + aleatoire;

        // ── Clé de contrôle (2 chiffres) ───────────────────────
        String cle = calculerCleControle(npiSansCle);

        return npiSansCle + cle;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  CLÉ DE CONTRÔLE
    // ═══════════════════════════════════════════════════════════════════

    /**
     * Calcule la clé de contrôle selon l'algorithme :
     * Somme pondérée (position paire ×2, impaire ×1), puis 97 - (somme % 97).
     * Pour les caractères alphabétiques, utilise la valeur ordinale (A=10, B=11, ...).
     */
    private String calculerCleControle(String npiSansCle) {
        int somme = 0;
        for (int i = 0; i < npiSansCle.length(); i++) {
            char c = npiSansCle.charAt(i);
            int valeur;
            if (Character.isDigit(c)) {
                valeur = Character.getNumericValue(c);
            } else {
                // Lettres : A=10, B=11, ..., Z=35
                valeur = Character.toUpperCase(c) - 'A' + 10;
            }
            int poids = (i % 2 == 0) ? 2 : 1;
            somme += valeur * poids;
        }
        int cle = 97 - (somme % 97);
        return String.format("%02d", cle);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  EXTRACTION DES COMPOSANTS
    // ═══════════════════════════════════════════════════════════════════

    private String extractAnnee(ValidBirth acte) {
        String annee = safe(acte.getAnnee_des_faits());
        if (annee.length() >= 4) {
            return annee.substring(annee.length() - 2);
        }
        if (annee.length() == 2) return annee;
        return "00";
    }

    private String extractMois(ValidBirth acte) {
        String mois = safe(acte.getMois_des_faits());
        try {
            return String.format("%02d", Integer.parseInt(mois));
        } catch (NumberFormatException e) {
            return "00";
        }
    }

    private String extractPrefectureCode(ValidBirth acte) {
        // Le code commune contient le code préfecture en préfixe (ex: CKY04 → CKY)
        String communeName = safe(acte.getCommune());
        if (!communeName.isEmpty()) {
            return communeRepository.findByNom(communeName)
                    .map(c -> c.getCode().substring(0, 3))
                    .orElse("000");
        }
        return "000";
    }

    private String extractCommuneDigits(ValidBirth acte) {
        // Les 2 derniers caractères du code commune (ex: CKY04 → 04)
        String communeName = safe(acte.getCommune());
        if (!communeName.isEmpty()) {
            return communeRepository.findByNom(communeName)
                    .map(c -> {
                        String code = c.getCode();
                        return code.length() >= 5 ? code.substring(3, 5) : code.substring(code.length() - 2);
                    })
                    .orElse("00");
        }
        return "00";
    }

    private String safe(String value) {
        return value != null ? value.trim() : "";
    }
}
