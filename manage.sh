#!/bin/bash

# Script de administración para la aplicación Generador de Contraseñas
# Autor: Claude
# Fecha: $(date +%Y-%m-%d)

# Colores para mensajes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorios de la aplicación
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$APP_DIR/password-generator-react"
BACKEND_DIR="$APP_DIR/password-generator-react/backend"
PID_DIR="$FRONTEND_DIR/.pid"
LOG_DIR="$FRONTEND_DIR"

# Archivos de PID y logs
FRONTEND_PID_FILE="$PID_DIR/frontend.pid"
BACKEND_PID_FILE="$PID_DIR/backend.pid"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_LOG="$LOG_DIR/backend.log"

# Asegurar que existe el directorio PID
mkdir -p "$PID_DIR"

# Función para imprimir encabezado
print_header() {
    echo -e "${BLUE}==========================================${NC}"
    echo -e "${BLUE}    Generador de Contraseñas Seguras     ${NC}"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
}

# Función para verificar si el proceso está en ejecución
is_running() {
    local pid_file=$1
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null; then
            return 0 # Proceso en ejecución
        fi
    fi
    return 1 # Proceso no está en ejecución
}

# Función para iniciar el frontend
start_frontend() {
    echo -e "${YELLOW}Iniciando Frontend...${NC}"
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${RED}El Frontend ya está en ejecución (PID: $(cat $FRONTEND_PID_FILE))${NC}"
        return 1
    fi
    
    cd "$FRONTEND_DIR" || exit 1
    
    # Iniciamos el frontend y guardamos el PID
    npm start > "$FRONTEND_LOG" 2>&1 &
    echo $! > "$FRONTEND_PID_FILE"
    
    sleep 2
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${GREEN}Frontend iniciado correctamente (PID: $(cat $FRONTEND_PID_FILE))${NC}"
        echo -e "${GREEN}Frontend disponible en: http://localhost:3000${NC}"
    else
        echo -e "${RED}Error al iniciar el Frontend${NC}"
        echo -e "${RED}Verifica los logs en: $FRONTEND_LOG${NC}"
        return 1
    fi
}

# Función para iniciar el backend
start_backend() {
    echo -e "${YELLOW}Iniciando Backend...${NC}"
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${RED}El Backend ya está en ejecución (PID: $(cat $BACKEND_PID_FILE))${NC}"
        return 1
    fi
    
    cd "$BACKEND_DIR" || exit 1
    
    # Iniciamos el backend y guardamos el PID
    node server.js > "$BACKEND_LOG" 2>&1 &
    echo $! > "$BACKEND_PID_FILE"
    
    sleep 2
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${GREEN}Backend iniciado correctamente (PID: $(cat $BACKEND_PID_FILE))${NC}"
        echo -e "${GREEN}API disponible en: http://localhost:5001${NC}"
    else
        echo -e "${RED}Error al iniciar el Backend${NC}"
        echo -e "${RED}Verifica los logs en: $BACKEND_LOG${NC}"
        return 1
    fi
}

# Función para detener el frontend
stop_frontend() {
    echo -e "${YELLOW}Deteniendo Frontend...${NC}"
    
    if is_running "$FRONTEND_PID_FILE"; then
        local pid=$(cat "$FRONTEND_PID_FILE")
        
        # Enviar señal de terminación
        kill "$pid" 2>/dev/null
        
        # Esperar a que termine
        local count=0
        while ps -p "$pid" > /dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Si sigue en ejecución, forzar terminación
        if ps -p "$pid" > /dev/null; then
            echo -e "${YELLOW}Forzando terminación del Frontend${NC}"
            kill -9 "$pid" 2>/dev/null
        fi
        
        rm -f "$FRONTEND_PID_FILE"
        echo -e "${GREEN}Frontend detenido correctamente${NC}"
    else
        echo -e "${RED}El Frontend no está en ejecución${NC}"
    fi
}

# Función para detener el backend
stop_backend() {
    echo -e "${YELLOW}Deteniendo Backend...${NC}"
    
    if is_running "$BACKEND_PID_FILE"; then
        local pid=$(cat "$BACKEND_PID_FILE")
        
        # Enviar señal de terminación
        kill "$pid" 2>/dev/null
        
        # Esperar a que termine
        local count=0
        while ps -p "$pid" > /dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
        done
        
        # Si sigue en ejecución, forzar terminación
        if ps -p "$pid" > /dev/null; then
            echo -e "${YELLOW}Forzando terminación del Backend${NC}"
            kill -9 "$pid" 2>/dev/null
        fi
        
        rm -f "$BACKEND_PID_FILE"
        echo -e "${GREEN}Backend detenido correctamente${NC}"
    else
        echo -e "${RED}El Backend no está en ejecución${NC}"
    fi
}

