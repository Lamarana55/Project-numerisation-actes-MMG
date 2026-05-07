#!/bin/bash
# ============================================================
# Script de gestion des containers — Serveur PN-RAVEC
#
# Usage :
#   ./server.sh start                → démarre tous les services
#   ./server.sh stop                 → arrête tous les services
#   ./server.sh restart              → redémarre tous les services
#   ./server.sh restart backend      → redémarre seulement le backend
#   ./server.sh restart frontend     → redémarre seulement le frontend
#   ./server.sh update               → pull + redémarre tout
#   ./server.sh update backend       → pull + redémarre backend seulement
#   ./server.sh update frontend      → pull + redémarre frontend seulement
#   ./server.sh status               → état des containers
#   ./server.sh logs                 → logs de tous les services
#   ./server.sh logs backend         → logs backend seulement
#   ./server.sh logs frontend        → logs frontend seulement
#   ./server.sh logs postgres        → logs base de données
#   ./server.sh clean                → arrête et supprime tout (⚠️ données conservées)
# ============================================================

set -e

# ── Configuration ─────────────────────────────────────────────
SERVER_DIR="/opt/pn-ravec"
COMPOSE_FILE="$SERVER_DIR/docker-compose.server.yml"
ENV_FILE="$SERVER_DIR/.env.server"
URL="https://validation.ravec.gov.gn:8050"

# ── Couleurs ─────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${GREEN}[✔]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✘]${NC} $1"; exit 1; }
step()  { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }
info()  { echo -e "${BLUE}[i]${NC} $1"; }

# ── Raccourci compose ─────────────────────────────────────────
compose() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" "$@"
}

# ── Commande et cible ──────────────────────────────────────────
CMD="${1:-status}"
TARGET="${2:-}"   # backend | frontend | postgres | (vide = tous)

# ── Actions ───────────────────────────────────────────────────
case "$CMD" in

  start)
    step "DÉMARRAGE${TARGET:+ ($TARGET)}"
    compose up -d $TARGET
    log "Services démarrés"
    echo ""
    compose ps
    echo ""
    info "Application : $URL"
    ;;

  stop)
    step "ARRÊT${TARGET:+ ($TARGET)}"
    compose stop $TARGET
    log "Services arrêtés"
    ;;

  restart)
    step "REDÉMARRAGE${TARGET:+ ($TARGET)}"
    compose restart $TARGET
    log "Services redémarrés"
    echo ""
    compose ps
    ;;

  update)
    step "MISE À JOUR${TARGET:+ ($TARGET)} — Pull + Redémarrage"
    warn "Pull des nouvelles images depuis GHCR..."
    compose pull $TARGET
    log "Images récupérées"

    step "REDÉMARRAGE${TARGET:+ ($TARGET)}"
    compose up -d $TARGET
    log "Services mis à jour"
    echo ""
    compose ps
    echo ""
    info "Application : $URL"
    ;;

  status)
    step "ÉTAT DES CONTAINERS"
    compose ps
    echo ""
    info "Health check backend :"
    curl -s http://localhost:8082/api/v1/actuator/health | python3 -m json.tool 2>/dev/null || echo "Backend non joignable"
    echo ""
    info "Health check frontend :"
    curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8082/health || echo "Frontend non joignable"
    ;;

  logs)
    SERVICE="${2:-}"
    case "$SERVICE" in
      backend)  compose logs -f --tail=100 backend ;;
      frontend) compose logs -f --tail=100 frontend ;;
      postgres) compose logs -f --tail=100 postgres ;;
      "")       compose logs -f --tail=50 ;;
      *)        error "Service inconnu : '$SERVICE'. Utiliser : backend | frontend | postgres" ;;
    esac
    ;;

  clean)
    warn "Cette commande arrête et supprime les containers (les données PostgreSQL sont conservées)."
    read -rp "Confirmer ? (oui/non) : " confirm
    if [[ "$confirm" == "oui" ]]; then
      step "SUPPRESSION DES CONTAINERS"
      compose down
      log "Containers supprimés (volumes de données conservés)"
    else
      info "Annulé."
    fi
    ;;

  *)
    echo ""
    echo "Usage : ./server.sh <commande> [service]"
    echo ""
    echo "Commandes :"
    echo "  start   [service]   Démarrer les services"
    echo "  stop    [service]   Arrêter les services"
    echo "  restart [service]   Redémarrer les services"
    echo "  update  [service]   Pull nouvelles images + redémarrer"
    echo "  status              État et health checks"
    echo "  logs    [service]   Afficher les logs en temps réel"
    echo "  clean               Supprimer les containers"
    echo ""
    echo "Services : backend | frontend | postgres"
    echo ""
    ;;
esac
