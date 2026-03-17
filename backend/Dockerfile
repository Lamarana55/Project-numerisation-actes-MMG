# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copier les fichiers de configuration Maven
COPY pom.xml .
COPY src ./src

# Build l'application (skip tests pour accélérer le build)
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN groupadd -r spring && useradd -r -g spring spring

# Créer le dossier logs et donner les permissions à l'utilisateur spring
RUN mkdir -p /app/logs && chown -R spring:spring /app/logs

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/*.jar app.jar

# Changer le propriétaire du JAR
RUN chown spring:spring app.jar

# Changer vers l'utilisateur spring
USER spring:spring

# Exposer le port
EXPOSE 8091

# Variables d'environnement par défaut (peuvent être overridées)
ENV JAVA_OPTS="-Xms512m -Xmx1024m"

# Point d'entrée
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]