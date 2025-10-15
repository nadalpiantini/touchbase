#!/bin/bash

# =================================================================
# TouchBase Deployment Script
# =================================================================
# Flujo completo y seguro de deployment a producción
# Uso: ./scripts/deploy.sh [--skip-tests] [--force]
# =================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/web"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$PROJECT_ROOT/deploy_$TIMESTAMP.log"

# Flags
SKIP_TESTS=false
FORCE_DEPLOY=false

# Procesar argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        *)
            echo -e "${RED}❌ Argumento desconocido: $1${NC}"
            echo "Uso: $0 [--skip-tests] [--force]"
            exit 1
            ;;
    esac
done

# Funciones de utilidad
log() {
    echo -e "$1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "${RED}❌ ERROR: $1${NC}"
    log "${YELLOW}📋 Ver log completo en: $LOG_FILE${NC}"
    exit 1
}

success() {
    log "${GREEN}✅ $1${NC}"
}

info() {
    log "${CYAN}ℹ️  $1${NC}"
}

warning() {
    log "${YELLOW}⚠️  $1${NC}"
}

header() {
    log "${BLUE}═══════════════════════════════════════════════════════${NC}"
    log "${BLUE}  $1${NC}"
    log "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# Verificar pre-requisitos
check_prerequisites() {
    header "🔍 Verificando Pre-requisitos"

    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error_exit "Node.js no está instalado"
    fi
    success "Node.js: $(node -v)"

    # Verificar npm
    if ! command -v npm &> /dev/null; then
        error_exit "npm no está instalado"
    fi
    success "npm: $(npm -v)"

    # Verificar Vercel CLI
    if ! command -v vercel &> /dev/null; then
        warning "Vercel CLI no está instalado. Instalando..."
        npm install -g vercel || error_exit "No se pudo instalar Vercel CLI"
    fi
    success "Vercel CLI: $(vercel --version)"

    # Verificar Git
    if ! command -v git &> /dev/null; then
        error_exit "Git no está instalado"
    fi
    success "Git: $(git --version | awk '{print $3}')"
}

# Verificar estado del repositorio
check_git_status() {
    header "📊 Verificando Estado del Repositorio"

    cd "$PROJECT_ROOT"

    # Verificar branch actual
    CURRENT_BRANCH=$(git branch --show-current)
    info "Branch actual: $CURRENT_BRANCH"

    if [[ "$CURRENT_BRANCH" != "master" && "$CURRENT_BRANCH" != "main" ]] && [[ "$FORCE_DEPLOY" != true ]]; then
        error_exit "No estás en el branch principal. Usa --force para deployar desde $CURRENT_BRANCH"
    fi

    # Verificar cambios no comiteados
    if ! git diff-index --quiet HEAD --; then
        warning "Hay cambios no comiteados"
        git status --short

        if [[ "$FORCE_DEPLOY" != true ]]; then
            read -p "¿Deseas commitear estos cambios? (s/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                read -p "Mensaje del commit: " COMMIT_MSG
                git add .
                git commit -m "$COMMIT_MSG" || error_exit "Fallo al hacer commit"
                success "Cambios comiteados"
            else
                error_exit "Deploy cancelado - hay cambios sin commitear"
            fi
        fi
    else
        success "Working tree limpio"
    fi

    # Pull últimos cambios
    info "Sincronizando con repositorio remoto..."
    git fetch origin

    # Verificar si estamos detrás del remoto
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    BASE=$(git merge-base @ @{u} 2>/dev/null || echo "")

    if [ "$LOCAL" = "$REMOTE" ]; then
        success "Branch está actualizado con el remoto"
    elif [ "$LOCAL" = "$BASE" ]; then
        warning "Branch está detrás del remoto. Haciendo pull..."
        git pull origin "$CURRENT_BRANCH" || error_exit "Fallo al hacer pull"
        success "Branch actualizado"
    elif [ "$REMOTE" = "$BASE" ]; then
        info "Branch está adelante del remoto"
    else
        error_exit "Branch ha divergido del remoto. Resuelve los conflictos primero"
    fi
}

# Instalar dependencias
install_dependencies() {
    header "📦 Instalando Dependencias"

    cd "$WEB_DIR"

    if [ -f "package-lock.json" ]; then
        info "Usando npm ci para instalación limpia..."
        npm ci || error_exit "Fallo al instalar dependencias"
    else
        info "Usando npm install..."
        npm install || error_exit "Fallo al instalar dependencias"
    fi

    success "Dependencias instaladas correctamente"
}

# Ejecutar validaciones
run_validations() {
    header "🔧 Ejecutando Validaciones"

    cd "$WEB_DIR"

    # Linting
    info "Ejecutando ESLint..."
    npm run lint -- --max-warnings=50 || {
        warning "ESLint reportó warnings/errores"
        if [[ "$FORCE_DEPLOY" != true ]]; then
            error_exit "Corrige los errores de linting antes de deployar"
        fi
    }
    success "Linting completado"

    # TypeScript check
    info "Verificando TypeScript..."
    npx tsc --noEmit || {
        warning "TypeScript reportó errores"
        if [[ "$FORCE_DEPLOY" != true ]]; then
            error_exit "Corrige los errores de TypeScript antes de deployar"
        fi
    }
    success "TypeScript check completado"
}

# Ejecutar tests
run_tests() {
    if [[ "$SKIP_TESTS" == true ]]; then
        warning "Tests omitidos (--skip-tests)"
        return
    fi

    header "🧪 Ejecutando Tests"

    cd "$WEB_DIR"

    # Tests E2E si existen
    if [ -f "../playwright.config.ts" ]; then
        info "Ejecutando tests E2E..."
        cd "$PROJECT_ROOT"
        npm run test:e2e 2>&1 | tee -a "$LOG_FILE" || {
            warning "Tests E2E fallaron"
            if [[ "$FORCE_DEPLOY" != true ]]; then
                error_exit "Tests E2E deben pasar antes de deployar"
            fi
        }
        success "Tests E2E completados"
    else
        info "No hay tests E2E configurados"
    fi
}

# Build local
build_local() {
    header "🔨 Build Local de Verificación"

    cd "$WEB_DIR"

    info "Ejecutando build de Next.js..."
    npm run build || error_exit "Build falló - corrige los errores antes de deployar"

    success "Build local completado exitosamente"
}

# Deploy a Vercel
deploy_to_vercel() {
    header "🚀 Deployment a Vercel"

    cd "$PROJECT_ROOT"

    # Verificar autenticación con Vercel
    info "Verificando autenticación con Vercel..."
    vercel whoami &>/dev/null || {
        warning "No estás autenticado en Vercel"
        vercel login || error_exit "Fallo al autenticar con Vercel"
    }

    # Deploy
    info "Iniciando deployment a producción..."

    # Capturar URL del deployment
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | tee -a "$LOG_FILE" | grep -oE "https://[a-zA-Z0-9.-]+\.vercel\.app" | head -1)

    if [ -z "$DEPLOYMENT_URL" ]; then
        # Si no capturamos URL, intentar obtener el último deployment
        DEPLOYMENT_URL=$(vercel ls --limit 1 2>/dev/null | grep -oE "https://[a-zA-Z0-9.-]+\.vercel\.app" | head -1)
    fi

    if [ -n "$DEPLOYMENT_URL" ]; then
        success "Deployment completado: $DEPLOYMENT_URL"

        # Verificar que el sitio responde
        info "Verificando que el sitio está activo..."
        sleep 5
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")

        if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "304" ]; then
            success "Sitio verificado y activo (HTTP $HTTP_STATUS)"
        else
            warning "El sitio devolvió HTTP $HTTP_STATUS - verifica manualmente"
        fi
    else
        warning "Deployment completado pero no se pudo capturar la URL"
    fi
}

