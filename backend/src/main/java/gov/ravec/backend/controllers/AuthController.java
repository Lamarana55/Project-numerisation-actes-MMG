package gov.ravec.backend.controllers;

import gov.ravec.backend.entities.User;
import gov.ravec.backend.repositories.UserRepository;
import gov.ravec.backend.security.JwtProvider;
import gov.ravec.backend.security.JwtResponse;
import gov.ravec.backend.services.SendMailService;
import gov.ravec.backend.services.UserConnected;
import gov.ravec.backend.utils.Delete;
import gov.ravec.backend.utils.LoginInfo;
import gov.ravec.backend.utils.Response;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentification", description = "Gestion de l'authentification et réinitialisation des mots de passe")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserConnected userConnected;
    @Autowired
    private SendMailService sendMailService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    @Value("${ravec.app.frontend.url}")
    private String link;

    @PostMapping("/signin")
    @Operation(summary = "Connexion utilisateur", description = "Authentifié un utilisateur avec son nom d'utilisateur et mot de passe, retourne un token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion réussie", content = @Content(schema = @Schema(implementation = JwtResponse.class))),
            @ApiResponse(responseCode = "401", description = "Mot de passe incorrect"),
            @ApiResponse(responseCode = "403", description = "Utilisateur non trouvé dans la base de données")
    })
    public ResponseEntity<?> login(@RequestBody LoginInfo loginInfo) {
        Optional<User> user = userRepository.findByUsernameAndIsDelete(loginInfo.getUsername(), Delete.No);
        if (user.isEmpty()) {
            logger.warn("User {} : not found ", loginInfo.getUsername());
            return new ResponseEntity<>(
                    new Response<String>("User Not found ", "failed",
                            "Le compte " + loginInfo.getUsername()
                                    + " n'existe pas dans la base. Veuillez contacter l'administrateur."),
                    HttpStatus.FORBIDDEN);
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginInfo.getUsername(), loginInfo.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtProvider.generateJwtToken(authentication);
            gov.ravec.backend.utils.UserPrinciple userPrincipal =
                    (gov.ravec.backend.utils.UserPrinciple) authentication.getPrincipal();
            String name = user.get().getPrenom() + "  " + user.get().getNom();

            JwtResponse response = JwtResponse.builder()
                    .accessToken(jwt)
                    .name(name)
                    .username(loginInfo.getUsername())
                    .tokenType("Bearer")
                    .authorities(userPrincipal.getAuthorities())
                    .profil(userPrincipal.getProfil())
                    .profilLibelle(userPrincipal.getProfilLibelle())
                    .niveauAdministratif(userPrincipal.getNiveauAdministratif())
                    .regionId(userPrincipal.getRegionId())
                    .regionNom(userPrincipal.getRegionNom())
                    .prefectureId(userPrincipal.getPrefectureId())
                    .prefectureNom(userPrincipal.getPrefectureNom())
                    .communeId(userPrincipal.getCommuneId())
                    .communeNom(userPrincipal.getCommuneNom())
                    .build();

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(
                    new Response("Incorrect Password", "failed", "Le mot de passe est incorrect."),
                    HttpStatus.UNAUTHORIZED);
        }
    }

    // @ApiOperation(value = "Methode qui envoi l'email pour la renitialisation du
    // password")
    @PostMapping("/send-email")
    @Operation(summary = "Réinitialisation du mot de passe", description = "Envoie un email avec un lien de réinitialisation du mot de passe à l'adresse email spécifiée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email envoyé avec succès"),
            @ApiResponse(responseCode = "404", description = "Email non trouvé dans la base de données")
    })
    public ResponseEntity<Object> send(@RequestBody Map<String, String> body) throws MessagingException {
        String email = body.get("email");
        Optional<User> user = userRepository.findByEmail(email.trim());

        if (user.isPresent()) {
            String resetPasswordToken = userConnected.getRandomString(25);
            String lien = link + "/login/update-password/" + resetPasswordToken;

            User currentUser = user.get();
            currentUser.setResetPasswordToken(resetPasswordToken);
            currentUser.setUpdatedAt(Instant.now().plus(30, ChronoUnit.MINUTES));

            User userUpdate = userRepository.save(currentUser);

            sendMailService.sendEmailHtmlReset(
                    userUpdate.getNom() + " " + userUpdate.getPrenom(),
                    userUpdate.getEmail(),
                    lien);

            return ResponseEntity.ok(new Response<>(true, "mail envoyer "));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response<>(false, "l'email n'existe pas dans la base "));
        }
    }
}
