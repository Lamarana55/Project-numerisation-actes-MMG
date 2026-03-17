package gov.ravec.backend.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

public class MappingDtoUtil {

    private static final Logger logger = LoggerFactory.getLogger(MappingDtoUtil.class);

    @Value("${ravec.encryption.enabled}")
    private static boolean encryptionEnabled;

    //Conversion du String en int
    public static int parserInt(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            logger.error("Erreur lors de la conversion en entier: " + value);
            return 0;
        }
    }

    //Conversion de la date
    public static String parseDateToFormattedInstant(String dateStr) {
        try {
            DateTimeFormatter inputFormatter = DateTimeFormatter.ofPattern("d M uuuu", Locale.ENGLISH);
            LocalDate date = LocalDate.parse(dateStr, inputFormatter);
            // Conversion de LocalDate en Instant (UTC)
            Instant instant = date.atStartOfDay(ZoneOffset.UTC).toInstant();
            // Utilisation du format ISO 8601
            DateTimeFormatter isoFormatter = DateTimeFormatter.ISO_INSTANT;

            return isoFormatter.format(instant);
        } catch (DateTimeParseException e) {
            logger.error("Erreur de formatage de la date : " + dateStr);
            logger.error("Message d'erreur : " + e.getMessage());
            return null;
        } catch (Exception e) {
            logger.error("Erreur inattendue lors du formatage de la date : " + dateStr);
            logger.error("Message d'erreur : " + e.getMessage());
            return null;
        }
    }

    public static String convertGender(String gender) {
        if (gender == null || gender.isBlank()) {
            logger.warn("La chaîne de genre est null ou vide : {}", gender);
            return "UNKNOWN";
        }
        String normalizedGender = gender.trim().toLowerCase();

        if (normalizedGender.contains("masculin")) {
            return "MALE";
        } else if (normalizedGender.contains("feminin") || normalizedGender.contains("féminin")) {
            return "FEMALE";
        } else {
            logger.warn("Genre non reconnu : {}", gender);
            return "UNKNOWN";
        }
    }


    private static String determineAttachmentType(String extension) {
        return switch (extension) {
            case "PDF" -> "1";
            case "JPEG", "JPG" -> "2";
            case "PNG" -> "3";
            default -> "unknown";
        };
    }


}
