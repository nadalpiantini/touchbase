#!/bin/bash

# =================================================================
# TouchBase Pre-Deploy Validation Script
# =================================================================
# Valida que todo esté listo antes del deployment
# Uso: ./scripts/validate-deploy.sh
# =================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuración
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$PROJECT_ROOT/web"
ERRORS=0
WARNINGS=0

# Funciones de utilidad
check() {
    echo -e "${CYAN}Verificando: $1...${NC}"
}

pass() {
    echo -e "${GREEN}  ✅ $1${NC}"
}

fail() {
    echo -e "${RED}  ❌ $1${NC}"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}  ⚠️  $1${NC}"
    ((WARNINGS++))
}

header() {
    echo
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
}

# Validaciones
validate_environment_files() {
    header "🔐 Variables de Entorno"

    check "Archivo .env.local en web/"

    if [ -f "$WEB_DIR/.env.local" ]; then
        pass "Archivo .env.local existe"

        # Verificar variables críticas
        REQUIRED_VARS=(
            "NEXT_PUBLIC_SUPABASE_URL"
            "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        )

        for VAR in "${REQUIRED_VARS[@]}"; do
            if grep -q "^$VAR=" "$WEB_DIR/.env.local"; then
                pass "$VAR está definida"
            else
                fail "$VAR no está definida"
            fi
        done
    else
        fail "Archivo .env.local no existe"
        echo "    Crea el archivo basándote en .env.example"
    fi
}

validate_git_status() {
    header "📊 Estado de Git"

    cd "$PROJECT_ROOT"

    check "Branch actual"
    BRANCH=$(git branch --show-current)
    if [[ "$BRANCH" == "master" ]] || [[ "$BRANCH" == "main" ]]; then
        pass "En branch principal: $BRANCH"
    else
        warn "No estás en el branch principal: $BRANCH"
    fi

    check "Cambios no comiteados"
    if git diff-index --quiet HEAD -- 2>/dev/null; then
        pass "No hay cambios sin commitear"
    else
        warn "Hay cambios sin commitear"
        git status --short | head -5
    fi

    check "Sincronización con remoto"
    git fetch origin -q
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
    BASE=$(git merge-base @ @{u} 2>/dev/null || echo "")

    if [ -z "$REMOTE" ]; then
        warn "No hay branch remoto configurado"
    elif [ "$LOCAL" = "$REMOTE" ]; then
        pass "Branch sincronizado con remoto"
    elif [ "$LOCAL" = "$BASE" ]; then
        warn "Branch está detrás del remoto"
    elif [ "$REMOTE" = "$BASE" ]; then
        pass "Branch está adelante del remoto"
    else
        fail "Branch ha divergido del remoto"
    fi
}

validate_dependencies() {
    header "📦 Dependencias"

    check "Node.js"
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        pass "Node.js instalado: $NODE_VERSION"

        # Verificar versión mínima (18+)
        MAJOR_VERSION=$(echo "$NODE_VERSION" | grep -oE '[0-9]+' | head -1)
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            pass "Versión de Node.js compatible"
        else
            fail "Se requiere Node.js 18 o superior"
        fi
    else
        fail "Node.js no está instalado"
    fi

    check "npm"
    if command -v npm &> /dev/null; then
        pass "npm instalado: $(npm -v)"
    else
        fail "npm no está instalado"
    fi

    check "Vercel CLI"
    if command -v vercel &> /dev/null; then
        pass "Vercel CLI instalado: $(vercel --version)"
    else
        warn "Vercel CLI no está instalado (se instalará automáticamente)"
    fi

    check "Dependencias del proyecto"
    cd "$WEB_DIR"
    if [ -f "package.json" ]; then
        pass "package.json existe"

        if [ -f "package-lock.json" ]; then
            pass "package-lock.json existe"
        else
            warn "package-lock.json no existe (se creará al instalar)"
        fi

        # Verificar si node_modules existe
        if [ -d "node_modules" ]; then
            pass "node_modules existe"
        else
            warn "node_modules no existe (ejecuta npm install)"
        fi
    else
        fail "package.json no existe en web/"
    fi
}

validate_code_quality() {
    header "🔧 Calidad del Código"

    cd "$WEB_DIR"

    check "Configuración de ESLint"
    if [ -f ".eslintrc.json" ] || [ -f "eslint.config.js" ] || [ -f ".eslintrc.js" ]; then
        pass "ESLint está configurado"
    else
        warn "ESLint no parece estar configurado"
    fi

    check "Configuración de TypeScript"
    if [ -f "tsconfig.json" ]; then
        pass "TypeScript está configurado"

        # Verificar compilación
        echo -e "${CYAN}  Verificando compilación TypeScript...${NC}"
        if npx tsc --noEmit 2>/dev/null; then
            pass "TypeScript compila sin errores"
        else
            warn "TypeScript tiene errores de compilación"
        fi
    else
        fail "tsconfig.json no existe"
    fi

    check "Scripts de npm"
    REQUIRED_SCRIPTS=("dev" "build" "lint")
    for SCRIPT in "${REQUIRED_SCRIPTS[@]}"; do
        if grep -q "\"$SCRIPT\":" package.json; then
            pass "Script '$SCRIPT' está definido"
        else
            fail "Script '$SCRIPT' no está definido"
        fi
    done
}

validate_vercel_config() {
    header "🚀 Configuración de Vercel"

    check "vercel.json"
    if [ -f "$PROJECT_ROOT/vercel.json" ]; then
        pass "vercel.json existe"

        # Verificar configuración básica
        if grep -q '"framework": "nextjs"' "$PROJECT_ROOT/vercel.json"; then
            pass "Framework configurado como Next.js"
        else
            warn "Framework no está configurado como Next.js"
        fi

        if grep -q '"buildCommand"' "$PROJECT_ROOT/vercel.json"; then
            pass "Build command está definido"
        else
            fail "Build command no está definido"
        fi
    else
        fail "vercel.json no existe"
    fi

    check "Directorio .vercel"
    if [ -d "$PROJECT_ROOT/.vercel" ]; then
        pass "Proyecto vinculado con Vercel"

        if [ -f "$PROJECT_ROOT/.vercel/project.json" ]; then
            pass "project.json existe"
            PROJECT_ID=$(grep -o '"projectId":"[^"]*' "$PROJECT_ROOT/.vercel/project.json" | cut -d'"' -f4)
            if [ -n "$PROJECT_ID" ]; then
                pass "Project ID: $PROJECT_ID"
            fi
        else
            fail "project.json no existe"
        fi
    else
        warn "Proyecto no está vinculado con Vercel (ejecuta 'vercel link')"
    fi

    check "Autenticación con Vercel"
    if vercel whoami &>/dev/null; then
        USER=$(vercel whoami 2>/dev/null)
        pass "Autenticado como: $USER"
    else
        fail "No estás autenticado en Vercel"
    fi
}

validate_github_actions() {
    header "🔄 GitHub Actions"

    check "Workflows de CI/CD"
    if [ -d "$PROJECT_ROOT/.github/workflows" ]; then
        pass "Directorio de workflows existe"

        WORKFLOW_COUNT=$(ls -1 "$PROJECT_ROOT/.github/workflows"/*.yml 2>/dev/null | wc -l)
        if [ "$WORKFLOW_COUNT" -gt 0 ]; then
            pass "Se encontraron $WORKFLOW_COUNT workflow(s)"

            # Verificar si hay workflow de deploy
            if ls "$PROJECT_ROOT/.github/workflows"/*.yml | xargs grep -l "deploy\|vercel" &>/dev/null; then
                pass "Workflow de deployment configurado"
            else
                warn "No se encontró workflow de deployment"
            fi
        else
            warn "No hay workflows configurados"
        fi
    else
        warn "No existe directorio .github/workflows"
    fi
}

validate_build() {
    header "🔨 Build de Verificación"

    cd "$WEB_DIR"

    check "Build de Next.js"
    echo -e "${CYAN}  Ejecutando build de prueba (puede tomar un momento)...${NC}"

    # Crear archivo temporal para capturar errores
    BUILD_OUTPUT="/tmp/build_output_$$.txt"

    if npm run build > "$BUILD_OUTPUT" 2>&1; then
        pass "Build completado exitosamente"
        rm -f "$BUILD_OUTPUT"
    else
        fail "Build falló"
        echo -e "${RED}Errores del build:${NC}"
        tail -20 "$BUILD_OUTPUT"
        rm -f "$BUILD_OUTPUT"
    fi
}

validate_supabase() {
    header "🗄️ Conexión con Supabase"

    check "Variables de Supabase"
    if [ -f "$WEB_DIR/.env.local" ]; then
        SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$WEB_DIR/.env.local" | cut -d'=' -f2)
        SUPABASE_KEY=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$WEB_DIR/.env.local" | cut -d'=' -f2)

        if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
            pass "Variables de Supabase configuradas"

            # Verificar que la URL es válida
            if [[ "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
                pass "URL de Supabase tiene formato válido"

                # Verificar conectividad
                check "Conectividad con Supabase"
                if curl -s "$SUPABASE_URL/rest/v1/" -H "apikey: $SUPABASE_KEY" -o /dev/null -w "%{http_code}" | grep -q "200\|401"; then
                    pass "Conexión con Supabase exitosa"
                else
                    warn "No se pudo verificar la conexión con Supabase"
                fi
            else
                warn "URL de Supabase no tiene el formato esperado"
            fi
        else
            fail "Variables de Supabase no están configuradas"
        fi
    else
        fail "No se puede verificar Supabase sin .env.local"
    fi
}

# Resumen final
show_summary() {
    header "📊 Resumen de Validación"

    echo
    if [ "$ERRORS" -eq 0 ]; then
        if [ "$WARNINGS" -eq 0 ]; then
            echo -e "${GREEN}✅ TODAS LAS VALIDACIONES PASARON${NC}"
            echo -e "${GREEN}El proyecto está listo para deployment!${NC}"
        else
            echo -e "${GREEN}✅ Validaciones críticas pasaron${NC}"
            echo -e "${YELLOW}⚠️  Se encontraron $WARNINGS advertencias${NC}"
            echo -e "${CYAN}Puedes proceder con el deployment, pero revisa las advertencias${NC}"
        fi
    else
        echo -e "${RED}❌ VALIDACIÓN FALLÓ${NC}"
        echo -e "${RED}Se encontraron $ERRORS errores críticos${NC}"
        if [ "$WARNINGS" -gt 0 ]; then
            echo -e "${YELLOW}También hay $WARNINGS advertencias${NC}"
        fi
        echo -e "${CYAN}Corrige los errores antes de hacer deployment${NC}"
    fi

    echo
    echo -e "${CYAN}Para hacer deployment, ejecuta:${NC}"
    echo -e "${GREEN}  ./scripts/deploy.sh${NC}"
    echo
}

# Main
main() {
    clear
    echo
    echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     TouchBase - Validación Pre-Deploy                 ║${NC}"
    echo -e "${CYAN}║                  $(date +'%Y-%m-%d %H:%M:%S')                    ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"

    validate_environment_files
    validate_git_status
    validate_dependencies
    validate_code_quality
    validate_vercel_config
    validate_github_actions
    validate_build
    validate_supabase

    show_summary

    # Return exit code basado en errores
    exit "$ERRORS"
}

# Ejecutar
main "$@"