# Push cambios a Git
push_to_git() {
    header "📤 Push a Repositorio"

    cd "$PROJECT_ROOT"

    info "Haciendo push de cambios..."
    git push origin "$(git branch --show-current)" || warning "No se pudo hacer push (puede que ya esté actualizado)"

    success "Repositorio actualizado"
}

# Limpieza final
cleanup() {
    header "🧹 Limpieza"

    # Eliminar logs antiguos (mantener últimos 5)
    cd "$PROJECT_ROOT"
    ls -t deploy_*.log 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true

    info "Limpieza completada"
}

# Resumen final
show_summary() {
    header "📊 Resumen del Deployment"

    success "Deployment completado exitosamente!"
    echo
    info "📅 Timestamp: $(date)"
    info "📂 Branch: $(git branch --show-current)"
    info "📝 Último commit: $(git log -1 --format='%h - %s')"

    if [ -n "$DEPLOYMENT_URL" ]; then
        info "🌐 URL: $DEPLOYMENT_URL"
        info "🔗 Dominio personalizado: https://touchbase.sujeto10.com"
    fi

    echo
    success "¡Deployment completado con éxito! 🎉"
}

# Main execution
main() {
    clear
    echo
    log "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    log "${CYAN}║          TouchBase - Script de Deployment             ║${NC}"
    log "${CYAN}║                  $(date +'%Y-%m-%d %H:%M:%S')                    ║${NC}"
    log "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
    echo

    # Ejecutar pasos
    check_prerequisites
    check_git_status
    install_dependencies
    run_validations
    run_tests
    build_local
    deploy_to_vercel
    push_to_git
    cleanup
    show_summary

    # Eliminar log si todo salió bien
    rm -f "$LOG_FILE"
}

# Trap para manejar interrupciones
trap 'echo -e "\n${RED}❌ Deployment interrumpido${NC}"; exit 1' INT TERM

# Ejecutar script principal
main "$@"