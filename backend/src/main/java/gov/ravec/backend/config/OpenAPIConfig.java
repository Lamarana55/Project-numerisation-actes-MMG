package gov.ravec.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {

    @Value("${ravec.domaine.url:http://localhost:8083}")
    private String serverUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        // Configuration du contact
        Contact contact = new Contact()
                .email("devlogiciel@ravec.gov.gn")
                .name("MAMADOU LAMARANA DIALLO")
                .url("https://www.ravec.gov.gn");

        // Configuration de la licence
        License license = new License()
                .name("MIT License")
                .url("https://opensource.org/licenses/MIT");

        // Configuration des serveurs
        Server localServer = new Server()
                .url("http://localhost:8083")
                .description("Serveur de développement local");

        Server prodServer = new Server()
                .url(serverUrl)
                .description("Serveur de production");

        return new OpenAPI()
                .servers(List.of(localServer, prodServer))
                .info(new Info()
                        .title("RAVEC Backend Simulation API")
                        .description("API pour la simulation du NPI - RAVEC Guinée")
                        .version("v1.0.0")
                        .contact(contact)
                        .license(license)
                );
    }
}