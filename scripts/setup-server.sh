#!/usr/bin/env bash
# =============================================================================
# setup-server.sh — Configuration initiale du serveur Ubuntu pour PN-RAVEC
# =============================================================================
# Usage : sudo bash setup-server.sh
# À exécuter UNE SEULE FOIS sur un Ubuntu 22.04 / 24.04 fraîchement installé.
# =============================================================================
set -euo pipefail

DEPLOY_USER="${DEPLOY_USER:-deploy}"
APP_DIR="/opt/pn-ravec"
DOMAIN="${DOMAIN:-votre-domaine.com}"

echo "=========================================="
echo "  PN-RAVEC — Configuration serveur Ubuntu"
echo "=========================================="

# ── 1. Mise à jour système ─────────────────────────────────────────────────
echo "[1/9] Mise à jour du système..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git unzip ufw fail2ban certbot python3-certbot-nginx

# ── 2. Créer l'utilisateur de déploiement ─────────────────────────────────
echo "[2/9] Création de l'utilisateur de déploiement '$DEPLOY_USER'..."
if ! id "$DEPLOY_USER" &>/dev/null; then
    useradd -m -s /bin/bash "$DEPLOY_USER"
    usermod -aG sudo "$DEPLOY_USER"
    # Permettre sudo sans mot de passe (pour les scripts CI)
    echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/docker compose, /usr/local/bin/docker-compose" \
        >> /etc/sudoers.d/deploy-nopasswd
    chmod 440 /etc/sudoers.d/deploy-nopasswd
fi

# Créer le dossier .ssh et copier la clé publique
mkdir -p "/home/$DEPLOY_USER/.ssh"
chmod 700 "/home/$DEPLOY_USER/.ssh"
touch "/home/$DEPLOY_USER/.ssh/authorized_keys"
chmod 600 "/home/$DEPLOY_USER/.ssh/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"

echo ""
echo "  >>> Collez maintenant votre clé SSH publique dans :"
echo "      /home/$DEPLOY_USER/.ssh/authorized_keys"
echo "  Appuyez sur [Entrée] pour continuer..."
read -r

# ── 3. Installer Docker ────────────────────────────────────────────────────
echo "[3/9] Installation de Docker..."
if ! command -v docker &>/dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

usermod -aG docker "$DEPLOY_USER"
echo "Docker $(docker --version) installé."

# ── 4. Installer Docker Compose v2 ────────────────────────────────────────
echo "[4/9] Installation de Docker Compose v2..."
if ! docker compose version &>/dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest \
        | grep '"tag_name"' | cut -d'"' -f4)
    curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi
echo "Docker Compose $(docker compose version) installé."

# ── 5. Créer le répertoire de l'application ────────────────────────────────
echo "[5/9] Création du répertoire $APP_DIR..."
mkdir -p "$APP_DIR/nginx"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR"

# ── 6. Créer le fichier .env de production ─────────────────────────────────
echo "[6/9] Création du fichier .env (à compléter)..."
cat > "$APP_DIR/.env" << 'EOF'
# ============================================================
# Variables d'environnement — Production PN-RAVEC
# IMPORTANT : Ne jamais committer ce fichier dans Git !
# ============================================================

# Base de données
DATABASE=ravec_db
DATABASE_USER=ravec_user
DATABASE_PASSWORD=CHANGER_MOT_DE_PASSE_DB

# JWT
JWT_SECURITY=CHANGER_SECRET_JWT_MIN_32_CARACTERES

# Application
DDL_AUTO=update
FRONT_URL=https://votre-domaine.com

# Email
SPRING_MAIL_USERNAME=votre@email.com
SPRING_MAIL_PASSWORD=CHANGER_MOT_DE_PASSE_EMAIL

# PgAdmin (optionnel)
PGADMIN_EMAIL=admin@ravec.gov.gn
PGADMIN_PASSWORD=CHANGER_MOT_DE_PASSE_PGADMIN

# Images Docker (injectées par le pipeline CI/CD)
BACKEND_IMAGE=ghcr.io/lamarana55/ravec-backend:latest
FRONTEND_IMAGE=ghcr.io/lamarana55/ravec-frontend:latest
EOF

chown "$DEPLOY_USER:$DEPLOY_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"
echo "  >>> Éditez $APP_DIR/.env avec vos vraies valeurs !"

# ── 7. Installer et configurer Nginx ──────────────────────────────────────
echo "[7/9] Installation de Nginx..."
apt-get install -y nginx
systemctl enable nginx

# Copier la config (le fichier nginx.conf doit avoir été uploadé)
if [ -f "$APP_DIR/nginx/nginx.conf" ]; then
    # Remplacer le placeholder domaine
    sed -i "s/votre-domaine.com/$DOMAIN/g" "$APP_DIR/nginx/nginx.conf"
    ln -sf "$APP_DIR/nginx/nginx.conf" /etc/nginx/sites-available/pn-ravec
    ln -sf /etc/nginx/sites-available/pn-ravec /etc/nginx/sites-enabled/pn-ravec
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    echo "  Nginx configuré pour $DOMAIN"
fi

# ── 8. SSL avec Certbot ────────────────────────────────────────────────────
echo "[8/9] Configuration SSL (Let's Encrypt)..."
echo "  Pour obtenir un certificat SSL, exécutez :"
echo "  certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m admin@$DOMAIN"
echo ""
echo "  Renouvellement automatique (déjà configuré par certbot) :"
echo "  systemctl status certbot.timer"

# ── 9. Pare-feu UFW ────────────────────────────────────────────────────────
echo "[9/9] Configuration du pare-feu UFW..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable
ufw status

# ── Fail2ban (protection brute-force) ─────────────────────────────────────
systemctl enable --now fail2ban

echo ""
echo "=========================================="
echo "  Configuration terminée !"
echo ""
echo "  Prochaines étapes :"
echo "  1. Éditer $APP_DIR/.env avec les vraies valeurs"
echo "  2. Obtenir le certificat SSL (commande ci-dessus)"
echo "  3. Configurer les GitHub Secrets (voir CICD_SECRETS.md)"
echo "  4. Pusher sur main pour déclencher le premier déploiement"
echo "=========================================="