# Función para mostrar el estado
show_status() {
    echo -e "${YELLOW}Estado de los servicios:${NC}"
    
    if is_running "$FRONTEND_PID_FILE"; then
        echo -e "${GREEN}Frontend: En ejecución (PID: $(cat $FRONTEND_PID_FILE))${NC}"
        echo -e "${GREEN}URL: http://localhost:3000${NC}"
    else
        echo -e "${RED}Frontend: Detenido${NC}"
    fi
    
    if is_running "$BACKEND_PID_FILE"; then
        echo -e "${GREEN}Backend: En ejecución (PID: $(cat $BACKEND_PID_FILE))${NC}"
        echo -e "${GREEN}API URL: http://localhost:5001${NC}"
    else
        echo -e "${RED}Backend: Detenido${NC}"
    fi
}

# Función para mostrar los logs
show_logs() {
    local service=$1
    
    case "$service" in
        frontend)
            echo -e "${YELLOW}Log del Frontend (últimas 20 líneas):${NC}"
            if [ -f "$FRONTEND_LOG" ]; then
                tail -n 20 "$FRONTEND_LOG"
            else
                echo -e "${RED}No existe archivo de log para el Frontend${NC}"
            fi
            ;;
        backend)
            echo -e "${YELLOW}Log del Backend (últimas 20 líneas):${NC}"
            if [ -f "$BACKEND_LOG" ]; then
                tail -n 20 "$BACKEND_LOG"
            else
                echo -e "${RED}No existe archivo de log para el Backend${NC}"
            fi
            ;;
        *)
            echo -e "${RED}Servicio desconocido: $service${NC}"
            echo -e "${YELLOW}Opciones válidas: frontend, backend${NC}"
            ;;
    esac
}

# Función para reiniciar servicios
restart_service() {
    local service=$1
    
    case "$service" in
        frontend)
            echo -e "${YELLOW}Reiniciando Frontend...${NC}"
            stop_frontend
            sleep 2
            start_frontend
            ;;
        backend)
            echo -e "${YELLOW}Reiniciando Backend...${NC}"
            stop_backend
            sleep 2
            start_backend
            ;;
        all)
            echo -e "${YELLOW}Reiniciando todos los servicios...${NC}"
            stop_frontend
            stop_backend
            sleep 2
            start_backend
            start_frontend
            ;;
        *)
            echo -e "${RED}Servicio desconocido: $service${NC}"
            echo -e "${YELLOW}Opciones válidas: frontend, backend, all${NC}"
            ;;
    esac
}

# Función para instalar dependencias
install_dependencies() {
    echo -e "${YELLOW}Instalando dependencias...${NC}"
    
    cd "$FRONTEND_DIR" || exit 1
    echo -e "${YELLOW}Instalando dependencias del Frontend...${NC}"
    npm install
    
    cd "$BACKEND_DIR" || exit 1
    echo -e "${YELLOW}Instalando dependencias del Backend...${NC}"
    npm install
    
    echo -e "${GREEN}Dependencias instaladas correctamente${NC}"
}

# Función para construir la aplicación
build_app() {
    echo -e "${YELLOW}Construyendo la aplicación para producción...${NC}"
    
    cd "$FRONTEND_DIR" || exit 1
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Aplicación construida correctamente${NC}"
    else
        echo -e "${RED}Error al construir la aplicación${NC}"
    fi
}

# Función de ayuda
show_help() {
    echo -e "Uso: $0 <comando> [opciones]"
    echo -e ""
    echo -e "Comandos:"
    echo -e "  start             Inicia tanto el frontend como el backend"
    echo -e "  start-frontend    Inicia sólo el frontend"
    echo -e "  start-backend     Inicia sólo el backend"
    echo -e "  stop              Detiene todos los servicios"
    echo -e "  stop-frontend     Detiene sólo el frontend"
    echo -e "  stop-backend      Detiene sólo el backend"
    echo -e "  restart           Reinicia todos los servicios"
    echo -e "  restart-frontend  Reinicia sólo el frontend"
    echo -e "  restart-backend   Reinicia sólo el backend"
    echo -e "  status            Muestra el estado actual de los servicios"
    echo -e "  logs <servicio>   Muestra los logs (frontend o backend)"
    echo -e "  install           Instala todas las dependencias"
    echo -e "  build             Construye la aplicación para producción"
    echo -e "  help              Muestra esta ayuda"
    echo -e ""
}

# Función principal
main() {
    print_header
    
    if [ $# -eq 0 ]; then
        show_help
        exit 1
    fi
    
    case "$1" in
        start)
            start_backend
            start_frontend
            ;;
        start-frontend)
            start_frontend
            ;;
        start-backend)
            start_backend
            ;;
        stop)
            stop_frontend
            stop_backend
            ;;
        stop-frontend)
            stop_frontend
            ;;
        stop-backend)
            stop_backend
            ;;
        restart)
            restart_service all
            ;;
        restart-frontend)
            restart_service frontend
            ;;
        restart-backend)
            restart_service backend
            ;;
        status)
            show_status
            ;;
        logs)
            if [ $# -lt 2 ]; then
                echo -e "${RED}Error: Debes especificar el servicio (frontend o backend)${NC}"
                exit 1
            fi
            show_logs "$2"
            ;;
        install)
            install_dependencies
            ;;
        build)
            build_app
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            echo -e "${RED}Comando desconocido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal con los argumentos proporcionados
main "$@"
