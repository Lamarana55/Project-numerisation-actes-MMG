package gov.ravec.backend.services;

import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.PermissionRepository;
import gov.ravec.backend.repositories.RoleRepository;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.security.JwtProvider;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.Statut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class UserConnected {

    private static final Logger logger = LoggerFactory.getLogger(UserConnected.class);
 
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;


    @Autowired
    private JwtProvider jwtProvider;
    private static final String ALPHANUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final String UPPERCASE_NUMERIC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    private static final String NUMERIC_CHARS = "123456789";
    private static final String INSTANT_FILTER_CHARS = "-.,;:Z";
    private static final String SESSION_FILTER_CHARS = "-.,;:ZT";

    private final SecureRandom random = new SecureRandom();

    public User getUserConnected() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .filter(user -> user.getIsDelete() == Delete.No && user.getStatut() == Statut.Activated)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé ou inactif"));
    }

    public Statut updateStatut(Statut statut) {
        return statut == Statut.Activated ? Statut.Desactivated : Statut.Activated;
    }

    public Delete updateDelete(Delete isDelete) {
        return isDelete == Delete.Yes ? Delete.No : Delete.Yes;
    }

    /**
     * Récupère le nom de la commune à partir de la localité
     */
    /*public String getCommuneByLocalite(Localite localite) {
        if (localite == null || localite.getIdCommune() == null) {
            return null;
        }

        Optional<Commune> commune = communeRepository.findById(Long.parseLong(localite.getIdCommune()));
        return commune.map(Commune::getNom).orElse(null);
    }*/

    public User getUsernameFromToken(String token) {
        String username = jwtProvider.getUserNameFromJwtToken(token);
        return userRepository.findByUsername(username)
                .filter(user -> user.getIsDelete() == Delete.No && user.getStatut() == Statut.Activated)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé ou inactif"));
    }

    /**
     * Vérifie si l'utilisateur connecté a une permission donnée
     */
    public boolean getAutorisation(String myPermission) {
        User user = getUserConnected();
        return permissionRepository.findByNom(myPermission)
                .map(permission -> roleRepository.findByNomAndPermissions(user.getRole().getNom(), permission)
                        .isPresent())
                .orElse(false);
    }

    public String getRandomString(int length) {
        return generateRandomString(ALPHANUMERIC_CHARS, length);
    }

    public String getRandomPassword() {
        return generateRandomString(UPPERCASE_NUMERIC_CHARS, 6);
    }

    public String getCodeUser() {
        return generateRandomString(UPPERCASE_NUMERIC_CHARS, 5);
    }

    public long getCodeRandom() {
        return Long.parseLong(generateRandomString(NUMERIC_CHARS, 4));
    }

    public String getCodeRandom(int length) {
        return generateRandomString(NUMERIC_CHARS, length);
    }

    public String generateInstantCode() {
        return filterAndFormatInstant(Instant.now().toString(), INSTANT_FILTER_CHARS)
                .replace("T", ",");
    }

    public String getCodeCas(User user) {
        String instantCode = generateInstantCode().split(",")[1];
        return String.format("%s-%s", user.getCode(), instantCode);
    }


    /**
     * Récupère le numéro du mois actuel
     */
    public int getCurrentMonthNumber() {
        String instantStr = filterAndFormatInstant(Instant.now().toString(), ".,;:Z")
                .replace("T", ",");
        return Integer.parseInt(instantStr.split("-")[1]);
    }

    public long getCurrentYearNumber() {
        String instantStr = filterAndFormatInstant(Instant.now().toString(), ".,;:Z")
                .replace("T", ",");
        return Long.parseLong(instantStr.split("-")[0]);
    }

    private String generateRandomString(String chars, int length) {
        return IntStream.range(0, length)
                .mapToObj(i -> String.valueOf(chars.charAt(random.nextInt(chars.length()))))
                .collect(Collectors.joining());
    }

    private String filterAndFormatInstant(String instant, String filterChars) {
        return instant.chars()
                .filter(c -> filterChars.indexOf(c) == -1)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();
    }
}