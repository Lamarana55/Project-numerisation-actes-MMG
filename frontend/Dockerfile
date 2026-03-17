# Image Node.js pour le développement local
FROM node:18-alpine
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec --legacy-peer-deps pour résoudre les conflits
RUN npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Exposer le port Angular
EXPOSE 4200

# Démarrer Angular en mode dev avec host 0.0.0.0 pour être accessible depuis Docker
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
