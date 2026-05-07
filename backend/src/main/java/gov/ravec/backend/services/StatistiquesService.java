package gov.ravec.backend.services;

import gov.ravec.backend.dto.CommuneStatDTO;
import gov.ravec.backend.dto.MoisStatDTO;
import gov.ravec.backend.dto.StatistiquesDTO;
import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.ActeDecesRepository;
import gov.ravec.backend.repositories.ActeNaissanceRepository;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.NiveauAdministratif;
import gov.ravec.backend.utils.ValidationStatut;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StatistiquesService {

    private static final String[] MOIS_LABELS = {
        "", "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
        "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"
    };

    private final ActeNaissanceRepository naissanceRepo;
    private final ActeDecesRepository     decesRepo;
    private final UserRepository          userRepo;

    @Transactional(readOnly = true)
    public StatistiquesDTO getDashboard(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // ── Portée territoriale selon le niveau ───────────────────────────────
        NiveauAdministratif niveau = user.getRole().getNiveauAdministratif();
        String regionCode  = null;
        String prefCode    = null;
        String comCode     = null;

        switch (niveau) {
            case REGIONAL    -> regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
            case PREFECTORAL -> { regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
                                  prefCode   = user.getPrefecture() != null ? user.getPrefecture().getCode() : null; }
            case COMMUNAL    -> { regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
                                  prefCode   = user.getPrefecture() != null ? user.getPrefecture().getCode() : null;
                                  comCode    = user.getCommune()    != null ? user.getCommune().getCode()    : null; }
            default          -> { /* CENTRAL : pas de filtre */ }
        }

        // ── Stats par commune (naissances + décès fusionnées) ─────────────────
        CommuneStatsResult cr = buildCommuneStats(regionCode, prefCode, comCode);

        // ── Évolution mensuelle (12 derniers mois) ────────────────────────────
        Instant dateDebut = ZonedDateTime.now().minusMonths(12).toInstant();
        List<MoisStatDTO> parMois = buildMonthlyStats(dateDebut, regionCode, prefCode, comCode);

        // ── Totaux globaux ─────────────────────────────────────────────────────
        long totalNaissance = cr.parCommune().stream().mapToLong(CommuneStatDTO::getNaissance).sum();
        long totalDeces     = cr.parCommune().stream().mapToLong(CommuneStatDTO::getDeces).sum();
        long totalActes     = totalNaissance + totalDeces;
        long totalHommes    = cr.naissanceHommes() + cr.decesHommes();
        long totalFemmes    = cr.naissanceFemmes() + cr.decesFemmes();

        // ── Statuts (naissances + décès) ──────────────────────────────────────
        long valides    = naissanceRepo.countByStatut(ValidationStatut.VALIDE,     regionCode, prefCode, comCode)
                        + decesRepo.countByStatut(ValidationStatut.VALIDE,         regionCode, prefCode, comCode);
        long enAttente  = naissanceRepo.countByStatut(ValidationStatut.EN_ATTENTE, regionCode, prefCode, comCode)
                        + decesRepo.countByStatut(ValidationStatut.EN_ATTENTE,     regionCode, prefCode, comCode);
        long rejetes    = naissanceRepo.countByStatut(ValidationStatut.REJETE,     regionCode, prefCode, comCode)
                        + decesRepo.countByStatut(ValidationStatut.REJETE,         regionCode, prefCode, comCode);

        return StatistiquesDTO.builder()
                .totalActes(totalActes)
                .totalNaissance(totalNaissance)
                .totalDeces(totalDeces)
                .totalHommes(totalHommes)
                .totalFemmes(totalFemmes)
                .totalValides(valides)
                .totalEnAttente(enAttente)
                .totalRejetes(rejetes)
                .naissanceHommes(cr.naissanceHommes())
                .naissanceFemmes(cr.naissanceFemmes())
                .decesHommes(cr.decesHommes())
                .decesFemmes(cr.decesFemmes())
                .parCommune(cr.parCommune())
                .parMois(parMois)
                .build();
    }

    @Transactional(readOnly = true)
    public StatistiquesDTO getRapport(String username, Instant dateDebut, Instant dateFin) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        NiveauAdministratif niveau = user.getRole().getNiveauAdministratif();
        String regionCode  = null;
        String prefCode    = null;
        String comCode     = null;

        switch (niveau) {
            case REGIONAL    -> regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
            case PREFECTORAL -> { regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
                                  prefCode   = user.getPrefecture() != null ? user.getPrefecture().getCode() : null; }
            case COMMUNAL    -> { regionCode = user.getRegion()    != null ? user.getRegion().getCode()    : null;
                                  prefCode   = user.getPrefecture() != null ? user.getPrefecture().getCode() : null;
                                  comCode    = user.getCommune()    != null ? user.getCommune().getCode()    : null; }
            default          -> { /* CENTRAL */ }
        }

        CommuneStatsResult cr2 = buildCommuneStatsPeriode(dateDebut, dateFin, regionCode, prefCode, comCode);
        List<MoisStatDTO>  parMois = buildMonthlyStatsRapport(dateDebut, dateFin, regionCode, prefCode, comCode);

        long totalNaissance = cr2.parCommune().stream().mapToLong(CommuneStatDTO::getNaissance).sum();
        long totalDeces     = cr2.parCommune().stream().mapToLong(CommuneStatDTO::getDeces).sum();
        long totalActes     = totalNaissance + totalDeces;
        long totalHommes    = cr2.naissanceHommes() + cr2.decesHommes();
        long totalFemmes    = cr2.naissanceFemmes() + cr2.decesFemmes();

        long valides   = naissanceRepo.countByStatutPeriode(ValidationStatut.VALIDE,     dateDebut, dateFin, regionCode, prefCode, comCode)
                       + decesRepo.countByStatutPeriode(ValidationStatut.VALIDE,          dateDebut, dateFin, regionCode, prefCode, comCode);
        long enAttente = naissanceRepo.countByStatutPeriode(ValidationStatut.EN_ATTENTE, dateDebut, dateFin, regionCode, prefCode, comCode)
                       + decesRepo.countByStatutPeriode(ValidationStatut.EN_ATTENTE,     dateDebut, dateFin, regionCode, prefCode, comCode);
        long rejetes   = naissanceRepo.countByStatutPeriode(ValidationStatut.REJETE,     dateDebut, dateFin, regionCode, prefCode, comCode)
                       + decesRepo.countByStatutPeriode(ValidationStatut.REJETE,         dateDebut, dateFin, regionCode, prefCode, comCode);

        return StatistiquesDTO.builder()
                .totalActes(totalActes)
                .totalNaissance(totalNaissance)
                .totalDeces(totalDeces)
                .totalHommes(totalHommes)
                .totalFemmes(totalFemmes)
                .totalValides(valides)
                .totalEnAttente(enAttente)
                .totalRejetes(rejetes)
                .naissanceHommes(cr2.naissanceHommes())
                .naissanceFemmes(cr2.naissanceFemmes())
                .decesHommes(cr2.decesHommes())
                .decesFemmes(cr2.decesFemmes())
                .parCommune(cr2.parCommune())
                .parMois(parMois)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVÉ
    // ─────────────────────────────────────────────────────────────────────────

    private record CommuneStatsResult(
        List<CommuneStatDTO> parCommune,
        long naissanceHommes, long naissanceFemmes,
        long decesHommes, long decesFemmes) {}

    private CommuneStatsResult buildCommuneStats(String regionCode, String prefCode, String comCode) {
        Map<String, CommuneStatDTO> map = new LinkedHashMap<>();
        long naissH = 0, naissF = 0;

        for (Object[] row : naissanceRepo.statsByCommune(regionCode, prefCode, comCode)) {
            String code   = (String) row[0];
            String nom    = (String) row[1];
            String pref   = (String) row[2];
            long   total  = ((Number) row[3]).longValue();
            long   hommes = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            long   femmes = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            naissH += hommes;
            naissF += femmes;
            map.put(code, CommuneStatDTO.builder()
                    .codeCommune(code).nomCommune(nom).codePrefecture(pref)
                    .naissance(total).hommes(hommes).femmes(femmes).build());
        }

        long decesH = 0, decesF = 0;
        for (Object[] row : decesRepo.statsByCommune(regionCode, prefCode, comCode)) {
            String code   = (String) row[0];
            String nom    = (String) row[1];
            String pref   = (String) row[2];
            long   total  = ((Number) row[3]).longValue();
            long   hommes = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            long   femmes = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            decesH += hommes;
            decesF += femmes;
            map.merge(code,
                CommuneStatDTO.builder()
                    .codeCommune(code).nomCommune(nom).codePrefecture(pref)
                    .deces(total).hommes(hommes).femmes(femmes).build(),
                (existing, incoming) -> {
                    existing.setDeces(incoming.getDeces());
                    existing.setHommes(existing.getHommes() + incoming.getHommes());
                    existing.setFemmes(existing.getFemmes() + incoming.getFemmes());
                    return existing;
                }
            );
        }

        map.values().forEach(c -> c.setActes(c.getNaissance() + c.getDeces()));
        List<CommuneStatDTO> result = new ArrayList<>(map.values());
        result.sort(Comparator.comparingLong(CommuneStatDTO::getActes).reversed());
        return new CommuneStatsResult(result, naissH, naissF, decesH, decesF);
    }

    private List<MoisStatDTO> buildMonthlyStats(Instant dateDebut, String regionCode, String prefCode, String comCode) {
        Map<String, long[]> map = new LinkedHashMap<>();

        for (Object[] row : naissanceRepo.monthlyStats(dateDebut, regionCode, prefCode, comCode)) {
            int  annee = ((Number) row[0]).intValue();
            int  mois  = ((Number) row[1]).intValue();
            long total = ((Number) row[2]).longValue();
            String key = annee + "-" + mois;
            map.computeIfAbsent(key, k -> new long[]{annee, mois, 0})[2] += total;
        }

        for (Object[] row : decesRepo.monthlyStats(dateDebut, regionCode, prefCode, comCode)) {
            int  annee = ((Number) row[0]).intValue();
            int  mois  = ((Number) row[1]).intValue();
            long total = ((Number) row[2]).longValue();
            String key = annee + "-" + mois;
            map.computeIfAbsent(key, k -> new long[]{annee, mois, 0})[2] += total;
        }

        ZonedDateTime now = ZonedDateTime.now();
        for (int i = 11; i >= 0; i--) {
            ZonedDateTime m = now.minusMonths(i);
            String key = m.getYear() + "-" + m.getMonthValue();
            map.putIfAbsent(key, new long[]{m.getYear(), m.getMonthValue(), 0});
        }

        return map.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    long[] v = e.getValue();
                    int annee = (int) v[0];
                    int mois  = (int) v[1];
                    String label = MOIS_LABELS[mois] + " " + String.valueOf(annee).substring(2);
                    return MoisStatDTO.builder().annee(annee).mois(mois).label(label).actes(v[2]).build();
                })
                .toList();
    }

    private CommuneStatsResult buildCommuneStatsPeriode(Instant dateDebut, Instant dateFin,
                                                         String regionCode, String prefCode, String comCode) {
        Map<String, CommuneStatDTO> map = new LinkedHashMap<>();
        long naissH = 0, naissF = 0;

        for (Object[] row : naissanceRepo.statsByCommunePeriode(dateDebut, dateFin, regionCode, prefCode, comCode)) {
            String code   = (String) row[0];
            String nom    = (String) row[1];
            String pref   = (String) row[2];
            long   total  = ((Number) row[3]).longValue();
            long   hommes = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            long   femmes = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            naissH += hommes;
            naissF += femmes;
            map.put(code, CommuneStatDTO.builder()
                    .codeCommune(code).nomCommune(nom).codePrefecture(pref)
                    .naissance(total).hommes(hommes).femmes(femmes).build());
        }

        long decesH = 0, decesF = 0;
        for (Object[] row : decesRepo.statsByCommunePeriode(dateDebut, dateFin, regionCode, prefCode, comCode)) {
            String code   = (String) row[0];
            String nom    = (String) row[1];
            String pref   = (String) row[2];
            long   total  = ((Number) row[3]).longValue();
            long   hommes = row[4] != null ? ((Number) row[4]).longValue() : 0L;
            long   femmes = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            decesH += hommes;
            decesF += femmes;
            map.merge(code,
                CommuneStatDTO.builder()
                    .codeCommune(code).nomCommune(nom).codePrefecture(pref)
                    .deces(total).hommes(hommes).femmes(femmes).build(),
                (existing, incoming) -> {
                    existing.setDeces(incoming.getDeces());
                    existing.setHommes(existing.getHommes() + incoming.getHommes());
                    existing.setFemmes(existing.getFemmes() + incoming.getFemmes());
                    return existing;
                }
            );
        }

        map.values().forEach(c -> c.setActes(c.getNaissance() + c.getDeces()));
        List<CommuneStatDTO> result = new ArrayList<>(map.values());
        result.sort(Comparator.comparingLong(CommuneStatDTO::getActes).reversed());
        return new CommuneStatsResult(result, naissH, naissF, decesH, decesF);
    }

    private List<MoisStatDTO> buildMonthlyStatsRapport(Instant dateDebut, Instant dateFin,
                                                        String regionCode, String prefCode, String comCode) {
        // [annee, mois, naissances, deces]
        Map<String, long[]> map = new LinkedHashMap<>();

        for (Object[] row : naissanceRepo.monthlyStatsPeriode(dateDebut, dateFin, regionCode, prefCode, comCode)) {
            int annee = ((Number) row[0]).intValue();
            int mois  = ((Number) row[1]).intValue();
            long total = ((Number) row[2]).longValue();
            String key = annee + "-" + String.format("%02d", mois);
            map.computeIfAbsent(key, k -> new long[]{annee, mois, 0, 0})[2] += total;
        }

        for (Object[] row : decesRepo.monthlyStatsPeriode(dateDebut, dateFin, regionCode, prefCode, comCode)) {
            int annee = ((Number) row[0]).intValue();
            int mois  = ((Number) row[1]).intValue();
            long total = ((Number) row[2]).longValue();
            String key = annee + "-" + String.format("%02d", mois);
            map.computeIfAbsent(key, k -> new long[]{annee, mois, 0, 0})[3] += total;
        }

        // Remplir tous les mois de la plage demandée
        ZonedDateTime cursor = dateDebut.atZone(ZoneId.systemDefault()).withDayOfMonth(1);
        ZonedDateTime end    = dateFin.atZone(ZoneId.systemDefault());
        while (!cursor.isAfter(end)) {
            String key = cursor.getYear() + "-" + String.format("%02d", cursor.getMonthValue());
            map.putIfAbsent(key, new long[]{cursor.getYear(), cursor.getMonthValue(), 0, 0});
            cursor = cursor.plusMonths(1);
        }

        return map.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    long[] v      = e.getValue();
                    int annee     = (int) v[0];
                    int mois      = (int) v[1];
                    long naiss    = v[2];
                    long deces    = v[3];
                    String label  = MOIS_LABELS[mois] + " " + String.valueOf(annee).substring(2);
                    return MoisStatDTO.builder()
                            .annee(annee).mois(mois).label(label)
                            .actes(naiss + deces).naissances(naiss).deces(deces)
                            .build();
                })
                .toList();
    }
}
