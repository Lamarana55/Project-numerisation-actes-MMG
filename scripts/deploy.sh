#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Script de déploiement manuel (rollback ou re-déploiement)
# =============================================================================
# Usage (sur le serveur) :
#   bash /opt/pn-ravec/scripts/deploy.sh [TAG]
#   bash /opt/pn-ravec/scripts/deploy.sh sha-abc1234   # version spécifique
#   bash /opt/pn-ravec/scripts/deploy.sh               # latest
# =============================================================================
set -euo pipefail

APP_DIR="/opt/pn-ravec"
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
ENV_FILE="$APP_DIR/.env"
REGISTRY="ghcr.io"
OWNER="lamarana55"
TAG="${1:-latest}"

echo "[deploy] Tag : $TAG"
echo "[deploy] Répertoire : $APP_DIR"

# ── Vérifications ──────────────────────────────────────────────────────────
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERREUR : $COMPOSE_FILE introuvable." >&2
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "ERREUR : $ENV_FILE introuvable. Créez-le à partir du template." >&2
    exit 1
fi

cd "$APP_DIR"

# ── Mettre à jour les tags dans .env ──────────────────────────────────────
sed -i "s|^BACKEND_IMAGE=.*|BACKEND_IMAGE=$REGISTRY/$OWNER/ravec-backend:$TAG|" "$ENV_FILE"
sed -i "s|^FRONTEND_IMAGE=.*|FRONTEND_IMAGE=$REGISTRY/$OWNER/ravec-frontend:$TAG|" "$ENV_FILE"

echo "[deploy] Images cibles :"
grep -E "^(BACKEND|FRONTEND)_IMAGE" "$ENV_FILE"

# ── Pull des nouvelles images ──────────────────────────────────────────────
echo "[deploy] Pull des images..."
docker compose -f "$COMPOSE_FILE" pull

# ── Sauvegarde DB avant déploiement ───────────────────────────────────────
BACKUP_DIR="$APP_DIR/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/db_$(date +%Y%m%d_%H%M%S).sql.gz"

if docker ps --format '{{.Names}}' | grep -q "ravec-postgres"; then
    echo "[deploy] Sauvegarde de la base de données → $BACKUP_FILE"
    source "$ENV_FILE"
    docker exec ravec-postgres pg_dump -U "$DATABASE_USER" "$DATABASE" \
        | gzip > "$BACKUP_FILE"
    echo "[deploy] Sauvegarde OK : $BACKUP_FILE"
    # Garder seulement les 7 dernières sauvegardes
    ls -t "$BACKUP_DIR"/db_*.sql.gz | tail -n +8 | xargs -r rm
else
    echo "[deploy] Postgres non démarré — pas de sauvegarde."
fi

# ── Redémarrage des services ───────────────────────────────────────────────
echo "[deploy] Redémarrage des conteneurs..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

# ── Nettoyage des images obsolètes ────────────────────────────────────────
docker image prune -f

# ── Vérification de santé ─────────────────────────────────────────────────
echo "[deploy] Vérification de santé du backend..."
for i in $(seq 1 12); do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        http://localhost:8091/api/v1/actuator/health 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        echo "[deploy] Backend OK (HTTP 200) — déploiement réussi !"
        docker compose -f "$COMPOSE_FILE" ps
        exit 0
    fi
    echo "[deploy] Tentative $i/12 — HTTP $STATUS, attente 10s..."
    sleep 10
done

echo "[deploy] ERREUR : health check échoué après 2 minutes." >&2
echo "[deploy] Logs du backend :"
docker compose -f "$COMPOSE_FILE" logs --tail=50 backend
exit 1
